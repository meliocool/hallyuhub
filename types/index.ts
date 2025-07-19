import { z } from "zod";
import {
  insertProductSchema,
  cartItemSchema,
  insertCartSchema,
} from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/library";

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
