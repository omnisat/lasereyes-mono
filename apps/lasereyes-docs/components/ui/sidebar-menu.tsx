import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode
}

export function SidebarMenuItem({ children, className, ...props }: SidebarMenuItemProps) {
  return (
    <li className={cn("px-2", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
  isActive?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ children, className, asChild = false, isActive = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    const childProps = asChild ? { className: "" } : {}

    return (
      <Comp {...childProps}>
        {React.cloneElement(
          asChild ? (
            (children as React.ReactElement)
          ) : (
            <button
              ref={ref}
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2.5 md:py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50 hover:text-foreground text-muted-foreground",
                className,
              )}
              {...props}
            >
              {children}
            </button>
          ),
          asChild
            ? {
                className: cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 md:py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50 hover:text-foreground text-muted-foreground",
                  className,
                ),
              }
            : {},
        )}
      </Comp>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

