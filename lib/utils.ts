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
    // GENERAL ZOD Error
    const errorFields = Object.keys(error.issues).map(
      (field) => error.issues[field].message
    );
    return errorFields.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // Prisma Error
    const errorField = error.meta?.target ? error.meta.target[0] : "Field";
    return `${
      errorField.charAt(0).toUpperCase() + errorField.slice(1)
    } already exists!`;
  } else {
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is neither Number nor String");
  }
}
