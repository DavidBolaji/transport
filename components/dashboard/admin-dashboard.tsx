"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCard } from "./stats-card"
import { SosDashboard } from "@/components/sos/sos-dashboard"
import { AdminService, type AdminStats, type UserWithKyc } from "@/services/admin-service"
import { KycService } from "@/services/kyc-service"
import { SosService } from "@/services/sos-service"
import { useAuth } from "@/contexts/auth-context"

import { TripCreationForm } from "@/components/admin/trip-creation-form"
import {
  Users,
  Car,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  UserX,
  MapPin,
  Calendar,
} from "lucide-react"
import { KycStatus, PanicAlert, Trip, TripStatus, UserRole } from "@prisma/client"

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithKyc[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [alerts, setAlerts] = useState<PanicAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [sosAlerts, setSosAlerts] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null)


  const handleVerifyKyc = async (kycId: string, approved: boolean) => {
    try {
      await KycService.verifyKyc(kycId, user!.id, approved)
      setUsers((prev) =>
        prev.map((u) =>
          u.kycId === kycId && u.kycDetails
            ? {
              ...u,
              kycDetails: {
                ...u.kycDetails,
                status: approved ? KycStatus.VERIFIED : KycStatus.REJECTED,
                verifiedBy: user!.id,
                verifiedAt: new Date(),
              },
            }
            : u,
        ),
      )
    } catch (error) {
      console.error("Failed to verify KYC:", error)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      await AdminService.suspendUser(userId, "Administrative action")
    } catch (error) {
      console.error("Failed to suspend user:", error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      setResolvingAlertId(alertId) // disable button for this alert
      await AdminService.resolveAlert(alertId)
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert))
      )
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    } finally {
      setResolvingAlertId(null) // re-enable after request completes
    }
  }

  const handleGenerateReport = async (type: "trips" | "users" | "incidents") => {
    try {
      const report = await AdminService.generateReport(type)
      console.log(`${type} report:`, report)
    } catch (error) {
      console.error("Failed to generate report:", error)
    }
  }

  const handleTripCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user?.fName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.role === userFilter
    return matchesSearch && matchesFilter
  })

  const pendingKycUsers = users.filter((u) => u.kycDetails?.status === KycStatus.PENDING)
  const activeAlerts = alerts.filter((a) => !a.resolved)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminStats, allUsers, allTrips, panicAlerts] = await Promise.all([
          AdminService.getAdminStats(),
          AdminService.getAllUsers(),
          AdminService.getAllTrips(),
          AdminService.getPanicAlerts(),
          SosService.getActiveSosAlerts(),
        ])

        setStats(adminStats)
        setUsers(allUsers)
        setTrips(allTrips)
        setAlerts(panicAlerts)

      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Update SOS alerts count every 5 seconds
    const interval = setInterval(async () => {
      try {
        const activeSosAlerts = await SosService.getActiveSosAlerts()
        setSosAlerts(activeSosAlerts.length)
      } catch (error) {
        console.error("Failed to update SOS alerts:", error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, trips, and system operations</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            description="All registered users"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Drivers"
            value={stats.totalDrivers.toString()}
            description="Active drivers"
            icon={<Car className="h-4 w-4" />}
          />
          <StatsCard
            title="Passengers"
            value={stats.totalPassengers.toString()}
            description="Registered passengers"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Trips"
            value={stats.activeTrips.toString()}
            description="Currently running"
            icon={<MapPin className="h-4 w-4" />}
          />
          <StatsCard
            title="Pending KYC"
            value={stats.pendingKyc.toString()}
            description="Awaiting verification"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard
            title="SOS Alerts"
            value={sosAlerts.toString()}
            description="Active emergencies"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="create-trip">Create Trip</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>

          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  Pending Verifications
                </CardTitle>
                <CardDescription>{pendingKycUsers.length} users awaiting KYC approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingKycUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{`${user.fName} ${user.lName}`}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleVerifyKyc(user.kycId!, true)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleVerifyKyc(user.kycId!, false)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={sosAlerts > 0 ? "border-red-200 bg-red-50" : ""}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${sosAlerts > 0 ? "text-red-800" : ""}`}>
                  <AlertTriangle className={`h-5 w-5 ${sosAlerts > 0 ? "text-red-500" : "text-yellow-500"}`} />
                  Emergency Alerts
                  {sosAlerts > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {sosAlerts} ACTIVE
                    </Badge>
                  )}
                </CardTitle>

              </CardHeader>

            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value={UserRole.PASSENGER}>Passengers</SelectItem>
                <SelectItem value={UserRole.DRIVER}>Drivers</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{`${user.fName} ${user.lName}`}</h3>
                        <Badge variant="outline" className="capitalize">
                          {user.role.toLowerCase()}
                        </Badge>
                        {user.kycDetails && (
                          <Badge
                            className={
                              user.kycDetails.status === KycStatus.VERIFIED
                                ? "bg-green-100 text-green-800"
                                : user.kycDetails.status === KycStatus.PENDING
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {user.kycDetails.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user.kycDetails?.status === KycStatus.PENDING && (
                        <>
                          <Button size="sm" onClick={() => handleVerifyKyc(user.kycId!, true)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleVerifyKyc(user.kycId!, false)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleSuspendUser(user.id)}>
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Queue</CardTitle>
              <CardDescription>Review and approve user verification documents</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingKycUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending KYC verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingKycUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{`${user.fName} ${user.lName}`}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                      </div>

                      {user.kycDetails && (
                        <div className="space-y-2 mb-4">
                          {user.kycDetails.nin && (
                            <div className="flex justify-between text-sm">
                              <span>National ID:</span>
                              <span className="font-mono">***{user.kycDetails.nin.slice(-4)}</span>
                            </div>
                          )}
                          {user.kycDetails.license && (
                            <div className="flex justify-between text-sm">
                              <span>Driver's License:</span>
                              <span className="font-mono">***{user.kycDetails.license.slice(-4)}</span>
                            </div>
                          )}
                          {user.kycDetails.policeClearance && (
                            <div className="flex justify-between text-sm">
                              <span>Police Clearance:</span>
                              <span className="font-mono">***{user.kycDetails.policeClearance.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={() => handleVerifyKyc(user.kycId!, true)} className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleVerifyKyc(user.kycId!, false)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">
                        {trip.origin} → {trip.destination}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Departure: {new Date(trip.departureTime).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">

                        <span>{trip.arrivalTime?.toISOString()}h duration</span>
                      </div>
                      {trip.driverId ? (
                        <p className="text-sm text-green-600">
                          Driver: {users.find((u) => u.id === trip.driverId)?.fName || "Unknown"}
                        </p>
                      ) : (
                        <p className="text-sm text-orange-600">No driver assigned</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        className={
                          trip.status === TripStatus.IN_PROGRESS
                            ? "bg-green-100 text-green-800"
                            : trip.status === TripStatus.SCHEDULED
                              ? "bg-blue-100 text-blue-800"
                              : trip.status === TripStatus.COMPLETED
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }
                      >
                        {trip.status.replace("_", " ")}
                      </Badge>
                      {!trip.driverId && (
                        <Button size="sm" variant="outline">
                          Assign Driver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create-trip" className="space-y-4">
          <TripCreationForm onTripCreated={handleTripCreated} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${alert.resolved ? "text-gray-400" : "text-red-500"}`} />
                        <h3 className="font-semibold">{alert.type} Alert</h3>
                        {alert.resolved && <Badge variant="secondary">Resolved</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</p>
                      {alert.message && <p className="text-sm">{alert.message}</p>}
                    </div>
                    {!alert.resolved && (
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={resolvingAlertId === alert.id}
                      >
                        {resolvingAlertId === alert.id ? "Resolving..." : "Resolve"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trip Reports
                </CardTitle>
                <CardDescription>Generate comprehensive trip analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleGenerateReport("trips")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Trip Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Reports
                </CardTitle>
                <CardDescription>User registration and verification stats</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleGenerateReport("users")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate User Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Reports
                </CardTitle>
                <CardDescription>Emergency alerts and incident tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleGenerateReport("incidents")} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Incident Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
