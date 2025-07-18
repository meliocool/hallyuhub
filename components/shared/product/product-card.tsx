import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProductPrice from "./product-price";
import { Product } from "@/types";

const ProductCard = ({ product }: { product: Product }) => {
  const totalStock = product.variants.reduce(
    (acc, variant) => acc + variant.stock,
    0
  );
  const minPrice = Math.min(...product.variants.map((v) => Number(v.price)));
  return (
    <Card className="w-full max-w-sm border border-border">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            priority={true}
            className="object-cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs">{product.groupName}</div>
        <Link href={`/product/${product.slug}`}>{product.name}</Link>
        <div className="flex-between gap-4">
          <p>{product.rating.toString()} stars</p>
          {totalStock > 0 ? (
            <ProductPrice value={minPrice} />
          ) : (
            <p className="text-destructive">Out of Stock!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
