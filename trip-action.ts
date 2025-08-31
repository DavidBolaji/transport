"use server"

import { prisma } from "@/lib/prisma"
import { TripStatus } from "@prisma/client"

// 🔹 Get trips by status
export async function getTripsByStatus(status: TripStatus) {
  return prisma.trip.findMany({
    where: { status },
    include: {
      driver: {
        select: { id: true, fName: true, lName: true, phone: true },
      },
      bookings: true,
    },
    orderBy: { departureTime: "asc" },
  })
}

// 🔹 Get single trip by ID
export async function getTripById(tripId: string) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      driver: { select: { id: true, fName: true, lName: true, phone: true } },
      bookings: true,
    },
  })
}

// 🔹 Create a new trip
export async function createTrip(data: {
  origin: string
  destination: string
  departureTime: Date
  driverId: string
}) {
  return prisma.trip.create({
    data: {
      origin: data.origin,
      destination: data.destination,
      departureTime: data.departureTime,
      status: TripStatus.SCHEDULED,
      driverId: data.driverId,
    },
  })
}

// 🔹 Update trip status
export async function updateTripStatus(tripId: string, status: TripStatus) {
  return prisma.trip.update({
    where: { id: tripId },
    data: { status },
  })
}
