"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { CalendarIcon, MapPin, DollarSign, Users, Clock } from "lucide-react"
import { AdminService } from "@/services/admin-service"
import { useToast } from "@/components/ui/use-toast"

interface TripCreationFormProps {
  onTripCreated: () => void
}

export function TripCreationForm({ onTripCreated }: TripCreationFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<{
    origin: string,
    destination: string,
    departureTime: Date,
    estimatedDuration: number,
    driverId: string | undefined
  }>({
    origin: "",
    destination: "",
    departureTime: new Date(),
    estimatedDuration: 0,
    driverId: undefined,
  })
  const [drivers, setDrivers] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [driversLoaded, setDriversLoaded] = useState(false)

  const loadDrivers = async () => {
    if (driversLoaded) return
    try {
      const verifiedDrivers = await AdminService.getVerifiedDrivers()
      setDrivers(verifiedDrivers)
      setDriversLoaded(true)
    } catch (error) {
      console.error("Failed to load drivers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await AdminService.createTrip(formData)
      onTripCreated()

      toast({
        title: "Trip Created 🎉",
        description: `Trip from ${formData.origin} to ${formData.destination} was successfully scheduled.`,
      })

      // Reset form
      setFormData({
        origin: "",
        destination: "",
        departureTime: new Date(),
        estimatedDuration: 0,
        driverId: undefined,
      })
    } catch (error) {
      console.error("Failed to create trip:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Create New Trip
        </CardTitle>
        <CardDescription>Schedule a new bus trip and assign a driver</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Departure city"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Arrival city"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Departure Time
              </Label>
              <Input
                id="departureTime"
                type="datetime-local"
                value={formatDateTimeLocal(formData.departureTime)}
                onChange={(e) => setFormData({ ...formData, departureTime: new Date(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (hours)
              </Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDuration: Number.parseFloat(e.target.value) || 0 })
                }
                placeholder="Estimated travel time"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Assign Driver (Optional)</Label>
            <Select
              value={formData.driverId || "none"}
              onValueChange={(value) => setFormData({ ...formData, driverId: value === "none" ? undefined : value })}
              onOpenChange={loadDrivers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a verified driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No driver assigned</SelectItem>
                {drivers.map((driver: any) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.fName} - {driver.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating Trip..." : "Create Trip"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
