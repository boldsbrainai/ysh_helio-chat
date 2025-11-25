import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { AuthUser } from "@/types/auth"

const originalFetch = globalThis.fetch

const baseUser: AuthUser = {
  id: "fb-1",
  email: "helio@yello.energy",
  name: "Hélio",
  createdAt: 1,
  session: {
    accessToken: "token",
    expiresAt: 2,
    plan: "free",
  },
}

describe("exchangeFacebookCode", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    globalThis.fetch = originalFetch
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    globalThis.fetch = originalFetch
  })

  it("posts the authorization code to the configured auth service", async () => {
    vi.stubEnv("VITE_AUTH_SERVICE_URL", "https://auth.yello.energy/")

    const mockResponse = {
      ok: true,
      json: async () => ({ user: baseUser }),
    }

    const fetchSpy = vi.fn().mockResolvedValue(mockResponse)
    globalThis.fetch = fetchSpy as typeof fetch

    const { exchangeFacebookCode } = await import("@/lib/api/facebook-auth")
    const result = await exchangeFacebookCode("abc123", "https://app.yello.energy/auth/callback")

    expect(result).toEqual(baseUser)
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://auth.yello.energy/api/auth/facebook/callback",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    )

    const [, requestInit] = fetchSpy.mock.calls[0]
    const body = JSON.parse((requestInit as RequestInit).body as string)
    expect(body).toEqual({ code: "abc123", redirectUri: "https://app.yello.energy/auth/callback" })
  })

  it("throws with backend error payload when response is not ok", async () => {
    vi.stubEnv("VITE_AUTH_SERVICE_URL", "")

    const mockResponse = {
      ok: false,
      status: 502,
      text: async () => "Service indisponível",
    }

    const fetchSpy = vi.fn().mockResolvedValue(mockResponse)
    globalThis.fetch = fetchSpy as typeof fetch

    const { exchangeFacebookCode } = await import("@/lib/api/facebook-auth")

    await expect(exchangeFacebookCode("code", "https://app/cb")).rejects.toThrow("Service indisponível")
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/facebook/callback",
      expect.any(Object),
    )
  })
})
