"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { tripService } from "@/services/trip-service"
import { BookingService } from "@/services/booking-service"
import { MapPin, Clock } from "lucide-react"
import { format } from "date-fns"
import { Trip, TripStatus, Booking } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"

interface TripSearchProps {
  userId: string
  onBookingComplete: () => void
}

export function TripSearch({ userId, onBookingComplete }: TripSearchProps) {
   const { toast } = useToast()
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)

  // 🔹 Fetch user bookings once
  const fetchUserBookings = async () => {
    try {
      const bookings = await BookingService.getBookingsByPassenger(userId)
      setUserBookings(bookings)
    } catch (error) {
      console.error("Failed to fetch user bookings:", error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const trips = await tripService.getTripsByStatus(TripStatus.SCHEDULED)

      // 🔹 Filter out trips the user already booked (unless cancelled)
      const bookedTripIds = userBookings
        .filter((b) => b.status !== "CANCELLED")
        .map((b) => b.tripId)

      const filteredTrips = trips.filter((t) => !bookedTripIds.includes(t.id))

      setAvailableTrips(filteredTrips)
    } catch (error) {
      console.error("Failed to search trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookTrip = async (trip: Trip) => {
    setBookingLoading(trip.id)
    try {
      await BookingService.createBooking({
        passengerId: userId,
        tripId: trip.id,
        seatNumber: "1A", // 🔹 TODO: replace with actual seat selection
        qrCode: `QR-${trip.id}-${userId}`, // 🔹 placeholder QR generator
      })

      await fetchUserBookings()
      await handleSearch()

      onBookingComplete()
       toast({
        title: "Booking successfull 🎉",
        description: `Trip booked successfully`,
      })
    } catch (error) {
      console.error("Failed to book trip:", error)
       toast({
        title: "Booking failed",
        description: `Failed to book trip. Please try again.`,
      })
     
    } finally {
      setBookingLoading(null)
    }
  }

  // Load initial trips & bookings
  useEffect(() => {
    fetchUserBookings()
  }, [userId])

  // Refetch trips whenever bookings change
  useEffect(() => {
    handleSearch()
  }, [userBookings])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Trips ({availableTrips.length})</h3>

        {availableTrips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No trips available to book.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {availableTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-lg">
                          {trip.origin} → {trip.destination}
                        </span>
                        <Badge variant="secondary">{trip.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{format(new Date(trip.departureTime), "MMM dd, HH:mm")}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleBookTrip(trip)}
                      disabled={bookingLoading === trip.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {bookingLoading === trip.id ? "Booking..." : "Book Trip"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
