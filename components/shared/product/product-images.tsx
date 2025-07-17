"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        src={images[current]}
        alt="product-image"
        width={1000}
        height={1000}
        className="h-[450px] min-h-[300px] w-full object-cover object-center rounded-lg"
      />
      <div className="flex mt-2 gap-2">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            onClick={() => setCurrent(index)}
            className={cn(
              "w-24 h-24 border cursor-pointer hover:border-amber-300 overflow-hidden rounded-md",
              current === index
                ? "border-amber-400 border-2"
                : "border-gray-200"
            )}
          >
            <Image src={image} alt="image" width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
