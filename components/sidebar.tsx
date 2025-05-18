"use client"

import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar()
  const [activeRoute, setActiveRoute] = useState<string | null>(null)

  // We'll handle mobile navigation in the header now
  // This sidebar is only for larger screens
  const routes = [
    { href: "/chatbot", label: "Чат-бот" },
    { href: "/employees", label: "Сотрудники" },
    { href: "/engagement", label: "Активность" },
    { href: "/events", label: "Календарь" },
    { href: "/tasks", label: "Задачи" },
  ]

  // Modified to use the router directly with a delay for visual feedback
  const handleNavigation = (href: string) => {
    // Set active route to highlight immediately
    setActiveRoute(href);
    
    // Delay collapsing and navigation to allow visual feedback
    setTimeout(() => {
      closeSidebar();
      router.push(href);
    }, 10000);
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col transition-all duration-200 ease-in-out border-r relative",
        isSidebarOpen ? "w-[240px]" : "w-[60px]"
      )}
    >
      <div className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
          <Button 
            key={route.href}
            variant={(pathname === route.href || activeRoute === route.href) ? "active" : "ghost"} 
            className={cn(
              "justify-start overflow-hidden", 
              isSidebarOpen ? "w-full" : "w-10 px-2"
            )}
            onClick={() => handleNavigation(route.href)}
          >
            {route.label}
          </Button>
        ))}
        
        <div className={cn(
          "mt-auto pt-4 border-t mt-4",
          isSidebarOpen ? "block" : "hidden"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Тема</span>
            <ModeToggle />
          </div>
        </div>
      </div>
    </aside>
  )
}
