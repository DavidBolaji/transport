import {
  getBookingsByPassenger,
  createBooking,
  cancelBooking,
  getUserKyc,
} from "../passenger-action"

export type PassengerBookings = Awaited<ReturnType<typeof getBookingsByPassenger>>
export type PassengerBooking = PassengerBookings[number]

export const BookingService = {
  getBookingsByPassenger,
  createBooking,
  cancelBooking,
  getUserKyc,
}
