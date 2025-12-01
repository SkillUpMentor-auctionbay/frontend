"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives/button";
import { InputField } from "@/components/ui/primitives/input";
import { Logo } from "@/components/ui/primitives/logo";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { Icon } from "@/components/ui/primitives/icon";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export default function ForgetPasswordPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    toast.error("Sending email is not currently implemented");
  };

    return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mb-8 bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium"
            >
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
      </form>
    </AuthLayout>
  );
}