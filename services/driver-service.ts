// import { type Trip, type Booking, type User, TripStatus, BookingStatus } from "@/types"
// import { mockTrips, mockBookings, mockUsers } from "@/lib/mock-data"

// export interface TripWithPassengers extends Trip {
//   passengers: Array<{
//     booking: Booking
//     passenger: User
//   }>
// }

// export class DriverService {
//   static async getDriverTrips(driverId: string): Promise<TripWithPassengers[]> {
//     await new Promise((resolve) => setTimeout(resolve, 300))

//     const driverTrips = mockTrips.filter((trip) => trip.driverId === driverId)

//     return driverTrips.map((trip) => {
//       const tripBookings = mockBookings.filter(
//         (booking) => booking.tripId === trip.id && booking.status === BookingStatus.CONFIRMED,
//       )

//       const passengers = tripBookings.map((booking) => {
//         const passenger = mockUsers.find((user) => user.id === booking.passengerId)!
//         return { booking, passenger }
//       })

//       return { ...trip, passengers }
//     })
//   }

//   static async getAssignedTrips(driverId: string): Promise<TripWithPassengers[]> {
//     await new Promise((resolve) => setTimeout(resolve, 300))

//     // Get trips specifically assigned to this driver
//     const assignedTrips = mockTrips.filter((trip) => trip.driverId === driverId)

//     return assignedTrips.map((trip) => {
//       const tripBookings = mockBookings.filter(
//         (booking) => booking.tripId === trip.id && booking.status === BookingStatus.CONFIRMED,
//       )

//       const passengers = tripBookings.map((booking) => {
//         const passenger = mockUsers.find((user) => user.id === booking.passengerId)!
//         return { booking, passenger }
//       })

//       return { ...trip, passengers }
//     })
//   }

//   static async startTrip(tripId: string): Promise<Trip> {
//     await new Promise((resolve) => setTimeout(resolve, 500))

//     const trip = mockTrips.find((t) => t.id === tripId)
//     if (!trip) throw new Error("Trip not found")

//     trip.status = TripStatus.IN_PROGRESS
//     trip.updatedAt = new Date()

//     return trip
//   }

//   static async endTrip(tripId: string): Promise<Trip> {
//     await new Promise((resolve) => setTimeout(resolve, 500))

//     const trip = mockTrips.find((t) => t.id === tripId)
//     if (!trip) throw new Error("Trip not found")

//     trip.status = TripStatus.COMPLETED
//     trip.arrivalTime = new Date()
//     trip.updatedAt = new Date()

//     // Update all bookings to completed
//     mockBookings
//       .filter((booking) => booking.tripId === tripId)
//       .forEach((booking) => {
//         booking.status = BookingStatus.COMPLETED
//       })

//     return trip
//   }

//   static async validateQrCode(qrCode: string): Promise<{ valid: boolean; booking?: Booking; passenger?: User }> {
//     await new Promise((resolve) => setTimeout(resolve, 200))

//     const booking = mockBookings.find((b) => b.qrCode === qrCode && b.status === BookingStatus.CONFIRMED)
//     if (!booking) return { valid: false }

//     const passenger = mockUsers.find((u) => u.id === booking.passengerId)
//     return { valid: true, booking, passenger }
//   }

//   static async updateLocation(driverId: string, latitude: number, longitude: number): Promise<void> {
//     await new Promise((resolve) => setTimeout(resolve, 100))
//     // In real app, this would update the driver's location in the database
//     console.log(`Driver ${driverId} location updated: ${latitude}, ${longitude}`)
//   }
// }

import { getAssignedTrips, startTrip, endTrip, validateQrCode } from "../driver-action"

export type TripWithPassengers = Awaited<ReturnType<typeof getAssignedTrips>>[number]

export const DriverService = {
  getAssignedTrips: async (driverId: string) => {
    return getAssignedTrips(driverId)
  },

  startTrip: async (tripId: string) => {
    return startTrip(tripId)
  },

  endTrip: async (tripId: string) => {
    return endTrip(tripId)
  },

  validateQrCode: async (qrCode: string) => {
    return validateQrCode(qrCode)
  },
}
