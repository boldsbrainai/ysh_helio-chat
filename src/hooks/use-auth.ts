import { useCallback, useEffect } from "react"
import { useKV } from "@github/spark/hooks"
import { loginWithFacebook as startFacebookOAuth } from "@/lib/auth/facebook-oauth"
import type { AuthSession, AuthUser, PlanTier } from "@/types/auth"

export type { AuthUser } from "@/types/auth"

const DEFAULT_SESSION_TTL_MINUTES = 8 * 60

export function createEphemeralSession(plan: PlanTier = "free", ttlMinutes = DEFAULT_SESSION_TTL_MINUTES): AuthSession {
  const token = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    accessToken: token,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    plan,
  }
}

export function ensureAuthUserSession(user: Omit<AuthUser, "session"> & { session?: AuthSession }, plan: PlanTier = "free"): AuthUser {
  if (user.session) {
    return user as AuthUser
  }

  return {
    ...user,
    session: createEphemeralSession(plan),
  }
}

export function useAuth() {
  const [authUser, setAuthUser] = useKV<AuthUser | null>("current-auth-user", null)

  const loginWithFacebook = useCallback(
    (redirectUri?: string) => {
      startFacebookOAuth(redirectUri)
    },
    []
  )

  const logout = useCallback(() => {
    setAuthUser(null)
  }, [setAuthUser])

  useEffect(() => {
    if (!authUser) return

    if (!authUser.session) {
      setAuthUser(ensureAuthUserSession(authUser))
      return
    }

    if (authUser.session.expiresAt <= Date.now()) {
      setAuthUser(null)
    }
  }, [authUser, setAuthUser])

  return {
    user: authUser,
    setUser: setAuthUser,
    isAuthenticated: !!authUser,
    loginWithFacebook,
    logout,
    requirePlan: (plan: PlanTier) => {
      if (!authUser?.session) return false
      if (plan === "free") return true
      const hierarchy: PlanTier[] = ["free", "pro", "enterprise"]
      return hierarchy.indexOf(authUser.session.plan) >= hierarchy.indexOf(plan)
    },
  }
}
