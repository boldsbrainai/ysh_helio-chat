/**
 * useChatKitSession Hook
 * 
 * Enhanced React hook for managing ChatKit sessions with:
 * - Automatic refresh with intelligent timing
 * - Session persistence and recovery
 * - Error handling with retry logic
 * - Session validation
 * - User authentication integration
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { handleCreateSession, handleRefreshSession } from '@/lib/api/chatkit-endpoints'
import type { SessionRequest } from '@/lib/api/chatkit-endpoints'
import { 
  getSessionInfo, 
  needsRefresh, 
  clearCachedSession,
  validateSession 
} from '@/lib/openai/chatkit'

export interface UseChatKitSessionOptions {
  userId?: string
  deviceId?: string
  metadata?: Record<string, any>
  autoRefresh?: boolean
  refreshInterval?: number
  validateOnMount?: boolean
  onSessionExpired?: () => void
  onSessionRefreshed?: () => void
}

export interface UseChatKitSessionReturn {
  clientSecret: string | null
  sessionId: string | null
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  isValid: boolean
  createSession: (force?: boolean) => Promise<void>
  refreshSession: () => Promise<void>
  clearSession: () => void
  validateCurrentSession: () => Promise<boolean>
  sessionInfo: {
    createdAt?: number
    expiresAt?: string
    userId?: string
    deviceId?: string
  } | null
}

/**
 * Hook to manage ChatKit session lifecycle with enhanced features
 */
export function useChatKitSession(
  options: UseChatKitSessionOptions = {}
): UseChatKitSessionReturn {
  const {
    userId,
    deviceId,
    metadata,
    autoRefresh = true,
    refreshInterval = 50 * 60 * 1000,
    validateOnMount = true,
    onSessionExpired,
    onSessionRefreshed,
  } = options

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const validateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const mountedRef = useRef<boolean>(true)

  const updateSessionState = useCallback(() => {
    const info = getSessionInfo()
    if (info) {
      setSessionInfo({
        createdAt: info.createdAt,
        expiresAt: info.expiresAt,
        userId: info.userId,
        deviceId: info.deviceId,
      })
    }
  }, [])

  const createSession = useCallback(async (force = false) => {
    if (!mountedRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const cachedInfo = getSessionInfo()
      if (!force && cachedInfo?.clientSecret && !needsRefresh()) {
        console.log('Restoring session from cache')
        setClientSecret(cachedInfo.clientSecret)
        setSessionId(cachedInfo.sessionId || cachedInfo.clientSecret)
        setIsValid(true)
        updateSessionState()
        return
      }

      const request: SessionRequest = {
        userId,
        deviceId,
        metadata,
      }

      const response = await handleCreateSession(request)
      
      if (!mountedRef.current) return

      setClientSecret(response.client_secret)
      setSessionId(response.client_secret)
      setIsValid(true)
      updateSessionState()

      console.log('ChatKit session created successfully')
    } catch (err) {
      if (!mountedRef.current) return

      const error = err instanceof Error ? err : new Error('Failed to create session')
      setError(error)
      setIsValid(false)
      console.error('Failed to create ChatKit session:', error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [userId, deviceId, metadata, updateSessionState])

  const refreshSession = useCallback(async () => {
    if (!clientSecret || !mountedRef.current) {
      console.warn('No client secret to refresh')
      return
    }

    setIsRefreshing(true)
    setError(null)

    try {
      const response = await handleRefreshSession({
        currentClientSecret: clientSecret,
      })

      if (!mountedRef.current) return

      setClientSecret(response.client_secret)
      setIsValid(true)
      updateSessionState()
      onSessionRefreshed?.()

      console.log('ChatKit session refreshed successfully')
    } catch (err) {
      if (!mountedRef.current) return

      const error = err instanceof Error ? err : new Error('Failed to refresh session')
      setError(error)
      console.error('Failed to refresh ChatKit session:', error)

      console.log('Attempting to create new session after refresh failure')
      await createSession(true)
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false)
      }
    }
  }, [clientSecret, createSession, updateSessionState, onSessionRefreshed])

  const validateCurrentSession = useCallback(async (): Promise<boolean> => {
    if (!clientSecret) return false

    try {
      const valid = await validateSession(clientSecret)
      
      if (!mountedRef.current) return false

      setIsValid(valid)

      if (!valid) {
        console.warn('Session validation failed')
        onSessionExpired?.()
        await createSession(true)
      }

      return valid
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }, [clientSecret, createSession, onSessionExpired])

  const clearSession = useCallback(() => {
    clearCachedSession()
    setClientSecret(null)
    setSessionId(null)
    setError(null)
    setIsValid(false)
    setSessionInfo(null)

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    if (validateTimeoutRef.current) {
      clearTimeout(validateTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const initSession = async () => {
      if (!clientSecret) {
        await createSession()
      } else if (validateOnMount) {
        await validateCurrentSession()
      }
    }

    initSession()

    return () => {
      mountedRef.current = false
    }
  }, [createSession, validateCurrentSession, validateOnMount])

  useEffect(() => {
    if (!autoRefresh || !clientSecret) {
      return
    }

    const scheduleNextRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      const shouldRefreshNow = needsRefresh()
      const delay = shouldRefreshNow ? 0 : refreshInterval

      refreshTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          refreshSession()
        }
      }, delay)
    }

    scheduleNextRefresh()

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [autoRefresh, clientSecret, refreshInterval, refreshSession])

  useEffect(() => {
    if (!clientSecret) return

    const scheduleValidation = () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current)
      }

      validateTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          validateCurrentSession()
        }
      }, 5 * 60 * 1000)
    }

    scheduleValidation()

    return () => {
      if (validateTimeoutRef.current) {
        clearTimeout(validateTimeoutRef.current)
      }
    }
  }, [clientSecret, validateCurrentSession])

  return {
    clientSecret,
    sessionId,
    isLoading,
    isRefreshing,
    error,
    isValid,
    createSession,
    refreshSession,
    clearSession,
    validateCurrentSession,
    sessionInfo,
  }
}
