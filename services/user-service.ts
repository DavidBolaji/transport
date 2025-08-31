import type { User, UserRole } from "@/types"
import { mockUsers } from "@/lib/mock-data"

export interface IUserService {
  getUserById(id: string): Promise<User | null>
  getUsersByRole(role: UserRole): Promise<User[]>
  getAllUsers(): Promise<User[]>
  updateUser(id: string, updates: Partial<User>): Promise<User | null>
}

export class UserService implements IUserService {
  private users: User[] = mockUsers

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.users.filter((user) => user.role === role)
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users]
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    return this.users[userIndex]
  }
}

export const userService = new UserService()
