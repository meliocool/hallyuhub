"use server";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { prisma } from "@/db/prisma";
import { convertToPlainJSON } from "@/lib/utils";

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    include: {
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainJSON(data);
}

// Get single Product by Slug
export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findUnique({
    where: { slug: slug },
    include: {
      variants: true,
    },
  });
  return convertToPlainJSON(data);
}
