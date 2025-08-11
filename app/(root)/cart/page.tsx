import { Metadata } from "next";
import CartTable from "./cart-table";
import { getMyMiniCartView } from "@/lib/actions/cart.actions";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const cart = await getMyMiniCartView();
  return (
    <>
      <CartTable cart={cart} />
    </>
  );
};

export default CartPage;
