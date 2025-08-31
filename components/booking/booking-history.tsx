"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatingModal } from "@/components/rating/rating-modal"
import { QrTicket } from "./qr-ticket"
import { TripTracker } from "@/components/trip/trip-tracker"
import { BookingService } from "@/services/booking-service"
import { Calendar, MapPin, Clock, QrCode, Star, Download, Navigation, Ticket } from "lucide-react"
import { format } from "date-fns"
import { Booking, BookingStatus, TripStatus, Trip, User } from "@prisma/client"

type BookingWithTrip = Booking & { trip: Trip; passenger?: User }

interface BookingHistoryProps {
  userId: string
  onRateTrip: (booking: Booking) => void
}

export function BookingHistory({ userId, onRateTrip }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<BookingWithTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const fetchBookings = async () => {
    try {
      const userBookings = await BookingService.getBookingsByPassenger(userId)
    
      setBookings(
        userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [userId])

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "default"
      case BookingStatus.COMPLETED:
        return "secondary"
      case BookingStatus.CANCELLED:
        return "destructive"
      default:
        return "outline"
    }
  }

  const activeBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED && b.trip?.status === TripStatus.IN_PROGRESS,
  )

  const upcomingBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED && b.trip?.status === TripStatus.SCHEDULED,
  )

  const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED)

  const handleDownloadTicket = (booking: BookingWithTrip) => {
    alert(`Downloading ticket for booking ${booking.id}`)
    // TODO: implement real ticket generation (PDF / image from QrTicket)
  }



  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </CardContent>
      </Card>
    )
  }

  const renderBookingCard = (booking: BookingWithTrip) => {
    const trip = booking.trip
    if (!trip) return null

    return (
      <Card key={booking.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-lg">
                    {trip.origin} → {trip.destination}
                  </span>
                </div>
                <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                {trip.status === TripStatus.IN_PROGRESS && <Badge className="bg-green-100 text-green-800">Live</Badge>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Departure</div>
                    <div className="text-muted-foreground">
                      {format(new Date(trip.departureTime), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <QrCode className="w-3 h-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ticket</div>
                    <div className="text-muted-foreground font-mono">{booking.id.slice(-8)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">
                      Booked {format(new Date(booking.createdAt), "MMM dd")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {trip.status === TripStatus.IN_PROGRESS && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setActiveTab(`track-${booking.id}`)}
                  className="gap-2"
                >
                  <Navigation className="w-3 h-3" />
                  Track Live
                </Button>
              )}

              {booking.status === BookingStatus.CONFIRMED && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab(`ticket-${booking.id}`)}
                    className="gap-2 bg-transparent"
                  >
                    <Ticket className="w-3 h-3" />
                    View Ticket
                  </Button>
                 
                </>
              )}

            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <Badge variant="outline">{bookings.length} total bookings</Badge>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">
              Your booking history will appear here once you book your first trip.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.map(renderBookingCard)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No active trips</p>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No upcoming trips</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No completed trips to rate</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map(renderBookingCard)
            )}
          </TabsContent>

          {/* Dynamic tabs for individual booking details */}
          {bookings.map((booking) => {
            const trip = booking.trip
            if (!trip) return null

            return (
              <div key={`tabs-${booking.id}`}>
                <TabsContent value={`ticket-${booking.id}`}>
                  <QrTicket booking={booking} trip={trip} passenger={booking.passenger} />
                </TabsContent>

                <TabsContent value={`track-${booking.id}`}>
                  <TripTracker booking={booking} trip={trip} />
                </TabsContent>
              </div>
            )
          })}
        </Tabs>
      )}


    </div>
  )
}
