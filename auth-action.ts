"use server"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { UserRole } from "@prisma/client"
import { prisma } from "./lib/prisma"

export interface RegisterData {
  email: string
  password: string
  fName: string
  lName: string
  phone?: string
  role: UserRole
  nin?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export async function registerAction(data: RegisterData) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    let kycId: string | undefined = undefined
    if (data.nin) {
      const kyc = await prisma.kyc.create({
        data: { nin: data.nin },
      })
      kycId = kyc.id
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        fName: data.fName,
        lName: data.lName,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        kycId,
      },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    )

    return { success: true, user, token }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function loginAction(credentials: LoginCredentials) {
  try {
    const user = await prisma.user.findUnique({ where: { email: credentials.email } })
    if (!user) return { success: false, error: "Invalid email or password" }

    const valid = await bcrypt.compare(credentials.password, user.password)
    if (!valid) return { success: false, error: "Invalid email or password" }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    )

    return { success: true, user, token }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
