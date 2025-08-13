"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { geocodeViaApiRoute, haversineKm, shippingFeeByKm } from "../geo";
import { HOME_LAT_LNG } from "../constants";
import { Prisma } from "../generated/prisma";

// Sign in user with Credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in success!" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid Credentials!" };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut();
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return {
      success: true,
      message: "User Registered Successfully!",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

// Get User By ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("User Not Found!");
  }
  return user;
}

// Update the user's address
function buildQuery(parts: Array<string | undefined>) {
  return parts
    .filter(Boolean)
    .map((s) => s!.trim())
    .join(", ");
}

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error("User Not Found!");

    const address = shippingAddressSchema.parse(data);

    let lat = address.lat ?? null;
    let lng = address.lng ?? null;
    let displayName: string | undefined;

    if (lat == null || lng == null) {
      const q1 = buildQuery([
        address.streetAddress,
        address.city,
        address.postalCode,
        address.country,
      ]);
      let geo = await geocodeViaApiRoute(q1);

      if (!geo) {
        const q2 = buildQuery([
          address.streetAddress,
          address.city,
          address.country,
        ]);
        geo = await geocodeViaApiRoute(q2);
      }
      if (!geo) {
        const q3 = buildQuery([address.city, address.country]);
        geo = await geocodeViaApiRoute(q3);
      }

      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        displayName = geo.displayName;
      } else {
        console.warn("[geocode] No result for:", { q1 });
      }
    }

    let distanceKm: number | null = null;
    let shippingPriceBI: bigint = 0n;

    if (
      lat != null &&
      lng != null &&
      Number.isFinite(HOME_LAT_LNG.lat) &&
      Number.isFinite(HOME_LAT_LNG.lng)
    ) {
      distanceKm = haversineKm(HOME_LAT_LNG, { lat, lng });
      shippingPriceBI = shippingFeeByKm(distanceKm);
    }

    const addressToSave = {
      ...address,
      ...(lat != null && { lat }),
      ...(lng != null && { lng }),
      ...(displayName && { displayName }),
    };

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        address: addressToSave as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      message: "User Address Updated!",
      lat: lat ?? null,
      lng: lng ?? null,
      distanceKm: distanceKm != null ? Number(distanceKm.toFixed(2)) : null,
      shippingPriceBI: shippingPriceBI.toString(),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
