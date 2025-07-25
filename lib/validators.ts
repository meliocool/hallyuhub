import { z } from "zod";

const priceStuff = z.coerce.bigint().nonnegative("Price cannot be negative");

const productVariantSchema = z.object({
  variantType: z.string().min(1, { message: "Variant type is required" }),
  benefitType: z.string().nullable(),
  price: priceStuff,
  stock: z.coerce
    .number()
    .int()
    .min(0, { message: "Stock must be a positive integer" }),
});

// Schema to Insert a Product
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters!"),
  slug: z.string().min(3, "Slug must be at least 3 characters!"),
  category: z.string().min(3, "Category must be at least 3 characters!"),
  description: z.string().min(3, "Description must be at least 3 characters!"),
  images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  groupName: z.string().min(3, "Group Name must be at least 3 characters!"),
  company: z.string().min(3, "Company must be at least 3 characters!"),
  variants: z
    .array(productVariantSchema)
    .min(1, { message: "At least one product variant is required!" }),
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

// Cart Schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required!"),
  variantId: z.string().min(1, "Variant is required!"),
  variantType: z.string().optional(),
  benefitType: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required!"),
  slug: z.string().min(1, "Slug is required!"),
  qty: z.number().int().nonnegative("Quantity must be a positive number!"),
  image: z.string().min(1, "Image is required!"),
  price: priceStuff,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: priceStuff,
  totalPrice: priceStuff,
  shippingPrice: priceStuff,
  taxPrice: priceStuff,
  sessionCartId: z.string().min(1, "Session Cart Id is required!"),
  userId: z.string().optional().nullable(),
});
