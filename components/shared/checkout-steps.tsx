import { Fragment } from "react";
import { cn } from "@/lib/utils";

const CheckoutSteps = ({ current = 0 }) => {
  const CheckoutStepsArray = [
    "User Login",
    "Shipping Address",
    "Payment Method",
    "Place Order",
  ];
  return (
    <div className="flex justify-between items-center flex-col space-x-2 space-y-2 mb-10 md:flex-row">
      {CheckoutStepsArray.map((step, index) => (
        <Fragment key={step}>
          <div
            className={cn(
              "p-2 w-56 rounded-full text-center text-sm",
              index === current ? "bg-secondary" : ""
            )}
          >
            {step}
          </div>
          {step !== "Place Order" && (
            <hr className="w-16 border-t border-gray-300 mx-2" />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
