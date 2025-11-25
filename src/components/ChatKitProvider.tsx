/**
 * ChatKit Provider Component
 * 
 * Enhanced provider with better session management, error recovery,
 * and authentication integration
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useChatKitSession, UseChatKitSessionReturn } from '@/hooks/use-chatkit-session'
import { openAIConfig } from '@/lib/openai/config'

interface ChatKitContextValue extends UseChatKitSessionReturn {
  isEnabled: boolean
  workflowId: string
}

const ChatKitContext = createContext<ChatKitContextValue | null>(null)

export interface ChatKitProviderProps {
  children: ReactNode
  userId?: string
  deviceId?: string
  metadata?: Record<string, any>
  autoRefresh?: boolean
  validateOnMount?: boolean
  onSessionExpired?: () => void
  onSessionRefreshed?: () => void
}

/**
 * ChatKit Provider
 * 
 * Wraps the application to provide enhanced ChatKit session management
 * and authentication to all child components with automatic recovery
 */
export function ChatKitProvider({
  children,
  userId,
  deviceId,
  metadata,
  autoRefresh = true,
  validateOnMount = true,
  onSessionExpired,
  onSessionRefreshed,
}: ChatKitProviderProps) {
  const session = useChatKitSession({
    userId,
    deviceId,
    metadata,
    autoRefresh,
    validateOnMount,
    onSessionExpired,
    onSessionRefreshed,
  })

  const value: ChatKitContextValue = {
    ...session,
    isEnabled: openAIConfig.chatkit.enabled,
    workflowId: openAIConfig.chatkit.workflowId,
  }

  return (
    <ChatKitContext.Provider value={value}>
      {children}
    </ChatKitContext.Provider>
  )
}

/**
 * Hook to access ChatKit context
 */
export function useChatKit(): ChatKitContextValue {
  const context = useContext(ChatKitContext)
  
  if (!context) {
    throw new Error('useChatKit must be used within a ChatKitProvider')
  }
  
  return context
}

/**
 * Hook to get the ChatKit client secret for session initialization
 * 
 * This is the function that should be passed to the ChatKit component's
 * api.getClientSecret callback with enhanced retry and recovery logic
 */
export function useGetClientSecret() {
  const { 
    clientSecret, 
    createSession, 
    refreshSession, 
    error,
    isValid 
  } = useChatKit()
  
  return React.useCallback(
    async (existingSecret?: string): Promise<string> => {
      if (error) {
        console.error('ChatKit session error, attempting recovery:', error)
        await createSession(true)
      }

      if (existingSecret && existingSecret !== clientSecret) {
        console.log('Existing secret differs, refreshing session')
        await refreshSession()
      } else if (!clientSecret || !isValid) {
        console.log('No valid secret, creating new session')
        await createSession(!existingSecret)
      }

      if (!clientSecret) {
        throw new Error('Failed to obtain client secret')
      }

      return clientSecret
    },
    [clientSecret, createSession, refreshSession, error, isValid]
  )
}
