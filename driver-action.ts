"use server"

import { prisma } from "@/lib/prisma"
import { TripStatus } from "@prisma/client"

// Get trips assigned to a driver (with passengers)
export async function getAssignedTrips(driverId: string) {
  return prisma.trip.findMany({
    where: { driverId },
    include: {
      bookings: {
        include: {
          passenger: true,
        },
      },
    },
    orderBy: { departureTime: "asc" },
  })
}

// Start a trip
export async function startTrip(tripId: string) {
  return prisma.trip.update({
    where: { id: tripId },
    data: { status: TripStatus.IN_PROGRESS },
  })
}

// End a trip
export async function endTrip(tripId: string) {
  return prisma.trip.update({
    where: { id: tripId },
    data: {
      status: TripStatus.COMPLETED,
      arrivalTime: new Date(),
    },
  })
}

// Validate QR Code (bookingId encoded in QR)
export async function validateQrCode(qrCode: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: qrCode },
    include: { passenger: true, trip: true },
  })

  if (!booking) return { valid: false }

  if (booking.status !== "CONFIRMED") {
    return { valid: false, booking }
  }

  return {
    valid: true,
    booking,
    passenger: {
      id: booking.passenger.id,
      fullName: `${booking.passenger.fName} ${booking.passenger.lName}`,
    },
  }
}
