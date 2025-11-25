export type PlanTier = "free" | "pro" | "enterprise"

export interface AuthSession {
  accessToken: string
  expiresAt: number
  plan: PlanTier
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  cpf?: string
  phone?: string
  createdAt: number
  session: AuthSession
}
