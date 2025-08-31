"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "./stats-card"
import { KycStatusCard } from "@/components/kyc/kyc-status"
import { KycUpload } from "@/components/kyc/kyc-upload"
import { DriverService, type TripWithPassengers } from "@/services/driver-service"
import { KycService } from "@/services/kyc-service"
import { useAuth } from "@/contexts/auth-context"
import { TripStatus, KycStatus } from "@/types"
import { Car, Users, MapPin, Clock, Play, Square, QrCode, AlertTriangle, Navigation, CheckCircle } from "lucide-react"

export function DriverDashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<TripWithPassengers[]>([])
  const [loading, setLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [driverTrips, kycData] = await Promise.all([
          DriverService.getAssignedTrips(user.id),
          KycService.getUserKyc(user.id),
        ])

        setTrips(driverTrips)
        setIsVerified(kycData?.status === KycStatus.VERIFIED)
      } catch (error) {
        console.error("Failed to fetch driver data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleStartTrip = async (tripId: string) => {
    try {
      await DriverService.startTrip(tripId)
      setTrips((prev) => prev.map((trip) => (trip.id === tripId ? { ...trip, status: TripStatus.IN_PROGRESS } : trip)))
    } catch (error) {
      console.error("Failed to start trip:", error)
    }
  }

  const handleEndTrip = async (tripId: string) => {
    try {
      await DriverService.endTrip(tripId)
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, status: TripStatus.COMPLETED, arrivalTime: new Date() } : trip,
        ),
      )
    } catch (error) {
      console.error("Failed to end trip:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <p className="text-muted-foreground">Complete verification to start driving</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KycStatusCard />
          <KycUpload />
        </div>
      </div>
    )
  }

  const activeTrips = trips.filter((trip) => trip.status === TripStatus.IN_PROGRESS)
  const scheduledTrips = trips.filter((trip) => trip.status === TripStatus.SCHEDULED)
  const completedTrips = trips.filter((trip) => trip.status === TripStatus.COMPLETED)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
        <p className="text-muted-foreground">Manage your assigned trips and passengers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Trips"
          value={activeTrips.length.toString()}
          description="Currently in progress"
          icon={<Car className="h-4 w-4" />}
        />
        <StatsCard
          title="Scheduled Trips"
          value={scheduledTrips.length.toString()}
          description="Upcoming trips"
          icon={<Clock className="h-4 w-4" />}
        />
      
        <StatsCard
          title="Completed Trips"
          value={completedTrips.length.toString()}
          description="Successfully finished"
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {trips.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Trips Assigned</h3>
              <p>You don't have any trips assigned yet. Contact your administrator to get trips assigned to you.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {trips.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">
              Active Trips
              {activeTrips.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeTrips.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled
              {scheduledTrips.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {scheduledTrips.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="qr-scanner">QR Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTrips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-green-500" />
                      Current Trip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeTrips.map((trip) => (
                      <div key={trip.id} className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {trip.origin} → {trip.destination}
                            </p>
                           
                          </div>
                          <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                        </div>
                        <Button onClick={() => handleEndTrip(trip.id)} className="w-full" variant="destructive">
                          <Square className="h-4 w-4 mr-2" />
                          End Trip
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {scheduledTrips.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Next Trip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scheduledTrips.slice(0, 1).map((trip) => (
                      <div key={trip.id} className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              {trip.origin} → {trip.destination}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trip.departureTime).toLocaleString()}
                            </p>
                           
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                        </div>
                        <Button onClick={() => handleStartTrip(trip.id)} className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Trip
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {activeTrips.length === 0 && scheduledTrips.length === 0 && (
                <Card className="lg:col-span-2">
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground py-8">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Active or Scheduled Trips</h3>
                      <p>All your assigned trips have been completed. Check back later for new assignments.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTrips.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active trips</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onEndTrip={handleEndTrip} showEndButton />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledTrips.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled trips</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scheduledTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onStartTrip={handleStartTrip} showStartButton />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qr-scanner">
            <QrScanner />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function TripCard({
  trip,
  onStartTrip,
  onEndTrip,
  showStartButton = false,
  showEndButton = false,
}: {
  trip: TripWithPassengers
  onStartTrip?: (tripId: string) => void
  onEndTrip?: (tripId: string) => void
  showStartButton?: boolean
  showEndButton?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {trip.origin} → {trip.destination}
            </CardTitle>
            <CardDescription>Departure: {new Date(trip.departureTime).toLocaleString()}</CardDescription>
          </div>
          <Badge
            className={
              trip.status === TripStatus.IN_PROGRESS
                ? "bg-green-100 text-green-800"
                : trip.status === TripStatus.SCHEDULED
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
            }
          >
            {trip.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
       
        <div className="flex gap-2">
          {showStartButton && onStartTrip && (
            <Button onClick={() => onStartTrip(trip.id)} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Trip
            </Button>
          )}
          {showEndButton && onEndTrip && (
            <Button onClick={() => onEndTrip(trip.id)} variant="destructive" className="flex-1">
              <Square className="h-4 w-4 mr-2" />
              End Trip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QrScanner() {
  const [qrCode, setQrCode] = useState("")
  const [scanResult, setScanResult] = useState<{
    valid: boolean
    booking?: any
    passenger?: any
  } | null>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    if (!qrCode.trim()) return

    setScanning(true)
    try {
      const result = await DriverService.validateQrCode(qrCode)
      setScanResult(result)
    } catch (error) {
      console.error("QR scan failed:", error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>Scan passenger QR codes to validate bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter QR code or scan..."
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <Button onClick={handleScan} disabled={scanning || !qrCode.trim()}>
            {scanning ? "Scanning..." : "Validate"}
          </Button>
        </div>

        {scanResult && (
          <div
            className={`p-4 rounded-md ${
              scanResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            {scanResult.valid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Valid Ticket</span>
                </div>
                <div className="text-sm text-green-700">
                  <p>
                    <strong>Passenger:</strong> {scanResult.passenger?.fullName}
                  </p>
                  <p>
                    <strong>Seat:</strong> {scanResult.booking?.seatNumber}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {scanResult.booking?.pickupLocation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Invalid or Expired Ticket</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
