import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert Prisma Object to JSON
export function convertToPlainJSON<T>(value: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replacer = (key: string, value: any) =>
    typeof value === "bigint" ? value.toString() : value;

  return JSON.parse(JSON.stringify(value, replacer));
}
