// services/kyc-service.ts
import { uploadKycDocuments, getUserKyc, verifyKyc } from "../kyc-action"

export interface KycDocument {
  type: "nin" | "license" | "policeClearance"
  documentNumber: string
  url: string
}

export const KycService = {
  uploadKycDocuments,
  getUserKyc,
  verifyKyc
}