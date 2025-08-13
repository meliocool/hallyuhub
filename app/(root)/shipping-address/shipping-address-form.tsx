"use client";

import {
  CityField,
  CountryField,
  FullNameField,
  PostalCodeField,
  ShippingAddress,
  StreetAddressField,
} from "@/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { shippingAddressSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { SHIPPING_ADDRESS_DEFAULT_VALUES } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { applyShippingAddressAndRepriceCart } from "@/lib/actions/cart.actions";

const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
  // const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveToProfile, setSaveToProfile] = useState(false);

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || SHIPPING_ADDRESS_DEFAULT_VALUES,
  });

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      const res = await applyShippingAddressAndRepriceCart({
        address: values,
        saveToProfile,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        console.groupCollapsed(
          "%cCheckout repricing (dev)",
          "color:#22c55e;font-weight:bold;"
        );
        console.log("Normalized address:", res.normalizedAddress);
        console.log("Distance (km):", res.distanceKm);
        console.table([
          { field: "itemsPrice", value: res.itemsPrice }, // strings from server
          { field: "shippingPrice", value: res.shippingPrice },
          { field: "taxPrice", value: res.taxPrice },
          { field: "totalPrice", value: res.totalPrice },
        ]);
        console.groupEnd();
      }
      // router.push("/payment-method");
    });
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="font-bold text-2xl lg:text-3xl mt-4">
          Shipping Address
        </h1>
        <p className="text-sm text-muted-foreground">
          Please enter your shipping informations
        </p>
        <Form {...form}>
          <form
            method="POST"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }: { field: FullNameField }) => (
                  <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }: { field: StreetAddressField }) => (
                  <FormItem className="w-full">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Street Address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="city"
                render={({ field }: { field: CityField }) => (
                  <FormItem className="w-full">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }: { field: PostalCodeField }) => (
                  <FormItem className="w-full">
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="country"
                render={({ field }: { field: CountryField }) => (
                  <FormItem className="w-full">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-yellow-600 has-[[aria-checked=true]]:bg-yellow-50 dark:has-[[aria-checked=true]]:border-yellow-900 dark:has-[[aria-checked=true]]:bg-yellow-950">
              <Checkbox
                id="save-to-profile"
                checked={saveToProfile}
                onCheckedChange={(checked) =>
                  setSaveToProfile(Boolean(checked))
                }
                className="data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white dark:data-[state=checked]:border-yellow-700 dark:data-[state=checked]:bg-yellow-700"
              />
              <div className="grid gap-1.5 font-normal">
                <p className="text-sm leading-none font-medium">
                  Save to profile
                </p>
                <p className="text-muted-foreground text-sm">
                  This will save your shipping address to your account for
                  future orders.
                </p>
              </div>
            </Label>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ShippingAddressForm;
