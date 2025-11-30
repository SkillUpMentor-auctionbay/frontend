"use client";
import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen bg-background overflow-hidden relative w-full">
      <div className="hidden min-[1050]:grid grid-cols-[1fr_472px] h-screen">
        {/* Left side - Image */}
        <div className="flex items-center justify-center relative">
          <div className="w-full h-full max-w-[968px] relative">
            <Image
              src="/login-page-image.png"
              alt="Auction Bay Auth Image"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right side - Content container only */}
        <div className="flex items-center justify-center p-4">
          <div className="w-full h-full max-w-md rounded-4xl bg-white flex flex-col justify-between py-8 px-6">
            {/* All content is now handled by children */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}