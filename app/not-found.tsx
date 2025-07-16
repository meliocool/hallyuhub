"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <p className="text-6xl font-semibold text-[#f4b400] md:text-8xl">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
        Page Not Found
      </h1>
      <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <div className="mt-7">
        <Link href="/">
          <Button className="cursor-pointer">Go back home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
