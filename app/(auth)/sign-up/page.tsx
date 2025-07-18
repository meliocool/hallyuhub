import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import SignUpForm from "./signup-form";

type SignUpPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = Array.isArray(resolvedSearchParams.callbackUrl)
    ? resolvedSearchParams.callbackUrl[0]
    : resolvedSearchParams.callbackUrl;
  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <Card className="w-full max-w-sm border border-border">
      <CardHeader className="text-center">
        <Link href="/" className="flex justify-center items-center">
          <Image
            src="/images/logo.svg"
            width={100}
            height={100}
            alt={`${APP_NAME}-logo`}
            priority={true}
          />
        </Link>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Fill in the form to register an account!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Sign In here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpPage;
