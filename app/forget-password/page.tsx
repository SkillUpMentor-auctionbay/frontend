"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { InputField } from "../../components/ui/input";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Icon } from "../../components/ui/icon";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgetPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to auctions page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/auctions");
    }
  }, [isAuthenticated, isLoading, router]);
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
            Forgot password?
          </h1>
          <p className="font-light text-base mb-8">
            No worries, we will send you reset instructions
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <InputField
              label="E-mail"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <Button className="w-full mb-8 bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium">
            Reset Password
          </Button>
          <Link href="/login" className="text-gray-40 flex items-center leading-4 gap-2 justify-center hover:cursor-pointer hover:underline">
            <Icon name="Chevron right" size={16} className="rotate-180"/>
            <span className="font-light text-xs">
              Back to Login
            </span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}