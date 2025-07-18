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

// Schema for Users Sign In
export const signInFormSchema = z.object({
  email: z.email("Invalid Email Address"),
  password: z.string().min(6, "Password must be at least 6 characters!"),
});

// Schema for Users Sign Up
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters!"),
    email: z.email("Invalid Email Address"),
    password: z.string().min(6, "Password must be at least 6 characters!"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match!",
    path: ["confirmPassword"],
  });
