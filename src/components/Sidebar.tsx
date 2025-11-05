"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/ThemeToggler"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
    CircleDollarSign,
    UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 p-4 border-r flex flex-col">
      <div>
        <h2 className="text-xl font-semibold mb-6">Admin Dashboard</h2>

        <NavigationMenu orientation="vertical">
          <NavigationMenuList className="flex flex-col gap-1">
            {[
              { href: "/profile", label: "Profile", icon: UserCheck },
              { href: "/salary", label: "Salary", icon: CircleDollarSign},
              { href: "/attendance", label: "Attendance", icon: UserCheck },
              { href: "/employee", label: "Employee", icon: UserCheck },
            ].map(({ href, label, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex flex-row gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive(href)
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="mt-6">
        <ModeToggle />
      </div>
    </aside>
  )
}
