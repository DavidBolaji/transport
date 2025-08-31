"use server"


import { KycStatus } from "@prisma/client"
import { prisma } from "./lib/prisma"

interface KycDocInput {
  type: "nin" | "license" | "policeClearance"
  documentNumber: string
  url: string
}

export async function verifyKyc(kycId: string, adminId: string, approved: boolean) {
  return prisma.kyc.update({
    where: { id: kycId },
    data: {
      status: approved ? KycStatus.VERIFIED : KycStatus.REJECTED,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
  })
}

export async function uploadKycDocuments(userId: string, docs: KycDocInput[]) {
  // Upsert the KYC record for the user
  return prisma.kyc.upsert({
    where: { id: (await prisma.user.findUnique({ where: { id: userId } }))?.kycId || "" },
    update: {
      nin: docs.find(d => d.type === "nin")?.documentNumber || undefined,
      license: docs.find(d => d.type === "license")?.documentNumber || undefined,
      policeClearance: docs.find(d => d.type === "policeClearance")?.documentNumber || undefined,
      // optionally save urls in extra fields if you add them in schema
    },
    create: {
      nin: docs.find(d => d.type === "nin")?.documentNumber,
      license: docs.find(d => d.type === "license")?.documentNumber,
      policeClearance: docs.find(d => d.type === "policeClearance")?.documentNumber,
      user: { connect: { id: userId } },
    },
  })
}

export async function getUserKyc(userId: string) {
  return prisma.kyc.findFirst({
    where: { user: {
        id: userId
    } },
   
  })
}

