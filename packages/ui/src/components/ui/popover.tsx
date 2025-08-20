import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "../../lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverArrow = PopoverPrimitive.Arrow

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "lem-z-50 lem-rounded-lg lem-bg-popover lem-text-popover-foreground lem-shadow-lg lem-outline-none data-[state=open]:lem-animate-in data-[state=closed]:lem-animate-out data-[state=closed]:lem-fade-out-0 data-[state=open]:lem-fade-in-0 data-[state=closed]:lem-zoom-out-95 data-[state=open]:lem-zoom-in-95 data-[side=bottom]:lem-slide-in-from-top-2 data-[side=left]:lem-slide-in-from-right-2 data-[side=right]:lem-slide-in-from-left-2 data-[side=top]:lem-slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      <PopoverArrow 
        className="lem-fill-popover lem-drop-shadow-lg" 
        width={24} 
        height={16}
      />
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow } 