"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, PanelLeft } from "lucide-react"
import { MobileNavContent } from "./mobile-nav"
import { useSidebar } from "./sidebar-context"

export default function Header() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()

  const routes = [
    { href: "/chatbot", label: "Чат-бот" },
    { href: "/employees", label: "Сотрудники" },
    { href: "/engagement", label: "Активность" }, 
    { href: "/events", label: "Календарь" }, 
    { href: "/tasks", label: "Задачи" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex mr-2"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/">
            <div className="flex items-center">
              <Image 
                src="/logo_mobile.svg"
                alt="Очень Интересно"
                width={36}
                height={36}
                className="mr-2"
              />
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button variant={pathname === route.href ? "active" : "ghost"}>{route.label}</Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            {/* Custom class added for sheet content to fix close button position */}
            <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-10 [&>button]:top-[0.875rem]">
              <MobileNavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
