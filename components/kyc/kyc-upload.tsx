"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { KycService, type KycDocument } from "@/services/kyc-service"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import Cloudinary from "../../request/cloudinary"

export function KycUpload() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileChange = async (
    type: "nin" | "license" | "policeClearance",
    file: File | null,
    documentNumber: string
  ) => {
    if (!file) return

    // upload to Cloudinary
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!)

    const response = await Cloudinary.post("/auto/upload", formData)
    const { secure_url } = response.data

    setDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.type !== type)
      return [...filtered, { type, file, documentNumber, url: secure_url }]
    })
  }

  const handleUpload = async () => {
    if (!user || documents.length === 0) return

    setUploading(true)
    try {
      await KycService.uploadKycDocuments(user.id, documents)
      setUploadComplete(true)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const requiredDocs =
    user?.role === UserRole.DRIVER
      ? [
          { type: "nin" as const, label: "National ID (NIN)", required: true },
          { type: "license" as const, label: "Driver's License", required: true },
          { type: "policeClearance" as const, label: "Police Clearance", required: true },
        ]
      : [{ type: "nin" as const, label: "National ID (NIN)", required: true }]

  if (uploadComplete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Documents Uploaded Successfully</h3>
            <p className="text-muted-foreground">
              Your documents are being reviewed. You'll be notified once verification is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
        <CardDescription>
          Upload your documents for identity verification. All documents must be clear and valid.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {requiredDocs.map(({ type, label, required }) => (
          <div key={type} className="space-y-2">
            <Label htmlFor={`${type}-file`}>
              {label} {required && "*"}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  id={`${type}-file`}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    const docNumber = (document.getElementById(`${type}-number`) as HTMLInputElement)?.value || ""
                    handleFileChange(type, file || null, docNumber)
                  }}
                />
              </div>
              <div>
                <Input
                  id={`${type}-number`}
                  placeholder="Document Number"
                  onChange={(e) => {
                    const file = (document.getElementById(`${type}-file`) as HTMLInputElement)?.files?.[0]
                    if (file) {
                      handleFileChange(type, file, e.target.value)
                    }
                  }}
                />
              </div>
            </div>
            {documents.find((doc) => doc.type === type) && (
              <div className="flex items-center text-sm text-green-600">
                <FileText className="h-4 w-4 mr-1" />
                Document ready for upload
              </div>
            )}
          </div>
        ))}

        <Button onClick={handleUpload} disabled={uploading || documents.length === 0} className="w-full">
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading Documents...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
