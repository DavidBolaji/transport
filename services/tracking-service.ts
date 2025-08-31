export interface TrackingConfig {
  apiKey?: string
  baseUrl?: string
  enableRealTime?: boolean
}

export interface LocationData {
  latitude: number
  longitude: number
  timestamp: Date
  accuracy?: number
  speed?: number
  heading?: number
}

export interface TripTracking {
  tripId: string
  driverId: string
  currentLocation: LocationData
  route: LocationData[]
  estimatedArrival?: Date
  status: "started" | "in_progress" | "completed" | "delayed"
}

export class TrackingService {
  private static instance: TrackingService
  private config: TrackingConfig = {
    enableRealTime: true,
  }
  private activeTracking: Map<string, TripTracking> = new Map()
  private watchId: number | null = null

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService()
    }
    return TrackingService.instance
  }

  configure(config: TrackingConfig): void {
    this.config = { ...this.config, ...config }
  }

  async startTracking(tripId: string, driverId: string): Promise<{ success: boolean; error?: string }> {
    if (!navigator.geolocation) {
      return { success: false, error: "Geolocation not supported" }
    }

    try {
      const position = await this.getCurrentPosition()
      const initialLocation: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(),
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
      }

      const tracking: TripTracking = {
        tripId,
        driverId,
        currentLocation: initialLocation,
        route: [initialLocation],
        status: "started",
      }

      this.activeTracking.set(tripId, tracking)

      if (this.config.enableRealTime) {
        this.startRealTimeTracking(tripId)
      }

      // Send to external API if configured
      if (this.config.apiKey && this.config.baseUrl) {
        await this.sendTrackingData(tracking)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to start tracking" }
    }
  }

  async stopTracking(tripId: string): Promise<void> {
    const tracking = this.activeTracking.get(tripId)
    if (tracking) {
      tracking.status = "completed"

      // Send final update to external API
      if (this.config.apiKey && this.config.baseUrl) {
        await this.sendTrackingData(tracking)
      }
    }

    this.activeTracking.delete(tripId)

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  getTripTracking(tripId: string): TripTracking | null {
    return this.activeTracking.get(tripId) || null
  }

  getAllActiveTracking(): TripTracking[] {
    return Array.from(this.activeTracking.values())
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      })
    })
  }

  private startRealTimeTracking(tripId: string): void {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const tracking = this.activeTracking.get(tripId)
        if (tracking) {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          }

          tracking.currentLocation = newLocation
          tracking.route.push(newLocation)
          tracking.status = "in_progress"

          // Send real-time update to external API
          if (this.config.apiKey && this.config.baseUrl) {
            this.sendTrackingData(tracking).catch(console.error)
          }
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      },
    )
  }

  private async sendTrackingData(tracking: TripTracking): Promise<void> {
    if (!this.config.apiKey || !this.config.baseUrl) return

    try {
      const response = await fetch(`${this.config.baseUrl}/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(tracking),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to send tracking data:", error)
    }
  }

  // Mock method for demo purposes
  getMockTrackingData(tripId: string): TripTracking {
    return {
      tripId,
      driverId: "driver-1",
      currentLocation: {
        latitude: 6.5244 + Math.random() * 0.01,
        longitude: 3.3792 + Math.random() * 0.01,
        timestamp: new Date(),
        accuracy: 10,
        speed: 60,
        heading: 45,
      },
      route: [
        {
          latitude: 6.5244,
          longitude: 3.3792,
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          latitude: 6.5254,
          longitude: 3.3802,
          timestamp: new Date(Date.now() - 1800000),
        },
        {
          latitude: 6.5264,
          longitude: 3.3812,
          timestamp: new Date(),
        },
      ],
      estimatedArrival: new Date(Date.now() + 7200000),
      status: "in_progress",
    }
  }
}
