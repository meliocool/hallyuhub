"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainJSON, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

// const calcPrice = (items: CartItem[]) => {
//   const itemsPrice = round2(
//     items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
//   ),
// };

export async function addItemToCart(data: CartItem) {
  try {
    // Check cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // const cart = await getMyCart();

    // VALIDAAAATEEEE w GENERAL ZOD
    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: { id: item.productId },
      include: {
        variants: true,
      },
    });

    // TESTING
    console.log({
      "Session Card Id": sessionCartId,
      "User Id": userId,
      "Item Requested": item,
      "Product Found": product,
    });

    return {
      success: true,
      message: "Item added to Cart!",
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
  if (!sessionCartId) throw new Error("Cart session not found!");

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
