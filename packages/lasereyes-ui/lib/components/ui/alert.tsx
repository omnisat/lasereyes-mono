import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "lem-relative lem-w-full lem-rounded-lg lem-border lem-p-4 [&>svg~*]:lem-pl-7 [&>svg+div]:lem-translate-y-[-3px] [&>svg]:lem-absolute [&>svg]:lem-left-4 [&>svg]:lem-top-4 [&>svg]:lem-text-foreground",
  {
    variants: {
      variant: {
        default: "lem-bg-background lem-text-foreground",
        destructive:
          "lem-bg-destructive/50 lem-text-white dark:lem-bg-destructive [&>svg]:lem-text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("lem-mb-1 lem-font-medium lem-leading-none lem-tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("lem-text-sm [&_p]:lem-leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
