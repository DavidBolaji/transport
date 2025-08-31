

import { TripStatus } from "@prisma/client"
import {getTripsByStatus, getTripById, createTrip, updateTripStatus} from "../trip-action"

export const tripService = {
  getTripsByStatus: async (status: TripStatus) => {
    return await getTripsByStatus(status)
  },

  getTripById: async (tripId: string) => {
    return await getTripById(tripId)
  },

  createTrip: async (data: {
    origin: string
    destination: string
    departureTime: Date
    driverId: string
  }) => {
    return await createTrip(data)
  },

  updateTripStatus: async (tripId: string, status: TripStatus) => {
    return await updateTripStatus(tripId, status)
  },

}
