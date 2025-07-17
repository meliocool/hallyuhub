import { cn } from "@/lib/utils";

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  if (value < 1000) {
    return (
      <p className={cn("text-2xl", className)}>
        <span className="text-xs align-super mr-1">IDR</span>
        {value.toLocaleString("id-ID")}
      </p>
    );
  }

  const priceString = String(value);
  const mainPart = priceString.slice(0, -3);
  const superscriptZeros = priceString.slice(-3);
  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super mr-1">IDR</span>
      {mainPart}
      <span className="text-xs align-super mr-1">{superscriptZeros}</span>
    </p>
  );
};

export default ProductPrice;
