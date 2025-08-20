import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "lem-flex lem-h-10 lem-w-full lem-items-center lem-justify-between lem-rounded-md lem-border lem-border-input lem-bg-background lem-px-3 lem-py-2 lem-text-sm lem-ring-offset-background placeholder:lem-text-muted-foreground focus:lem-outline-none focus:lem-ring-2 focus:lem-ring-ring focus:lem-ring-offset-2 disabled:lem-cursor-not-allowed disabled:lem-opacity-50 [&>span]:lem-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="lem-h-4 lem-w-4 lem-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "lem-flex lem-cursor-default lem-items-center lem-justify-center lem-py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="lem-h-4 lem-w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "lem-flex lem-cursor-default lem-items-center lem-justify-center lem-py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="lem-h-4 lem-w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "lem-relative lem-z-50 lem-max-h-96 lem-min-w-[8rem] lem-overflow-hidden lem-rounded-md lem-border lem-bg-popover lem-text-popover-foreground lem-shadow-md data-[state=open]:lem-animate-in data-[state=closed]:lem-animate-out data-[state=closed]:lem-fade-out-0 data-[state=open]:lem-fade-in-0 data-[state=closed]:lem-zoom-out-95 data-[state=open]:lem-zoom-in-95 data-[side=bottom]:lem-slide-in-from-top-2 data-[side=left]:lem-slide-in-from-right-2 data-[side=right]:lem-slide-in-from-left-2 data-[side=top]:lem-slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:lem-translate-y-1 data-[side=left]:lem--translate-x-1 data-[side=right]:lem-translate-x-1 data-[side=top]:lem--translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "lem-p-1",
          position === "popper" &&
            "lem-h-[var(--radix-select-trigger-height)] lem-w-full lem-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("lem-py-1.5 lem-pl-8 lem-pr-2 lem-text-sm lem-font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "lem-relative lem-flex lem-w-full lem-cursor-default lem-select-none lem-items-center lem-rounded-sm lem-py-1.5 lem-pl-8 lem-pr-2 lem-text-sm lem-outline-none focus:lem-bg-accent focus:lem-text-accent-foreground data-[disabled]:lem-pointer-events-none data-[disabled]:lem-opacity-50",
      className
    )}
    {...props}
  >
    <span className="lem-absolute lem-left-2 lem-flex lem-h-3.5 lem-w-3.5 lem-items-center lem-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="lem-h-4 lem-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("lem--mx-1 lem-my-1 lem-h-px lem-bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} 