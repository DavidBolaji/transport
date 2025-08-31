import {
  getAdminStats,
  getAllUsers,
  getAllTrips,
  getPanicAlerts,
  suspendUser,
  resolveAlert,
  generateReport,
  getVerifiedDrivers,
  createTrip
} from "../admin-action"

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>
export type UserWithKyc = Awaited<ReturnType<typeof getAllUsers>>[number]

export const AdminService = {
  getAdminStats,
  getAllUsers,
  getAllTrips,
  getPanicAlerts,
  suspendUser,
  resolveAlert,
  generateReport,
  getVerifiedDrivers,
  createTrip
}
