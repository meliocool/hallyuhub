export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Hallyuhub";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Modern E-Commerce Platform to buy K-Pop Merch built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 10;
export const SIGNIN_DEFAULT_VALUES = {
  email: "",
  password: "",
};
