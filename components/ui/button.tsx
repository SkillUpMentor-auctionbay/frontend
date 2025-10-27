import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconProps } from "./icon"

const buttonVariants = cva(
  "inline-flex items-center hover:cursor-pointer leading-6 justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-[40px] px-4 py-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-gray-90 hover:bg-primary-60 active:bg-primary-70",
        secondary: "bg-gray-50 text-white hover:bg-gray-60 active:bg-gray-70",
        tertiary: "border border-gray-50 text-gray-90 hover:bg-gray-60 hover:border-gray-60 hover:text-white active:bg-gray-70 active:border-gray-70 active:text-white",
        alternative: "bg-gray-10 text-gray-90 hover:bg-gray-20 active:bg-gray-30",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "min-h-[40px] px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      buttonStyle: {
        regular: "",
        cta: "rounded-full p-[15px] gap-1",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      buttonStyle: "regular",
    },
  }
)

const ctaButtonVariants = cva(
  "inline-flex items-center hover:cursor-pointer justify-center gap-1 whitespace-nowrap rounded-full p-[15px] transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        primary: "bg-primary-50 text-gray-90 hover:bg-primary-60 active:bg-primary-70",
        secondary: "bg-gray-50 text-white hover:bg-gray-60 active:bg-gray-70",
        alternative: "bg-gray-10 text-gray-90 hover:bg-gray-20 active:bg-gray-30",
      },
      size: {
        default: "size-[54px]", // 54px total (15px padding + 24px content + 15px padding)
        sm: "size-[42px]", // 42px total (15px padding + 12px content + 15px padding)
        lg: "size-[72px]", // 72px total (15px padding + 42px content + 15px padding)
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: IconProps["name"]
  rightIcon?: IconProps["name"]
  icon?: IconProps["name"] // For CTA style buttons
  iconSize?: number | string
  // Override size to accept both regular and CTA size types
  size?:
    | VariantProps<typeof buttonVariants>['size']
    | VariantProps<typeof ctaButtonVariants>['size']
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  buttonStyle = 'regular',
  asChild = false,
  leftIcon,
  rightIcon,
  icon,
  iconSize = buttonStyle === 'cta' ? 24 : 12,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"

  // Unified color mapping for both regular and CTA buttons
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
      case 'alternative':
      case 'tertiary':
        return 'text-gray-90'
      case 'secondary':
      case 'ghost':
      case 'outline':
        return 'text-white'
      case 'destructive':
        return 'text-white'
      default:
        return 'text-gray-90'
    }
  }

  const renderIcon = (iconName: IconProps["name"]) => {
    return <Icon name={iconName} size={iconSize} color={getIconColor()} />
  }

  // Choose the right variant classes based on buttonStyle
  const buttonClasses = buttonStyle === 'cta'
    ? cn(ctaButtonVariants({
        variant: (['tertiary', 'ghost', 'outline', 'destructive'].includes(variant || '') ? 'primary' : variant) as 'primary' | 'secondary' | 'alternative', // Fallback for unsupported variants
        size: (size === 'icon' || size === 'icon-sm' || size === 'icon-lg' ? 'default' : size) as 'default' | 'sm' | 'lg', // Fallback for unsupported sizes
        className
      }))
    : cn(buttonVariants({ variant, size, buttonStyle, className }))

  return (
    <Comp
      data-slot="button"
      className={buttonClasses}
      ref={ref}
      {...props}
    >
      {/* CTA style: single centered icon */}
      {buttonStyle === 'cta' && icon && renderIcon(icon)}

      {/* Regular style: left icon, children, right icon */}
      {buttonStyle === 'regular' && (
        <>
          {leftIcon && renderIcon(leftIcon)}
          {children}
          {rightIcon && renderIcon(rightIcon)}
        </>
      )}
    </Comp>
  )
})

export { Button, buttonVariants, ctaButtonVariants }
