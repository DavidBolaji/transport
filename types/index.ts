export enum UserRole {
  PASSENGER = "PASSENGER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export enum KycStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PanicType {
  PASSENGER = "PASSENGER",
  DRIVER = "DRIVER",
}

export interface User {
  id: string
  email: string
  phone?: string
  password: string
  fName: string
  lName: string
  role: UserRole
  kyc?: Kyc
  kycId?: string
  driverProfile?: Driver
  driverId?: string
  bookings: Booking[]
  ratings: Rating[]
  panicAlerts: PanicAlert[]
  createdAt: Date
  updatedAt: Date
}

export interface Kyc {
  id: string
  nin?: string
  license?: string
  policeClearance?: string
  status: KycStatus
  verifiedBy?: string
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Driver {
  id: string
  trips: Trip[]
}

export interface Trip {
  id: string
  driver?: Driver
  driverId?: string
  origin: string
  destination: string
  departureTime: Date
  arrivalTime?: Date
  status: TripStatus
  price: number
  availableSeats: number
  estimatedDuration: number
  bookings: Booking[]
  panicAlerts: PanicAlert[]
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  trip: Trip
  tripId: string
  passenger: User
  passengerId: string
  qrCode: string
  seatNumber: number
  pickupLocation: string
  dropoffLocation: string
  status: BookingStatus
  createdAt: Date
  updatedAt: Date
}

export interface PanicAlert {
  id: string
  user: User
  userId: string
  trip?: Trip
  tripId?: string
  type: PanicType
  message?: string
  resolved: boolean
  createdAt: Date
}

export interface Rating {
  id: string
  passenger: User
  passengerId: string
  trip: Trip
  tripId: string
  score: number
  comment?: string
  createdAt: Date
}
