"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Navigation, Clock, AlertTriangle, Phone, User } from "lucide-react"
import { Booking, PanicType, Trip, TripStatus } from "@prisma/client"
import { SosService } from "@/services/sos-service"
import { useToast } from "../ui/use-toast"

interface TripTrackerProps {
  booking: Booking
  trip: Trip
}

export function TripTracker({ booking, trip }: TripTrackerProps) {
  const { toast } = useToast()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [progress, setProgress] = useState(0)
  const [isSendingSos, setIsSendingSos] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null)


  console.log(booking, trip)

  // ✅ Simulate Live Tracking using Browser Geolocation
  useEffect(() => {
    if (trip.status !== TripStatus.IN_PROGRESS) return

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          // Simulate journey progress % increasing slowly
          setProgress((prev) => Math.min(prev + 2, 100))

          // Fake ETA: 30 mins from first update
          if (!estimatedArrival) {
            setEstimatedArrival(new Date(Date.now() + 30 * 60 * 1000))
          }
        },
        (err) => {
          console.error("Geolocation error:", err)
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      console.warn("Geolocation not supported")
    }
  }, [trip.status, estimatedArrival])

  const handleEmergency = async () => {
    if (isSendingSos) return
    setIsSendingSos(true)

    try {
      if (!booking.passengerId) {
        toast({
          title: "Missing Passenger",
          description: "No passenger ID found!",
          variant: "destructive",
        })
        return
      }

      await SosService.triggerSos(
        booking.passengerId,
        PanicType.PASSENGER,
        booking.tripId,
        `Emergency alert from passenger during trip ${trip.origin} → ${trip.destination}`,
        location || undefined
      )

      toast({
        title: "🚨 SOS Sent",
        description: "Admins and next of kin have been notified.",
      })
    } catch (error) {
      console.error("Failed to trigger SOS:", error)
      toast({
        title: "❌ SOS Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingSos(false) // re-enable if you want retry
    }
  }



  if (trip.status !== TripStatus.IN_PROGRESS) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Trip tracking will be available when your journey starts</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trip Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-green-500" />
            Live Trip Tracking
          </CardTitle>
          <CardDescription>
            {trip.origin} → {trip.destination}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Journey Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* ETA */}
          {estimatedArrival && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Estimated arrival: {estimatedArrival.toLocaleTimeString()}</span>
            </div>
          )}

          {/* Current Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                Current location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleEmergency}
            disabled={isSendingSos}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {isSendingSos ? "Sending SOS..." : "Emergency SOS"}
          </Button>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              {location ? (
                <>
                  <p>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
                  <p className="text-sm">Updating live...</p>
                </>
              ) : (
                <>
                  <p>Fetching location...</p>
                  <p className="text-sm">Waiting for GPS signal</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
