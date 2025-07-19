"use client";

import { useMemo, useState, useEffect } from "react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";

export default function ProductDetailsView({ product }: { product: Product }) {
  // ? -- React moment lol -- ?
  const [currentImage, setCurrentImage] = useState(
    product.images[0] || product.variants[0]?.images[0] || ""
  );

  const [selectedVariantType, setSelectedVariantType] = useState(
    product.variants[0].variantType
  );

  const [selectedBenefitType, setSelectedBenefitType] = useState<string | null>(
    product.variants[0].benefitType ?? null
  );

  const uniqueVariantTypes = useMemo(
    () => [...new Set(product.variants.map((v) => v.variantType))],
    [product.variants]
  );
  const uniqueBenefitTypes = useMemo(
    () =>
      [
        ...new Set(product.variants.map((v) => v.benefitType).filter(Boolean)),
      ] as string[],
    [product.variants]
  );

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (v) =>
          v.variantType === selectedVariantType &&
          (v.benefitType ?? null) === selectedBenefitType
      ),
    [selectedVariantType, selectedBenefitType, product.variants]
  );

  const allImages = useMemo(() => {
    const combined = [
      ...product.images,
      ...product.variants.flatMap((v) => v.images),
    ];
    return [...new Set(combined)];
  }, [product.images, product.variants]);

  useEffect(() => {
    if (!selectedVariant) {
      const firstAvailableVariant = product.variants.find(
        (v) => v.variantType === selectedVariantType
      );
      if (firstAvailableVariant) {
        setSelectedBenefitType(firstAvailableVariant.benefitType ?? null);
      }
    }
  }, [selectedVariant, selectedVariantType, product.variants]);

  useEffect(() => {
    if (selectedVariant?.images?.length) {
      setCurrentImage(selectedVariant.images[0]);
    }
  }, [selectedVariant]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <div className="md:col-span-2">
        <ProductImages
          allImages={allImages}
          currentImage={currentImage}
          onImageSelect={setCurrentImage}
        />
      </div>
      <div className="md:col-span-2 p-5">
        <div className="flex flex-col gap-6">
          <p>
            {product.groupName} {product.category}
          </p>
          <h1 className="font-bold text-xl lg:text-2xl">{product.name}</h1>
          <p>
            {product.rating.toString()} of {product.numReviews} Reviews
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <ProductPrice
              value={Number(selectedVariant?.price ?? 0)}
              className="w-32 rounded-full bg-green-100 text-green-700 px-5 py-2"
            />
          </div>

          <div className="mt-2">
            <p className="font-semibold">Description</p>
            <p>{product.description}</p>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <div>
              <p className="font-semibold mb-2">Choose Type:</p>
              <div className="flex flex-wrap gap-2">
                {uniqueVariantTypes.map((type) => (
                  <Button
                    key={type}
                    variant={
                      selectedVariantType === type ? "default" : "outline"
                    }
                    onClick={() => setSelectedVariantType(type)}
                    className="cursor-pointer"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            {uniqueBenefitTypes.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Choose Benefit:</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueBenefitTypes.map((type) => (
                    <Button
                      key={type}
                      variant={
                        selectedBenefitType === type ? "default" : "outline"
                      }
                      onClick={() => setSelectedBenefitType(type)}
                      disabled={
                        !product.variants.some(
                          (v) =>
                            v.variantType === selectedVariantType &&
                            v.benefitType === type
                        )
                      }
                      className="cursor-pointer"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Column - Placed correctly in the grid */}
      <div className="md:col-span-1">
        <Card>
          <CardContent className="py-1 px-4">
            <div className="mb-2 flex justify-between">
              <div>Price</div>
              <div>
                <ProductPrice value={Number(selectedVariant?.price ?? 0)} />
              </div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>Status</div>
              {selectedVariant && selectedVariant.stock > 0 ? (
                <Badge variant="outline">
                  In Stock: {selectedVariant.stock}
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock!</Badge>
              )}
            </div>
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="flex justify-center items-center mt-4">
                <Button className="w-full">Add To Cart</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
