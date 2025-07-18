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
import CredentialsSignInForm from "./credentials-signin-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

type SignInPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
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
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CredentialsSignInForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInPage;
