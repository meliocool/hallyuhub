import { z } from "zod";

// Schema to Insert a Product
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters!"),
  slug: z.string().min(3, "Slug must be at least 3 characters!"),
  category: z.string().min(3, "Category must be at least 3 characters!"),
  description: z.string().min(3, "Description must be at least 3 characters!"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  groupName: z.string().min(3, "Group Name must be at least 3 characters!"),
  company: z.string().min(3, "Company must be at least 3 characters!"),
  version: z.string().min(3, "Version must be at least 3 characters!"),
  price: z.coerce.bigint().min(1n, "Price must be at least Rp 1"),
});
