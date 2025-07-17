import { z } from "zod";
import { insertProductSchema } from "@/lib/validators";

export type InsertProductPayload = z.infer<typeof insertProductSchema>;

export type Product = Omit<InsertProductPayload, "price"> & {
  id: string;
  rating: string;
  price: string;
  createdAt: Date;
  updatedAt: Date;
};
