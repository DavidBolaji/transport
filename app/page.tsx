"use client"

import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PassengerDashboard } from "@/components/dashboard/passenger-dashboard"
import { DriverDashboard } from "@/components/dashboard/driver-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { UserRole } from "@/types"
import { LoginPage } from "@/components/auth/login-page"

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />
  }

  return (
    <DashboardLayout userRole={user.role} userName={`${user.fName} ${user.lName}`} onLogout={logout}>
      {user.role === UserRole.PASSENGER && <PassengerDashboard userId={user.id} />}
      {user.role === UserRole.DRIVER && <DriverDashboard  />}
      {user.role === UserRole.ADMIN && <AdminDashboard />}
    </DashboardLayout>
  )
}
