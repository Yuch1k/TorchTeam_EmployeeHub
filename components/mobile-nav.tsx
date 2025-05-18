"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, Users, Activity, Calendar, CheckSquare, Home, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { SheetClose } from "./ui/sheet"
import { useSidebar } from "./sidebar-context"

export function MobileNavContent() {
  const pathname = usePathname()
  const { closeSidebar } = useSidebar();

  const routes = [
    {
      href: "/",
      icon: Home,
      label: "Главная",
    },
    {
      href: "/chatbot",
      icon: MessageSquare,
      label: "Чат-бот",
    },
    {
      href: "/employees",
      icon: Users,
      label: "Сотрудники",
    },
    {
      href: "/engagement",
      icon: Activity,
      label: "Активность",
    },
    {
      href: "/events",
      icon: Calendar,
      label: "Календарь",
    },
    {
      href: "/tasks",
      icon: CheckSquare,
      label: "Задачи",
    },
  ]

  const handleLinkClick = () => {
    setTimeout(() => {closeSidebar();}, 500); // Delay for visual feedback
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <SheetClose asChild>
            <Link href="/" className="no-underline" onClick={handleLinkClick}>
              <Image 
                src="/logo_mobile.svg"
                alt="Очень Интересно"
                width={32}
                height={32}
                className="mr-2"
              />
            </Link>
          </SheetClose>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href

          return (
            <SheetClose key={route.href} asChild>
              <Link href={route.href} className="no-underline" onClick={handleLinkClick}>
                <Button
                  variant={isActive ? "active" : "ghost"}
                  className={cn(
                    "w-full flex items-center justify-start gap-3 text-base",
                    isActive ? "font-medium" : ""
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{route.label}</span>
                </Button>
              </Link>
            </SheetClose>
          )
        })}
      </div>

      <div className="mt-auto pt-4 border-t flex items-center gap-2">
        <div className="text-sm text-muted-foreground">Тема:</div>
        <ModeToggle />
      </div>
    </div>
  )
}

// Keep this for backward compatibility if needed elsewhere
export function MobileNav() {
  // This component is now repurposed as a drawer that opens from the right
  // The bottom navigation is removed in favor of the hamburger menu
  return null
}
