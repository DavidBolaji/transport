"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { Bus, Users, AlertTriangle, Settings, LogOut, Home, Calendar, Star, Menu } from "lucide-react"
import { UserRole } from "@prisma/client"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: UserRole
  userName: string
  onLogout?: () => void
}

interface NavigationItem {
  icon: ReactNode
  label: string
  href: string
  badge?: string
}

export function DashboardLayout({ children, userRole, userName, onLogout }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [{ icon: <Home className="w-5 h-5" />, label: "Dashboard", href: "/" }]

    switch (userRole) {
      case UserRole.PASSENGER:
        return [
          ...baseItems,
        ]
      case UserRole.DRIVER:
        return [
          ...baseItems,
        ]
      case UserRole.ADMIN:
        return [
          ...baseItems,
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bus className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">TransportHub</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onItemClick}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            {/* <span className="text-sm font-medium text-accent-foreground">{user.charAt(0).toUpperCase()}</span> */}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole.toLowerCase()}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden bg-background border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">TransportHub</h1>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="bg-sidebar border-r border-sidebar-border h-full">
          <SidebarContent />
        </div>
      </div>

      <div className="lg:ml-64">
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
