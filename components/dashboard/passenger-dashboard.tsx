"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./stats-card"
import { TripSearch } from "@/components/booking/trip-search"
import { BookingHistory } from "@/components/booking/booking-history"
import { KycStatusCard } from "@/components/kyc/kyc-status"
import { KycUpload } from "@/components/kyc/kyc-upload"
import { SosButton } from "@/components/sos/sos-button"
import { KycService } from "@/services/kyc-service"
import { mockTrips } from "@/lib/mock-data"
import { Calendar, MapPin, Clock, QrCode, Star, Search, History, Navigation } from "lucide-react"
import { BookingService } from "@/services/booking-service"
import { Booking, BookingStatus, KycStatus, TripStatus } from "@prisma/client"

interface PassengerDashboardProps {
  userId: string
}

export function PassengerDashboard({ userId }: PassengerDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isVerified, setIsVerified] = useState(false)

  const fetchBookings = async () => {
    try {
      const [userBookings, kycData] = await Promise.all([
        BookingService.getBookingsByPassenger(userId),
        KycService.getUserKyc(userId),
      ])

      setBookings(userBookings)
      setIsVerified(kycData?.status === KycStatus.VERIFIED)
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [userId])

  const confirmedBookings = bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
  const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED)
  const activeTrips = bookings.filter((b) => {
    const trip = mockTrips.find((t) => t.id === b.tripId)
    return b.status === BookingStatus.CONFIRMED && trip?.status === TripStatus.IN_PROGRESS
  })

  const handleRateTrip = (booking: Booking) => {
    alert(`Rating system for trip ${booking.id} coming soon!`)
  }

  const handleBookingComplete = () => {
    fetchBookings()
    setActiveTab("history")
  }

  // Get current active trip for SOS
  const currentTrip = activeTrips.length > 0 ? mockTrips.find((t) => t.id === activeTrips[0].tripId) : null

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  if (!isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Passenger Dashboard</h1>
          <p className="text-muted-foreground">Complete verification to start booking trips</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KycStatusCard />
          <KycUpload />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Passenger Dashboard</h1>
        <SosButton tripId={currentTrip?.id} variant="passenger" className="px-6 py-3" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Calendar className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Book Trip
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Active Trips"
              value={activeTrips.length}
              icon={<Navigation className="w-4 h-4" />}
              description="Currently traveling"
            />
            <StatsCard
              title="Confirmed Bookings"
              value={confirmedBookings.length}
              icon={<Calendar className="w-4 h-4" />}
              description="Upcoming trips"
            />
            <StatsCard
              title="Completed Trips"
              value={completedBookings.length}
              icon={<MapPin className="w-4 h-4" />}
              description="Total journeys"
            />
          
          </div>

          {/* Active Trip Alert */}
          {activeTrips.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Navigation className="w-5 h-5" />
                  Active Trip in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTrips.map((booking) => {
                  const trip = mockTrips.find((t) => t.id === booking.tripId)
                  return (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">
                          {trip?.origin} → {trip?.destination}
                        </p>

                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setActiveTab("history")} className="bg-green-600 hover:bg-green-700">
                          Track Live
                        </Button>
                        <SosButton tripId={trip?.id} variant="passenger" />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings found. Book your first trip!</p>
                  <Button className="mt-4" onClick={() => setActiveTab("search")}>
                    Book a Trip
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => {
                    //@ts-ignore
                    const trip = booking.trip // ✅ comes from DB
                    if (!trip) return null

                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {trip.origin} → {trip.destination}
                            </span>
                            {trip.status === TripStatus.IN_PROGRESS && (
                              <Badge className="bg-green-100 text-green-800">Live</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(trip.departureTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={booking.status === BookingStatus.CONFIRMED ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>My Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View tickets and track your journeys</p>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setActiveTab("history")}>
                  View All Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <TripSearch userId={userId} onBookingComplete={handleBookingComplete} />
        </TabsContent>

        <TabsContent value="history">
          <BookingHistory userId={userId} onRateTrip={handleRateTrip} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
