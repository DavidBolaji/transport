"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SosService } from "@/services/sos-service"
import { useAuth } from "@/contexts/auth-context"
import { PanicType } from "@/types"
import { AlertTriangle, Phone, MapPin, Clock, Shield } from "lucide-react"

interface SosButtonProps {
  tripId?: string
  variant?: "passenger" | "driver"
  className?: string
}

export function SosButton({ tripId, variant = "passenger", className }: SosButtonProps) {
  const { user } = useAuth()
  const [isTriggering, setIsTriggering] = useState(false)
  const [sosTriggered, setSosTriggered] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSosClick = async () => {
    if (!user) return

    // Start 3-second countdown
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          triggerSos()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const triggerSos = async () => {
    if (!user) return

    setIsTriggering(true)
    try {
      const location = await SosService.getCurrentLocation()
      const type = variant === "driver" ? PanicType.DRIVER : PanicType.PASSENGER

      await SosService.triggerSos(user.id, type, tripId, `Emergency alert from ${variant}`, location || undefined)

      setSosTriggered(true)
    } catch (error) {
      console.error("Failed to trigger SOS:", error)
    } finally {
      setIsTriggering(false)
    }
  }

  const cancelSos = () => {
    setCountdown(0)
  }

  if (sosTriggered) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            SOS Alert Sent
          </CardTitle>
          <CardDescription className="text-red-700">
            Emergency services and your contacts have been notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <Clock className="h-4 w-4" />
            <span>Alert sent at {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-700">
            <Phone className="h-4 w-4" />
            <span>Emergency contacts notified</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-700">
            <MapPin className="h-4 w-4" />
            <span>Location shared with responders</span>
          </div>
          <Badge className="bg-red-100 text-red-800">Help is on the way</Badge>
        </CardContent>
      </Card>
    )
  }

  if (countdown > 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-orange-600">{countdown}</div>
            <p className="text-orange-800 font-medium">SOS will be triggered in {countdown} seconds</p>
            <Button variant="outline" onClick={cancelSos} className="bg-white">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button
      variant="destructive"
      size="lg"
      className={`gap-2 ${className}`}
      onClick={handleSosClick}
      disabled={isTriggering}
    >
      <AlertTriangle className="h-5 w-5" />
      {isTriggering ? "Triggering SOS..." : "Emergency SOS"}
    </Button>
  )
}
