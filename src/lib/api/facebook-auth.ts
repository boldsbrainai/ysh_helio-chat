import type { AuthUser } from "@/types/auth"

const AUTH_SERVICE_URL = (import.meta.env.VITE_AUTH_SERVICE_URL || "").replace(/\/$/, "")
const CALLBACK_PATH = "/api/auth/facebook/callback"

interface FacebookAuthResponse {
  user: AuthUser
  sessionToken?: string
}

export async function exchangeFacebookCode(code: string, redirectUri: string): Promise<AuthUser> {
  const endpoint = `${AUTH_SERVICE_URL}${CALLBACK_PATH}` || CALLBACK_PATH

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ code, redirectUri }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(errorText || `Falha ao validar código do Facebook (${response.status})`)
  }

  const payload = (await response.json()) as FacebookAuthResponse
  return payload.user
}
