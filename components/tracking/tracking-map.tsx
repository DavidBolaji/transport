"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Settings } from "lucide-react"
import { TrackingService, type TripTracking, type TrackingConfig } from "@/services/tracking-service"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TrackingMapProps {
  tripId: string
  driverId?: string
  showConfig?: boolean
}

export function TrackingMap({ tripId, driverId, showConfig = false }: TrackingMapProps) {
  const [tracking, setTracking] = useState<TripTracking | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [config, setConfig] = useState<TrackingConfig>({
    apiKey: "",
    baseUrl: "",
    enableRealTime: true,
  })
  const [showSettings, setShowSettings] = useState(false)

  const trackingService = TrackingService.getInstance()

  useEffect(() => {
    // Load mock data for demo
    const mockData = trackingService.getMockTrackingData(tripId)
    setTracking(mockData)
  }, [tripId])

  const handleStartTracking = async () => {
    if (!driverId) return

    trackingService.configure(config)
    const result = await trackingService.startTracking(tripId, driverId)

    if (result.success) {
      setIsTracking(true)
      // Update tracking data every 30 seconds for demo
      const interval = setInterval(() => {
        const updatedTracking = trackingService.getTripTracking(tripId)
        if (updatedTracking) {
          setTracking(updatedTracking)
        }
      }, 30000)

      return () => clearInterval(interval)
    } else {
      alert(result.error)
    }
  }

  const handleStopTracking = async () => {
    await trackingService.stopTracking(tripId)
    setIsTracking(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return "bg-blue-500"
      case "in_progress":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tracking Configuration
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                {showSettings ? "Hide" : "Show"} Settings
              </Button>
            </CardTitle>
          </CardHeader>
          {showSettings && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your tracking API key"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    placeholder="https://api.yourtracking.com"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="realtime"
                  checked={config.enableRealTime}
                  onCheckedChange={(checked) => setConfig({ ...config, enableRealTime: checked })}
                />
                <Label htmlFor="realtime">Enable Real-time Tracking</Label>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Trip Tracking
            </div>
            {tracking && (
              <Badge className={getStatusColor(tracking.status)}>
                {tracking.status.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracking ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    Current Location
                  </div>
                  <div className="text-sm">
                    <div>Lat: {tracking.currentLocation.latitude.toFixed(6)}</div>
                    <div>Lng: {tracking.currentLocation.longitude.toFixed(6)}</div>
                    {tracking.currentLocation.speed && <div>Speed: {tracking.currentLocation.speed} km/h</div>}
                  </div>
                </div>

                {tracking.estimatedArrival && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Estimated Arrival
                    </div>
                    <div className="text-sm">{tracking.estimatedArrival.toLocaleTimeString()}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Route Progress</div>
                <div className="text-sm">{tracking.route.length} location updates recorded</div>
                <div className="text-xs text-muted-foreground">
                  Last update: {tracking.currentLocation.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {driverId && (
                <div className="flex gap-2">
                  {!isTracking ? (
                    <Button onClick={handleStartTracking} className="flex-1">
                      Start Tracking
                    </Button>
                  ) : (
                    <Button onClick={handleStopTracking} variant="destructive" className="flex-1">
                      Stop Tracking
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No tracking data available for this trip</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
