import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import ProductDetailsView from "@/components/shared/product/product-details-view";

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }
  return (
    <section>
      <ProductDetailsView product={product} />
    </section>
    // <section>
    //   <div className="grid grid-cols-1 md:grid-cols-5">
    //     {/* Image Column */}
    //     <div className="col-span-2">
    //       <ProductImages images={product.images} />
    //     </div>
    //     <div className="col-span-2 p-5">
    //       <div className="flex flex-col gap-6">
    //         <p>
    //           {product.groupName} {product.category}
    //         </p>
    //         <h1 className="font-bold text-xl lg:text-2xl">{product.name}</h1>
    //         {/* TODO: Stars*/}
    //         <p>
    //           {product.rating.toString()} of {product.numReviews} Reviews
    //         </p>
    //       </div>
    //       <div className="mt-10">
    //         <p className="font-semibold">Description</p>
    //         <p>{product.description}</p>
    //       </div>
    //       <ProductOptions product={product} />
    //     </div>
  );
};

export default ProductDetailsPage;
