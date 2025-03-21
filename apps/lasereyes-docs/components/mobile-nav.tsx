"use client"

import { useState, Suspense } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocsSidebar } from "@/components/docs-sidebar"

function MobileNavContent() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full max-w-[300px]">
        <DocsSidebar mobileMenu={true} handleLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export function MobileNav() {
  return (
    <Suspense
      fallback={
        <Button variant="ghost" size="icon" className="md:hidden" disabled>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      }
    >
      <MobileNavContent />
    </Suspense>
  )
}

