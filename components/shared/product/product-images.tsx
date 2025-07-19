"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductImagesProps = {
  allImages: string[];
  currentImage: string;
  onImageSelect: (image: string) => void;
};

const ProductImages = ({
  allImages,
  currentImage,
  onImageSelect,
}: ProductImagesProps) => {
  if (!allImages || allImages.length === 0) {
    return (
      <div className="h-[450px] bg-secondary rounded-lg flex items-center justify-center">
        <p>No Image Available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Image
        src={currentImage}
        alt="product-image"
        width={1000}
        height={1000}
        priority={true}
        className="h-[450px] min-h-[300px] w-full object-cover object-center rounded-lg"
      />
      {allImages.length > 1 && (
        <div className="flex mt-2 gap-2">
          {allImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              onClick={() => onImageSelect(image)}
              className={cn(
                "w-24 h-24 border cursor-pointer hover:border-amber-300 overflow-hidden rounded-md",
                currentImage === image
                  ? "border-amber-400 border-2"
                  : "border-gray-200"
              )}
            >
              <Image
                src={image}
                alt="image thumbnail"
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
