"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrService, type QrCodeData } from "@/services/qr-service"
import { mockBookings, mockUsers, mockTrips } from "@/lib/mock-data"
import { CheckCircle, XCircle, QrCode, AlertTriangle, User, MapPin } from "lucide-react"

export function QrValidator() {
  const [qrInput, setQrInput] = useState("")
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    data?: QrCodeData
    error?: string
    bookingDetails?: any
  } | null>(null)
  const [validating, setValidating] = useState(false)

  const handleValidate = async () => {
    if (!qrInput.trim()) return

    setValidating(true)
    try {
      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = QrService.validateQrCode(qrInput)

      if (result.valid && result.data) {
        // Get booking details
        const booking = mockBookings.find((b) => b.id === result.data!.bookingId)
        const passenger = mockUsers.find((u) => u.id === result.data!.passengerId)
        const trip = mockTrips.find((t) => t.id === result.data!.tripId)

        setValidationResult({
          ...result,
          bookingDetails: { booking, passenger, trip },
        })
      } else {
        setValidationResult(result)
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: "Validation failed",
      })
    } finally {
      setValidating(false)
    }
  }

  const handleClear = () => {
    setQrInput("")
    setValidationResult(null)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Validator
        </CardTitle>
        <CardDescription>Validate passenger QR codes for boarding verification</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste QR code data or scan QR code..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleValidate} disabled={validating || !qrInput.trim()}>
              {validating ? "Validating..." : "Validate"}
            </Button>
          </div>

          {qrInput && (
            <Button variant="outline" onClick={handleClear} className="w-full bg-transparent">
              Clear
            </Button>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div
            className={`p-6 rounded-lg border-2 ${
              validationResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            {validationResult.valid ? (
              <div className="space-y-4">
                {/* Success Header */}
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Valid Ticket</h3>
                    <p className="text-green-700">Passenger authorized for boarding</p>
                  </div>
                </div>

                {/* Passenger Details */}
                {validationResult.bookingDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Passenger Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Passenger Details</span>
                        </div>
                        <div className="pl-7 space-y-1">
                          <p className="font-semibold text-green-900">
                            {validationResult.bookingDetails.passenger?.fullName}
                          </p>
                          <p className="text-sm text-green-700">{validationResult.bookingDetails.passenger?.email}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              Seat {validationResult.data?.seatNumber}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Trip Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Trip Details</span>
                        </div>
                        <div className="pl-7 space-y-1">
                          <p className="font-semibold text-green-900">
                            {validationResult.bookingDetails.trip?.origin} →{" "}
                            {validationResult.bookingDetails.trip?.destination}
                          </p>
                          <p className="text-sm text-green-700">
                            {new Date(validationResult.bookingDetails.trip?.departureTime).toLocaleString()}
                          </p>
                          <p className="text-sm text-green-700">
                            Booking: {validationResult.bookingDetails.booking?.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pickup/Dropoff */}
                    <div className="border-t border-green-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Pickup:</span>
                          <p className="text-green-700">{validationResult.bookingDetails.booking?.pickupLocation}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Dropoff:</span>
                          <p className="text-green-700">{validationResult.bookingDetails.booking?.dropoffLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Info */}
                    <div className="border-t border-green-200 pt-4 text-xs text-green-600">
                      <p>QR Code generated: {new Date(validationResult.data!.timestamp).toLocaleString()}</p>
                      <p>Validation hash: {validationResult.data!.hash}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Error Header */}
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Invalid Ticket</h3>
                    <p className="text-red-700">Passenger not authorized for boarding</p>
                  </div>
                </div>

                {/* Error Details */}
                <div className="flex items-start gap-2 pl-11">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Error Details:</p>
                    <p className="text-red-700">{validationResult.error}</p>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="pl-11 text-sm text-red-600">
                  <p className="font-medium">Possible issues:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>QR code has expired (older than 24 hours)</li>
                    <li>Invalid or corrupted QR code data</li>
                    <li>Booking has been cancelled or modified</li>
                    <li>QR code is not from this system</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">How to use:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ask passenger to show their QR code ticket</li>
            <li>Scan the QR code or have passenger share the code data</li>
            <li>Paste the QR code data in the input field above</li>
            <li>Click "Validate" to verify the ticket</li>
            <li>Allow boarding only for valid tickets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
