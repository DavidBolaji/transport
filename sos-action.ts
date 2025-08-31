"use server"

import { PanicType } from "@prisma/client";
import { prisma } from "./lib/prisma"



export async function getActiveSosAlerts() {
  return prisma.panicAlert.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
  })
}

export async function triggerSos(
  userId: string,
  type: PanicType,
  tripId?: string,
  message?: string,
  location?: { lat: number; lng: number }
) {

  if(!location) return;

  return await prisma.panicAlert.create({
    data: {
      userId,
      tripId,
      type,
      message: message || "Emergency alert triggered!",
      latitude: location?.lat,
      longitude: location.lng
    },
  })
}

export async function respondToSos(
  alertId: string,
  adminId: string,
  status: "acknowledged" | "dispatched" | "resolved",
  notes?: string,
) {

  const resolved = status === "resolved"

  return prisma.panicAlert.update({
    where: { id: alertId },
    data: { resolved },
  })
}