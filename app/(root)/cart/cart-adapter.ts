// cart.adapters.ts
import { CartItem, MiniCartView } from "@/types";

export function viewItemToCartItem(i: MiniCartView["items"][number]): CartItem {
  return {
    productId: i.productId,
    variantId: i.variantId,
    variantType: i.variantType,
    benefitType: i.benefitType,
    name: i.name,
    slug: i.slug,
    qty: 1,
    image: i.image,
    price: BigInt(i.price),
  };
}
