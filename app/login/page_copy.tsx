"use client";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { InputField } from "../../components/ui/input";
import { AspectRatio } from "../../components/ui/aspect-ratio";

export default function LoginPage() {
  return (
    <div className="h-screen bg-background overflow-hidden relative w-full">
      <div className="hidden min-[1050]:grid grid-cols-[1fr_472px] h-screen">
        <div className="flex items-center justify-center relative">
          <div className="w-full h-full max-w-[968px] relative">
            <Image
              src="/login-page-image.png"
              alt="Auction Bay Login Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex items-center justify-center p-4">
          <div className="w-full h-full max-w-md rounded-4xl bg-white flex flex-col justify-between py-8 px-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary p-4 w-16">
                <Image src="/logo.svg" width={32} height={32} alt="Auction Bay Logo" />
          </div>
        </div>
        <div className="text-gray-90">
          <div className="text-center ">
            <h1 className="text-3xl font-bold  mb-2">
              Welcome back!
            </h1>
            <p className="font-light text-base mb-8">
              Please enter your details
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
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

              <div className="text-right">
                <button className=" text-xs text-gray-40 hover:cursor-pointer">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button className="w-full h-12 bg-primary-50 text-gray-900 hover:bg-primary-60 rounded-2xl font-medium">
              Login
            </Button>
          </div>
          </div>

          <div className="text-center text-base flex items-center justify-center gap-1 text-gray-90">
            <span className="font-light">Don't have an account?</span>
            <button className="font-bold hover:cursor-pointer">
              Sign Up
            </button>
          </div>
        </div>
        </div>
      </div>

      
    </div>
  );
}
