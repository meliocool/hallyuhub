import { z } from "zod";
import {
  insertProductSchema,
  cartItemSchema,
  insertCartSchema,
  shippingAddressSchema,
} from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/library";
import type { ControllerRenderProps } from "react-hook-form";

export type InsertProductPayload = z.infer<typeof insertProductSchema>;

export type ProductVariant = {
  id: string;
  variantType: string;
  benefitType: string | null;
  price: bigint;
  stock: number;
  images: string[];
};

export type Product = Omit<InsertProductPayload, "variants"> & {
  id: string;
  rating: Decimal;
  createdAt: Date;
  updatedAt: Date;
  numReviews: number;
  variants: ProductVariant[];
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type GetMyCartItem = { productVariantId: string; quantity: number };
export type GetMyCartResult =
  | {
      id: string;
      items: GetMyCartItem[];
      itemsPrice: string;
      totalPrice: string;
      shippingPrice: string;
      taxPrice: string;
    }
  | undefined;

export type MiniCartLine = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  variantType?: string;
  benefitType?: string | null;
  image: string;
  qty: number;
  price: number;
  stock: number;
};

export type MiniCartView = {
  items: MiniCartLine[];
  total: number;
};

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Render Param Types
export type FullNameField = ControllerRenderProps<
  z.infer<typeof shippingAddressSchema>,
  "fullName"
>;
export type StreetAddressField = ControllerRenderProps<
  z.infer<typeof shippingAddressSchema>,
  "streetAddress"
>;
export type CityField = ControllerRenderProps<
  z.infer<typeof shippingAddressSchema>,
  "city"
>;
export type PostalCodeField = ControllerRenderProps<
  z.infer<typeof shippingAddressSchema>,
  "postalCode"
>;
export type CountryField = ControllerRenderProps<
  z.infer<typeof shippingAddressSchema>,
  "country"
>;
