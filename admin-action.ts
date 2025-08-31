"use server"

import { UserRole, TripStatus, KycStatus } from "@prisma/client"
import { prisma } from "./lib/prisma"

// 🔹 Admin stats
export async function getAdminStats() {
  const [totalUsers, totalDrivers, totalPassengers, activeTrips, pendingKyc] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.DRIVER } }),
      prisma.user.count({ where: { role: UserRole.PASSENGER } }),
      prisma.trip.count({ where: { status: TripStatus.IN_PROGRESS } }),
      prisma.kyc.count({ where: { status: KycStatus.PENDING } }),
    ])

  return {
    totalUsers,
    totalDrivers,
    totalPassengers,
    activeTrips,
    pendingKyc,
  }
}

// 🔹 All users with KYC
export async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: { kyc: true },
    orderBy: { createdAt: "desc" },
  })

  return users.map(u => ({
    ...u,
    kycDetails: u.kyc,
  }))
}

// 🔹 All trips
export async function getAllTrips() {
return prisma.trip.findMany({
  include: {
    driver: true,
  },
  orderBy: { departureTime: "desc" },
})
}

// 🔹 Panic alerts
export async function getPanicAlerts() {
  return prisma.panicAlert.findMany({
    orderBy: { createdAt: "desc" },
  })
}

// 🔹 Suspend user (soft delete idea: mark with reason or status)
export async function suspendUser(userId: string, reason: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      // add a field if you want (like `suspended: true`)
      // for now, let’s just update `updatedAt` as placeholder
      updatedAt: new Date(),
    },
  })
}

// 🔹 Resolve alert
export async function resolveAlert(alertId: string) {
  return prisma.panicAlert.update({
    where: { id: alertId },
    data: { resolved: true },
  })
}

// 🔹 Reports generator (simple examples)
export async function generateReport(type: "trips" | "users" | "incidents") {
  switch (type) {
    case "trips":
      return prisma.trip.findMany()
    case "users":
      return prisma.user.findMany({ include: { kyc: true } })
    case "incidents":
      return prisma.panicAlert.findMany()
    default:
      return []
  }
}

// 🔹 Get all verified drivers (drivers with APPROVED KYC)
export async function getVerifiedDrivers() {
  const drivers = await prisma.user.findMany({
    where: {
      role: UserRole.DRIVER,
      kyc: { status: KycStatus.VERIFIED },
    },
    include: { kyc: true },
    orderBy: { createdAt: "desc" },
  })

  return drivers.map(d => ({
    id: d.id,
    fullName: `${d.fName} ${d.lName}`,
    email: d.email,
    phone: d.phone,
    kycStatus: d.kyc?.status,
  }))
}

// 🔹 Create a new trip
export async function createTrip(data: {
  origin: string
  destination: string
  departureTime: Date
  estimatedDuration: number
  driverId?: string
}) {
  console.log(data.driverId)
const driver = await prisma.user.findUnique({
  where: { id: data.driverId },
});

if (!driver || driver.role !== UserRole.DRIVER) {
  throw new Error("Driver does not exist or is not a valid driver");
}
  const trip = await prisma.trip.create({
    data: {
      origin: data.origin,
      destination: data.destination,
      departureTime: data.departureTime,
      status: TripStatus.SCHEDULED,
      driverId: data.driverId ?? null,
    },
  })

  return trip
}