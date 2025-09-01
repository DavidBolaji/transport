"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrService } from "@/services/qr-service"

import { Download, Share2, MapPin, Calendar, Clock, Heart as Seat } from "lucide-react"
import { Booking, BookingStatus, Trip } from "@prisma/client"

interface QrTicketProps {
  booking: Booking
  trip: Trip
  passenger: any
}

export function QrTicket({ booking, trip, passenger }: QrTicketProps) {
  const [showQr, setShowQr] = useState(false)

  const qrCode = QrService.generateQrCode(booking)
  const qrSvg = QrService.generateQrCodeSvg(qrCode)

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([generateTicketHtml()], { type: "text/html" })
    element.href = URL.createObjectURL(file)
    element.download = `ticket-${booking.id}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bus Ticket",
          text: `Bus ticket for ${trip.origin} to ${trip.destination}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCode)
    }
  }

  const generateTicketHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bus Ticket - ${booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .ticket { border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .details { margin: 10px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #111827; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1 style="text-align: center; color: #3b82f6;">ABC Transport Ticket</h1>
            <div class="qr-code">${qrSvg}</div>
            <div class="details">
              <div><span class="label">Passenger:</span> <span class="value">${`${passenger.fName} ${passenger.lName}`}</span></div>
              <div><span class="label">From:</span> <span class="value">${trip.origin}</span></div>
              <div><span class="label">To:</span> <span class="value">${trip.destination}</span></div>
              <div><span class="label">Departure:</span> <span class="value">${new Date(trip.departureTime).toLocaleString()}</span></div>
              <div><span class="label">Booking ID:</span> <span class="value">${booking.id}</span></div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-100 text-green-800"
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800"
      case BookingStatus.COMPLETED:
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          ABC Transport Ticket
        </CardTitle>
        <CardDescription>Digital bus ticket with QR code</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
        </div>

        {/* QR Code */}
        <div className="text-center">
          {showQr ? (
            <div className="space-y-4">
              <div
                className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="text-xs text-muted-foreground">Show this QR code to the driver for boarding</p>
            </div>
          ) : (
            <Button onClick={() => setShowQr(true)} variant="outline" className="w-full">
              Show QR Code
            </Button>
          )}
        </div>

        <Separator />

        {/* Trip Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{passenger.fName} {passenger.lName}</p>
              <p className="text-sm text-muted-foreground">{passenger.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {trip.origin} → {trip.destination}
              </p>
              <p className="text-sm text-muted-foreground">Route</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{new Date(trip.departureTime).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">Departure Date</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{new Date(trip.departureTime).toLocaleTimeString()}</p>
              <p className="text-sm text-muted-foreground">Departure Time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Seat className="h-5 w-5 text-muted-foreground" />
            <div>
             
              <p className="text-sm text-muted-foreground">Assigned Seat</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pickup and Dropoff */}
        

        <Separator />

        {/* Booking Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booked:</span>
            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
          </div>
        
        </div>

        {/* Action Buttons */}
        {booking.status === BookingStatus.CONFIRMED && (
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
