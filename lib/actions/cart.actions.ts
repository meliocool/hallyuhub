"use server";

import { CartItem, GetMyCartResult, MiniCartLine, MiniCartView } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainJSON, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, shippingAddressSchema } from "../validators";
import { HOME_LAT_LNG, TAX_RATE } from "../constants";
import { revalidatePath } from "next/cache";
import { geocodeViaApiRoute, haversineKm, shippingFeeByKm } from "../geo";
import { updateUserAddress } from "./user.actions";
// import {
//   CartItem as PrismaCartItem,
//   ProductVariant,
// } from "../generated/prisma";

// type CartItemWithVariant = PrismaCartItem & {
//   variant: ProductVariant;
// };

// const calcPrice = (items: CartItemWithVariant[]) => {
//   const itemsPrice = items.reduce(
//     (acc, item) => acc + BigInt(item.variant.price) * BigInt(item.quantity),
//     0n
//   );
//   // TODO -> Shipping Price beneran Integrated with Google API (Kalo gratis rofl)
//   const shippingPrice = 0n; // ! Default Value dulu
//   const taxPrice = (itemsPrice * TAX_RATE) / 100n;
//   const totalPrice = itemsPrice + shippingPrice + taxPrice; // TODO -> + SHipping Price as well
//   return {
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     totalPrice,
//   };
// };

type CartItemForTotals = { price: bigint | string | number; quantity: number };

const toBI = (v: unknown): bigint => {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string" && v !== "") return BigInt(v);
  return 0n;
};

const calcPrice = (
  items: CartItemForTotals[],
  shippingPriceBI: bigint = 0n
) => {
  const itemsPrice = items.reduce(
    (acc, item) => acc + toBI(item.price) * BigInt(item.quantity),
    0n
  );
  const taxRateBI = typeof TAX_RATE === "bigint" ? TAX_RATE : BigInt(TAX_RATE);
  const shippingPrice = shippingPriceBI;
  const taxPrice = (itemsPrice * taxRateBI) / 100n;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export async function applyShippingAddressAndRepriceCart(input: {
  address: {
    fullName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  saveToProfile: boolean;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId && !userId) throw new Error("Cart session not found.");

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
      include: {
        cartItems: {
          include: {
            variant: true,
          },
        },
      },
    });
    if (!cart) throw new Error("Cart not found.");

    const addr = shippingAddressSchema.parse(input.address);

    let { lat, lng } = addr;
    let displayName: string | undefined;
    if (lat == null || lng == null) {
      const q = `${addr.streetAddress}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
      const geo = await geocodeViaApiRoute(q);
      if (!geo) throw new Error("Failed to geocode address.");
      lat = geo.lat;
      lng = geo.lng;
      displayName = geo.displayName;
    }

    if (
      !Number.isFinite(HOME_LAT_LNG.lat) ||
      !Number.isFinite(HOME_LAT_LNG.lng)
    ) {
      throw new Error("HOME_LAT/HOME_LNG not set.");
    }

    const km = haversineKm(HOME_LAT_LNG, { lat, lng });
    const shippingBI = shippingFeeByKm(km);

    const itemsForTotals: CartItemForTotals[] = cart.cartItems.map((i) => ({
      price: i.price,
      quantity: i.quantity,
    }));
    const totals = calcPrice(itemsForTotals, shippingBI);

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        itemsPrice: totals.itemsPrice,
        shippingPrice: totals.shippingPrice,
        taxPrice: totals.taxPrice,
        totalPrice: totals.totalPrice,
      },
    });

    if (input.saveToProfile && userId) {
      const saveRes = await updateUserAddress({
        ...addr,
        lat,
        lng,
      });

      if (!saveRes?.success)
        console.warn("[savetoprofile] Failed: ", saveRes?.message);
    }

    return {
      success: true,
      message: "Shipping applied.",
      distanceKm: Number(km.toFixed(2)),
      itemsPrice: totals.itemsPrice.toString(),
      taxPrice: totals.taxPrice.toString(),
      shippingPrice: totals.shippingPrice.toString(),
      totalPrice: totals.totalPrice.toString(),
      normalizedAddress: {
        ...addr,
        lat,
        lng,
        ...(displayName && { displayName }),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to apply shipping.",
    };
  }
}

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session Not Found!");

    const session = await auth();
    const userId = session?.user?.id;

    const item = cartItemSchema.parse(data);

    const variant = await prisma.productVariant.findUnique({
      where: {
        id: item.variantId,
      },
    });
    if (!variant) throw new Error("Variant does not exist!");
    if (variant.stock < item.qty) throw new Error("This Variant is Sold Out!");

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (!cart) {
      const cartData: {
        sessionCartId: string;
        itemsPrice: bigint;
        shippingPrice: bigint;
        taxPrice: bigint;
        totalPrice: bigint;
        userId?: string | null;
      } = {
        sessionCartId,
        itemsPrice: 0n,
        shippingPrice: 0n,
        taxPrice: 0n,
        totalPrice: 0n,
      };
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (user) {
          cartData.userId = userId;
        }
      }
      cart = await prisma.cart.create({
        data: cartData,
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: item.variantId,
        },
      },
    });

    await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: item.variantId,
        },
      },
      update: {
        quantity: {
          increment: item.qty,
        },
      },
      create: {
        cartId: cart.id,
        productVariantId: item.variantId,
        quantity: item.qty,
        price: item.price,
      },
    });

    const updatedCartWithItems = await getMyCart();

    if (!updatedCartWithItems) {
      throw new Error("Could not retrieve cart after update");
    }
    const newTotals = calcPrice(
      updatedCartWithItems.items as unknown as CartItemForTotals[]
    );
    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: newTotals,
    });

    revalidatePath(`/product/${item.slug}`);
    revalidatePath(`/cart`);

    return {
      success: true,
      message: existingItem
        ? `${item.name} quantity updated in cart!`
        : `${item.name} added to cart!`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart(): Promise<GetMyCartResult> {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
    include: {
      cartItems: {
        include: {
          variant: true,
        },
      },
    },
  });

  if (!cart) return undefined;

  return convertToPlainJSON({
    ...cart,
    items: cart.cartItems.map((ci) => ({
      productVariantId: ci.productVariantId,
      quantity: ci.quantity,
      price: ci.price,
    })),
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function getMyMiniCartView(): Promise<MiniCartView> {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) return { items: [], total: 0 };
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
    include: {
      cartItems: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return { items: [], total: 0 };

  const items: MiniCartLine[] = cart.cartItems.map((ci) => {
    const v = ci.variant;
    const p = v.product;

    const unitPrice = Number(ci.price ?? v.price);
    const image = v.images?.[0] ?? p.images?.[0];

    return {
      productId: p.id,
      variantId: v.id,
      name: p.name,
      slug: p.slug,
      variantType: v.variantType,
      benefitType: v.benefitType ?? null,
      image,
      qty: ci.quantity,
      price: unitPrice,
      stock: v.stock,
    };
  });

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return { items, total };
}

export async function removeItemFromCart(variantId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variantId,
        },
      },
    });

    if (!existingItem) throw new Error("Item not found in Cart!");

    if (existingItem.quantity > 1) {
      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    } else {
      await prisma.cartItem.delete({
        where: {
          id: existingItem.id,
        },
      });
    }

    const updatedCartWithItems = await getMyCart();
    if (!updatedCartWithItems) {
      // TODO -> Delete the Parent Cart if its empty or just do this:
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          itemsPrice: 0n,
          shippingPrice: 0n,
          taxPrice: 0n,
          totalPrice: 0n,
        },
      });
    } else {
      const newTotals = calcPrice(
        updatedCartWithItems.items as unknown as CartItemForTotals[]
      );
      await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: newTotals,
      });
    }

    revalidatePath("/cart");

    return {
      success: true,
      message: "Cart updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteItemFromCart(variantId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variantId,
        },
      },
    });

    if (!existingItem) {
      return { success: true, message: "Item already removed" };
    }

    await prisma.cartItem.delete({
      where: { id: existingItem.id },
    });

    const updatedCartWithItems = await getMyCart();
    if (!updatedCartWithItems) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          itemsPrice: 0n,
          shippingPrice: 0n,
          taxPrice: 0n,
          totalPrice: 0n,
        },
      });
    } else {
      const newTotals = calcPrice(
        updatedCartWithItems.items as unknown as {
          price: bigint | string | number;
          quantity: number;
        }[]
      );
      await prisma.cart.update({
        where: { id: cart.id },
        data: newTotals,
      });
    }

    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
