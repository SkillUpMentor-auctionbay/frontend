"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, InputField, Logo } from "@/components/ui";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { useAuth } from "../../contexts/auth-context";
import { formatLoginError } from "../../utils/errorUtils";
import ErrorBoundary from "@/components/infrastructure/error-boundary";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, loginError, isAuthenticated, isLoading, clearErrors } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
    }
  };

  return (
    <ErrorBoundary>
      <AuthLayout>
      {/* Logo */}
      <div className="flex justify-center">
        <Logo size="md" />
      </div>

      {/* Main content */}
      <div className="text-gray-90 flex-1 flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back!
          </h1>
          <p className="font-light text-base mb-8">
            Please enter your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <InputField
              label="E-mail"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              rightIcon="Eye"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {loginError && (
              <div className="text-red-500 text-sm text-center">
                {formatLoginError(loginError)}
              </div>
            )}

            <div className="text-right">
              <Link href="/forget-password" className="text-xs text-gray-40 hover:cursor-pointer hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>

      {/* Bottom navigation */}
      <div className="text-center text-base flex items-center justify-center gap-1 text-gray-90">
        <span className="font-light">Don't have an account?</span>
        <Link href="/register" className="font-bold hover:cursor-pointer hover:underline">
          Sign Up
        </Link>
      </div>
      </AuthLayout>
    </ErrorBoundary>
  );
}
