"use client";

import { CartItem, MiniCartView } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addItemToCart,
  deleteItemFromCart,
  getMyMiniCartView,
  removeItemFromCart,
} from "@/lib/actions/cart.actions";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

type Props = { item: CartItem };

const AddToCart = ({ item }: Props) => {
  const router = useRouter();
  const [view, setView] = useState<MiniCartView | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = async () => setView(await getMyMiniCartView());

  const handleAddToCart = async () => {
    try {
      setBusy(true);
      const res = await addItemToCart(item);
      if (!res.success) {
        return toast.error(res.message);
      }
      await refresh();
      setIsDialogOpen(true);
      toast.message(res.message, {
        description: `${item.name}`,
        position: "top-center",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to cart.");
    } finally {
      setBusy(false);
    }
  };

  const inc = async (lineVariantId: string) => {
    if (!view) return;
    const line = view.items.find((i) => i.variantId === lineVariantId);
    if (!line) return;

    const payload: CartItem = {
      productId: line.productId,
      variantId: line.variantId,
      variantType: line.variantType,
      benefitType: line.benefitType,
      name: line.name,
      slug: line.slug,
      qty: 1,
      image: line.image,
      price: BigInt(line.price),
    };

    const res = await addItemToCart(payload);
    if (!res.success) return toast.error(res.message);
    await refresh();
  };

  const dec = async (lineVariantId: string) => {
    const res = await removeItemFromCart(lineVariantId);
    if (!res.success) return toast.error(res.message);
    await refresh();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button
        className="w-full cursor-pointer"
        type="button"
        onClick={handleAddToCart}
        disabled={busy}
      >
        {busy ? "Adding..." : "Add to Cart"}
      </Button>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Added to Cart</DialogTitle>
          <DialogDescription>
            You can tweak quantities here before checking out.
          </DialogDescription>
        </DialogHeader>
        {!view || view.items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Your Cart is Empty.
          </div>
        ) : (
          <>
            <ScrollArea
              className={cn(view.items.length > 3 ? "h-64 pr-1" : "")}
            >
              <div className="space-y-3">
                {view.items.map((it) => {
                  const atMax = it.qty >= it.stock;
                  return (
                    <div
                      key={it.variantId}
                      className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/30 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          src={it.image}
                          alt={it.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-5">
                            {it.name}
                          </p>
                          <div className="mt-1 flex items-center gap-3">
                            {it.variantType && (
                              <Badge variant="outline" className="text-xs">
                                {it.variantType}
                              </Badge>
                            )}
                            {it.stock > 0 &&
                              it.stock <= LOW_STOCK_THRESHOLD && (
                                <span className="text-xs text-muted-foreground">
                                  Stock: {it.stock}
                                </span>
                              )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatRupiah(it.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => dec(it.variantId)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="w-8 text-center tabular-nums">
                            {it.qty}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => inc(it.variantId)}
                            disabled={atMax}
                            title={atMax ? "Reached stock limit!" : ""}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium">
                          {formatRupiah(it.price * it.qty)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={async () => {
                            const res = await deleteItemFromCart(it.variantId);
                            if (!res.success) return toast.error(res.message);
                            await refresh();
                            toast.success(
                              `${it.name} - ${it.variantType} Removed from cart`
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <div className="flex flex-start gap-3">
              <div className="text-sm text-muted-foreground">
                Total ({view.items.reduce((n, i) => n + i.qty, 0)} item):
              </div>
              <div className="text-lg font-semibold">
                {formatRupiah(view.total)}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Choose Other Variant
              </Button>
              <Button onClick={() => router.push("/cart")}>View Cart</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToCart;
