"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { KycService } from "@/services/kyc-service"
import { useAuth } from "@/contexts/auth-context"
import { type Kyc, KycStatus } from "@/types"

export function KycStatusCard() {
  const { user } = useAuth()
  const [kyc, setKyc] = useState<Kyc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKyc = async () => {
      if (!user) return

      try {
        const kycData = await KycService.getUserKyc(user.id)
        setKyc(kycData)
      } catch (error) {
        console.error("Failed to fetch KYC:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKyc()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!kyc) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Verification Required
          </CardTitle>
          <CardDescription>You need to complete document verification to access all features.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getStatusIcon = (status: KycStatus) => {
    switch (status) {
      case KycStatus.VERIFIED:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case KycStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case KycStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: KycStatus) => {
    switch (status) {
      case KycStatus.VERIFIED:
        return "bg-green-100 text-green-800"
      case KycStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case KycStatus.REJECTED:
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon(kyc.status)}
            <span className="ml-2">Verification Status</span>
          </span>
          <Badge className={getStatusColor(kyc.status)}>{kyc.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {kyc.nin && (
            <div className="flex justify-between">
              <span>National ID:</span>
              <span className="font-mono">***{kyc.nin.slice(-4)}</span>
            </div>
          )}
          {kyc.license && (
            <div className="flex justify-between">
              <span>Driver's License:</span>
              <span className="font-mono">***{kyc.license.slice(-4)}</span>
            </div>
          )}
          {kyc.policeClearance && (
            <div className="flex justify-between">
              <span>Police Clearance:</span>
              <span className="font-mono">***{kyc.policeClearance.slice(-4)}</span>
            </div>
          )}
          {kyc.verifiedAt && (
            <div className="flex justify-between">
              <span>Verified:</span>
              <span>{new Date(kyc.verifiedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
