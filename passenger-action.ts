"use server"

import { prisma } from "./lib/prisma"
import { BookingStatus, KycStatus } from "@prisma/client"

// 🔹 Get all bookings for a passenger
export async function getBookingsByPassenger(passengerId: string) {
    return prisma.booking.findMany({
        where: { passengerId },
        include: { trip: true, passenger: true },
        orderBy: { createdAt: "desc" },
    })
}

// 🔹 Create a new booking
export async function createBooking(data: {
    passengerId: string
    tripId: string
    seatNumber: string
    qrCode: string
}) {
    // Check if trip exists
    const trip = await prisma.trip.findUnique({ where: { id: data.tripId } })
    if (!trip) {
        throw new Error("Trip does not exist")
    }

    // Check if seat is already taken
    const existingSeat = await prisma.booking.findFirst({
        where: { tripId: data.tripId, status: { not: "CANCELLED" } }
    })
    if (existingSeat) {
        throw new Error(`Seat ${data.seatNumber} is already booked`)
    }

    // Create booking
    return prisma.booking.create({
        data: {
            passengerId: data.passengerId,
            tripId: data.tripId,
            qrCode: data.qrCode,
            status: "CONFIRMED",
        },
    })
}

// 🔹 Cancel a booking
export async function cancelBooking(bookingId: string) {
    return prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
    })
}

// 🔹 Get passenger KYC
export async function getUserKyc(userId: string) {
//   return prisma.kyc.findUnique({
//     where: { userId },
//     include: { user: true }, // optional if relation exists
//   })
}


