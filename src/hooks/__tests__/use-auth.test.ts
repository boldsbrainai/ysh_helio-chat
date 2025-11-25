import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createEphemeralSession, ensureAuthUserSession } from "@/hooks/use-auth"
import type { AuthSession, AuthUser } from "@/types/auth"

const fixedDate = new Date("2025-01-01T12:00:00Z")

describe("auth session helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("creates deterministic sessions respecting plan and ttl", () => {
    const randomUUIDSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("12345678-1234-1234-1234-123456789abc")

    const session = createEphemeralSession("pro", 45)

    expect(randomUUIDSpy).toHaveBeenCalled()
    expect(session).toEqual({
      accessToken: "12345678-1234-1234-1234-123456789abc",
      expiresAt: fixedDate.getTime() + 45 * 60 * 1000,
      plan: "pro",
    })
  })

  it("returns existing session when user already has one", () => {
    const existingSession: AuthSession = {
      accessToken: "existing",
      expiresAt: fixedDate.getTime() + 1000,
      plan: "enterprise",
    }

    const userWithSession = {
      id: "42",
      email: "helio@yello.energy",
      name: "Hélio",
      createdAt: fixedDate.getTime(),
      session: existingSession,
    } satisfies AuthUser

    const ensured = ensureAuthUserSession(userWithSession)
    expect(ensured).toBe(userWithSession)
  })

  it("adds a new session when missing, using provided plan tier", () => {
    const randomUUIDSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("87654321-4321-4321-4321-cba987654321")

    const userWithoutSession = {
      id: "99",
      email: "integrador@yello.energy",
      name: "Integrador",
      createdAt: fixedDate.getTime(),
    }

    const ensured = ensureAuthUserSession(userWithoutSession, "enterprise")

    expect(randomUUIDSpy).toHaveBeenCalled()
    expect(ensured.session.plan).toBe("enterprise")
    expect(ensured.session.accessToken).toBe("87654321-4321-4321-4321-cba987654321")
    expect(ensured.session.expiresAt).toBe(fixedDate.getTime() + 8 * 60 * 60 * 1000)
  })
})
