"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { InputField } from "../../components/ui/input";
import { AuthLayout } from "../../components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      {/* Logo */}
      <div className="flex justify-center">
        <div className="rounded-full bg-primary p-4 w-16">
          <Image src="/logo.svg" width={32} height={32} alt="Auction Bay Logo" />
        </div>
      </div>

      {/* Main content */}
      <div className="text-gray-90 flex-1 flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
           Hello!
          </h1>
          <p className="font-light text-base mb-8">
            Please enter your details
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Name"
                type="text"
                placeholder="Enter your name"
              />
              <InputField
                label="Surname"
                type="text"
                placeholder="Enter your surname"
              />
            </div>

            <InputField
              label="E-mail"
              type="email"
              placeholder="Enter your email"
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              rightIcon="Eye"
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              rightIcon="Eye"
            />
          </div>

          <Button className="w-full bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium">
            Sign Up
          </Button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="text-center text-base flex items-center justify-center gap-1 text-gray-90">
        <span className="font-light">Already have an account?</span>
        <Link href="/login" className="font-bold hover:cursor-pointer hover:underline">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}