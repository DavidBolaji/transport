
import { loginAction, LoginCredentials, registerAction, RegisterData } from "@/auth-action"
import type { User } from "@prisma/client"

export class AuthService {
  private static instance: AuthService
  private tokenKey = "auth_token"
  private userKey = "auth_user"

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async register(data: RegisterData, nin: string) {
    const result = await registerAction(data)
    if (result.success && result.user) {
      this.saveAuth(result.user, result.token!)
    }
    return result
  }

  async login(credentials: LoginCredentials) {
    const result = await loginAction(credentials)
    if (result.success && result.user) {
      this.saveAuth(result.user, result.token!)
    }
    return result
  }

  logout() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.userKey)
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.userKey)
    return raw ? JSON.parse(raw) : null
  }

  initializeAuth() {
    return this.getCurrentUser()
  }

  private saveAuth(user: User, token: string) {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }
}
