"use client";

import { MiniCartView } from "@/types";
import { useRouter } from "next/navigation";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useMemo, useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { viewItemToCartItem } from "./cart-adapter";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CartTable = ({ cart }: { cart: MiniCartView }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!cart) return [];
    return [...cart.items].sort(
      (a, b) =>
        a.name.localeCompare(b.name) || a.variantId.localeCompare(b.variantId)
    );
  }, [cart]);

  const handleIncrease = async (item: MiniCartView["items"][number]) => {
    setLoadingId(item.variantId);
    const res = await addItemToCart(viewItemToCartItem(item));
    if (!res.success) toast.error("Failed to add to Cart!");
    else router.refresh();
    setLoadingId(null);
  };

  const handleDecrease = async (item: MiniCartView["items"][number]) => {
    setLoadingId(item.variantId);
    const res = await removeItemFromCart(item.variantId);
    if (!res.success) toast.error("Failed to remove from Cart!");
    else router.refresh();
    setLoadingId(null);
  };

  const itemsCount = cart.items.reduce((a, c) => a + c.qty, 0);
  return (
    <>
      <h1 className="py-4 font-bold text-2xl lg:text-3xl">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5 items-start">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.variantId}>
                    <TableCell>
                      <Link
                        href={`/product/${it.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={it.image}
                          alt={it.name}
                          width={70}
                          height={50}
                        />
                        <div className="flex flex-col gap-2">
                          <span className="px-2">{it.name}</span>
                          {it.variantId ? (
                            <Badge variant="outline" className="text-sm mx-2">
                              {it.variantType}
                            </Badge>
                          ) : (
                            ""
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="w-40 text-center align-middle">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          disabled={loadingId === it.variantId}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDecrease(it)}
                        >
                          {loadingId === it.variantId ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                        </Button>
                        <span>{it.qty}</span>
                        <Button
                          disabled={loadingId === it.variantId}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleIncrease(it)}
                        >
                          {loadingId === it.variantId ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(it.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <aside className="md:col-span-1 self-start">
            <Card className="rounded-2xl shadow-sm md:sticky md:top-24">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items</span>
                  <span className="text-sm font-medium tabular-nums">
                    {itemsCount}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-base font-medium">Subtotal: </span>
                  <span className="text-2xl font-semibold tabular-nums">
                    {formatRupiah(cart.total)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Taxes & shipping calculated at checkout.
                </p>

                <Separator />

                <Button
                  size="lg"
                  className="w-full"
                  disabled={isPending || itemsCount === 0}
                  onClick={() =>
                    startTransition(() => router.push("/shipping-address"))
                  }
                  aria-label="Proceed to checkout"
                >
                  {isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span className="ml-2">Proceed to Checkout</span>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </>
  );
};

export default CartTable;
