import { Booking } from "@prisma/client"


export interface QrCodeData {
  bookingId: string
  passengerId: string
  tripId: string
  timestamp: number
  hash: string
}

export class QrService {
  // Generate QR code data for a booking
  static generateQrCode(booking: Booking): string {
    const qrData: QrCodeData = {
      bookingId: booking.id,
      passengerId: booking.passengerId,
      tripId: booking.tripId,
      timestamp: Date.now(),
      hash: this.generateHash(booking.id, booking.passengerId, booking.tripId),
    }

    // In a real app, this would be encrypted and signed
    return btoa(JSON.stringify(qrData))
  }

  // Validate QR code and return booking details
  static validateQrCode(qrCode: string): { valid: boolean; data?: QrCodeData; error?: string } {
    try {
      const decoded = atob(qrCode)
      const qrData: QrCodeData = JSON.parse(decoded)

      // Validate hash
      const expectedHash = this.generateHash(qrData.bookingId, qrData.passengerId, qrData.tripId)
      if (qrData.hash !== expectedHash) {
        return { valid: false, error: "Invalid QR code signature" }
      }

      // Check if QR code is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (Date.now() - qrData.timestamp > maxAge) {
        return { valid: false, error: "QR code has expired" }
      }

      return { valid: true, data: qrData }
    } catch (error) {
      return { valid: false, error: "Invalid QR code format" }
    }
  }

  // Generate a simple hash for validation (in production, use proper cryptographic signing)
  private static generateHash(bookingId: string, passengerId: string, tripId: string): string {
    const data = `${bookingId}-${passengerId}-${tripId}-${process.env.QR_SECRET || "default-secret"}`
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Generate QR code SVG for display
  static generateQrCodeSvg(qrCode: string): string {
    // This is a simplified QR code representation
    // In production, use a proper QR code library like 'qrcode'
    const size = 200
    const modules = 25
    const moduleSize = size / modules

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${size}" height="${size}" fill="white"/>`

    // Generate a pattern based on the QR code data
    const hash = qrCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const shouldFill = (hash + row * modules + col) % 3 === 0
        if (shouldFill) {
          const x = col * moduleSize
          const y = row * moduleSize
          svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
        }
      }
    }

    // Add corner squares (typical QR code pattern)
    const cornerSize = moduleSize * 7
    const positions = [
      { x: 0, y: 0 },
      { x: size - cornerSize, y: 0 },
      { x: 0, y: size - cornerSize },
    ]

    positions.forEach(({ x, y }) => {
      svg += `<rect x="${x}" y="${y}" width="${cornerSize}" height="${cornerSize}" fill="black"/>`
      svg += `<rect x="${x + moduleSize}" y="${y + moduleSize}" width="${cornerSize - 2 * moduleSize}" height="${cornerSize - 2 * moduleSize}" fill="white"/>`
      svg += `<rect x="${x + 2 * moduleSize}" y="${y + 2 * moduleSize}" width="${cornerSize - 4 * moduleSize}" height="${cornerSize - 4 * moduleSize}" fill="black"/>`
    })

    svg += "</svg>"
    return svg
  }
}
