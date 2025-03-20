import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "lem-inline-flex lem-items-center lem-justify-center lem-whitespace-nowrap lem-rounded-md lem-text-sm lem-font-medium lem-ring-offset-background lem-transition-colors focus-visible:lem-outline-none focus-visible:lem-ring-2 focus-visible:lem-ring-ring focus-visible:lem-ring-offset-2 disabled:lem-pointer-events-none disabled:lem-opacity-50",
  {
    variants: {
      variant: {
        default: "lem-bg-primary lem-text-primary-foreground hover:lem-bg-primary/90",
        destructive:
          "lem-bg-destructive lem-text-destructive-foreground hover:lem-bg-destructive/90",
        outline:
          "lem-border lem-border-input lem-bg-background hover:lem-bg-accent hover:lem-text-accent-foreground",
        secondary:
          "lem-bg-secondary lem-text-secondary-foreground hover:lem-bg-secondary/80",
        ghost: "hover:lem-bg-accent hover:lem-text-accent-foreground",
        link: "lem-text-primary lem-underline-offset-4 hover:lem-underline",
      },
      size: {
        default: "lem-h-10 lem-px-4 lem-py-2",
        sm: "lem-h-9 lem-rounded-md lem-px-3",
        lg: "lem-h-11 lem-rounded-md lem-px-8",
        icon: "lem-h-10 lem-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
