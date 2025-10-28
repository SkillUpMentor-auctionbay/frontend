"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { InputField } from "../../components/ui/input";
import { Logo } from "../../components/ui/logo";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import { formatRegisterError } from "../../utils/errorUtils";
import ErrorBoundary from "../../components/ErrorBoundary";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    confirmPassword: "",
    general: ""
  });

  const { register, isRegistering, registerError, isAuthenticated, isLoading, clearErrors } = useAuth();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "password" || field === "confirmPassword") {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { confirmPassword: "", general: "" };

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    } else if (formData.password.length < 6) {
      newErrors.confirmPassword = "Password must be at least 6 characters";
    }

    if (formData.name.length < 2) {
      newErrors.general = "First name must be at least 2 characters long";
    } else if (formData.surname.length < 2) {
      newErrors.general = "Last name must be at least 2 characters long";
    }

    setErrors(newErrors);
    return !newErrors.confirmPassword && !newErrors.general;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await register(formData.name, formData.surname, formData.email, formData.password);
  };

  const isFormValid = formData.name && formData.surname && formData.email &&
                     formData.password && formData.confirmPassword &&
                     formData.password === formData.confirmPassword &&
                     formData.password.length >= 6;

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
           Hello!
          </h1>
          <p className="font-light text-base mb-8">
            Please enter your details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
              <InputField
                label="Surname"
                type="text"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                required
              />
            </div>

            <InputField
              label="E-mail"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              rightIcon="Eye"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              rightIcon="Eye"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
            />

            {errors.confirmPassword && (
              <div className="text-red-500 text-sm">
                {errors.confirmPassword}
              </div>
            )}

            {errors.general && (
              <div className="text-red-500 text-sm">
                {errors.general}
              </div>
            )}

            {registerError && (
              <div className="text-red-500 text-sm text-center">
                {formatRegisterError(registerError)}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium"
            disabled={!isFormValid || isRegistering}
          >
            {isRegistering ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </div>

      {/* Bottom navigation */}
      <div className="text-center text-base flex items-center justify-center gap-1 text-gray-90">
        <span className="font-light">Already have an account?</span>
        <Link href="/login" className="font-bold hover:cursor-pointer hover:underline">
          Log in
        </Link>
      </div>
      </AuthLayout>
    </ErrorBoundary>
  );
}