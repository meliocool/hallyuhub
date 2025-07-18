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

// Format Errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === "ZodError") {
    // Handle Zod Error
    const errorFields = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );
    return errorFields.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // Handle Prisma Error
    const errorField = error.meta?.target ? error.meta.target[0] : "Field";
    return `${
      errorField.charAt(0).toUppercase() + errorField.slice(1)
    } already exists!`;
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}
