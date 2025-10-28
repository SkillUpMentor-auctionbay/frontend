"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "../../lib/utils";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", className, ...props }, ref) => {
    const sizeConfig = {
      sm: {
        container: "w-12 h-12 p-3",
        image: 24
      },
      md: {
        container: "w-16 h-16 p-4",
        image: 32
      },
      lg: {
        container: "w-20 h-20 p-5",
        image: 40
      }
    };

    const config = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-full bg-primary flex items-center justify-center",
          config.container,
          className
        )}
        {...props}
      >
        <Image
          src="/logo.svg"
          width={config.image}
          height={config.image}
          alt="Auction Bay Logo"
        />
      </div>
    );
  }
);

Logo.displayName = "Logo";

export { Logo };