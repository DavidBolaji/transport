"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { mockUsers, mockTrips } from "@/lib/mock-data"
import { AlertTriangle, Clock, MapPin, User, Phone, CheckCircle, MessageSquare } from "lucide-react"
import { SosService } from "@/services/sos-service"

export function SosDashboard() {
  const [activeAlerts, setActiveAlerts] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [responseNotes, setResponseNotes] = useState("")

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await SosService.getActiveSosAlerts()
        setActiveAlerts(alerts)
      } catch (error) {
        console.error("Failed to fetch SOS alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    // Simulate real-time updates
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRespond = async (alertId: string, status: "acknowledged" | "dispatched" | "resolved") => {
    try {
      await SosService.respondToSos(alertId, "admin-1", status, responseNotes)

      if (status === "resolved") {
        setActiveAlerts((prev: any) => prev.filter((alert: any) => alert.id !== alertId))
      }

      setResponseNotes("")
      setSelectedAlert(null)
    } catch (error) {
      console.error("Failed to respond to SOS:", error)
    }
  }

  const getAlertPriority = (alert: any) => {
    const age = Date.now() - alert.timestamp.getTime()
    const minutes = Math.floor(age / (1000 * 60))

    if (minutes < 5) return { level: "critical", color: "bg-red-100 text-red-800" }
    if (minutes < 15) return { level: "high", color: "bg-orange-100 text-orange-800" }
    return { level: "medium", color: "bg-yellow-100 text-yellow-800" }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading SOS alerts...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SOS Emergency Dashboard</h2>
          <p className="text-muted-foreground">Monitor and respond to emergency alerts</p>
        </div>
        <Badge variant={activeAlerts.length > 0 ? "destructive" : "secondary"}>
          {activeAlerts.length} Active Alerts
        </Badge>
      </div>

      {activeAlerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Active Emergencies</h3>
            <p className="text-muted-foreground">All clear - no SOS alerts at this time</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Alerts ({activeAlerts.length})</TabsTrigger>
            <TabsTrigger value="map">Location Map</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeAlerts.map((alert: any) => {
              const user = mockUsers.find((u) => u.id === alert.userId)
              const trip = alert.tripId ? mockTrips.find((t) => t.id === alert.tripId) : null
              const priority = getAlertPriority(alert)
              const timeAgo = Math.floor((Date.now() - alert.timestamp.getTime()) / (1000 * 60))

              return (
                <Card key={alert.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-5 w-5" />
                          {alert.type} Emergency Alert
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={priority.color}>{priority.level.toUpperCase()}</Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {timeAgo} minutes ago
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRespond(alert.id, "acknowledged")}>
                          Acknowledge
                        </Button>
                        <Button size="sm" onClick={() => handleRespond(alert.id, "dispatched")}>
                          Dispatch Help
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setSelectedAlert(alert)}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">User Details</span>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          <p>
                            <strong>Name:</strong> {`${user?.fName} ${user?.lName}`}
                          </p>
                          <p>
                            <strong>Phone:</strong> {user?.phone}
                          </p>
                          <p>
                            <strong>Role:</strong> {alert.type}
                          </p>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location</span>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          {alert.location ? (
                            <>
                              <p>
                                <strong>Coordinates:</strong> {alert.location.latitude.toFixed(4)},{" "}
                                {alert.location.longitude.toFixed(4)}
                              </p>
                              <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                                View on Map
                              </Button>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Location not available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trip Information */}
                    {trip && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Trip Details</span>
                        </div>
                        <div className="pl-6 text-sm">
                          <p>
                            <strong>Route:</strong> {trip.origin} → {trip.destination}
                          </p>
                          <p>
                            <strong>Departure:</strong> {new Date(trip.departureTime).toLocaleString()}
                          </p>
                          <p>
                            <strong>Status:</strong> {trip.status}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    {alert.message && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Message</span>
                        </div>
                        <div className="pl-6 text-sm">
                          <p className="italic">"{alert.message}"</p>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contacts */}
                    {alert.emergencyContacts && alert.emergencyContacts.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Emergency Contacts Notified</span>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          {alert.emergencyContacts.map((contact: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {contact.name} ({contact.relationship})
                              </span>
                              <span className="text-muted-foreground">{contact.phone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Locations Map</CardTitle>
                <CardDescription>Real-time locations of active SOS alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Interactive map would be displayed here</p>
                    <p className="text-sm">Showing {activeAlerts.length} emergency locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Resolution Modal */}
      {selectedAlert && (
        <Card className="fixed inset-4 z-50 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Resolve Emergency Alert</CardTitle>
            <CardDescription>Add resolution notes and close this alert</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                placeholder="Describe how the emergency was resolved..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleRespond(selectedAlert.id, "resolved")} className="flex-1">
                Mark as Resolved
              </Button>
              <Button variant="outline" onClick={() => setSelectedAlert(null)} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
