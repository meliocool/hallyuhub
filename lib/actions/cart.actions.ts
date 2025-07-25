"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainJSON, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";
import { TAX_RATE } from "../constants";
import { revalidatePath } from "next/cache";
import {
  CartItem as PrismaCartItem,
  ProductVariant,
} from "../generated/prisma";

type CartItemWithVariant = PrismaCartItem & {
  variant: ProductVariant;
};

const calcPrice = (items: CartItemWithVariant[]) => {
  const itemsPrice = items.reduce(
    (acc, item) => acc + BigInt(item.variant.price) * BigInt(item.quantity),
    0n
  );
  // TODO -> Shipping Price beneran Integrated with Google API (Kalo gratis rofl)
  const shippingPrice = 0n; // ! Default Value dulu
  const taxPrice = (itemsPrice * TAX_RATE) / 100n;
  const totalPrice = itemsPrice + shippingPrice + taxPrice; // TODO -> + SHipping Price as well
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

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
      updatedCartWithItems.items as CartItemWithVariant[]
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

export async function getMyCart() {
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
    items: cart.cartItems,
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
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
        updatedCartWithItems.items as CartItemWithVariant[]
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
