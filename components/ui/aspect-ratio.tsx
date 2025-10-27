"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    ratio?: number
  }
>(({ className, ratio = 16 / 9, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative w-full", className)}
    style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    {...props}
  />
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }