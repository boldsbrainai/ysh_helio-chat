/**
 * ChatKit Integration Example
 * 
 * Enhanced component with session status, refresh controls,
 * and better error handling for the Yello Solar Hub
 */

import React, { useEffect, useRef } from 'react'
import { useChatKit, useGetClientSecret } from '@/components/ChatKitProvider'
import { handleWidgetAction } from '@/lib/api/chatkit-endpoints'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner, CheckCircle, Warning, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ChatKitElement extends HTMLElement {
  setOptions?: (options: any) => void
}

interface ChatKitIntegrationProps {
  className?: string
  height?: string
  showDebugInfo?: boolean
}

/**
 * ChatKit Integration Component
 * 
 * Renders the ChatKit chat interface with enhanced session management,
 * status indicators, and widget action handling
 */
export function ChatKitIntegration({
  className = 'h-[600px] w-full',
  height = '600px',
  showDebugInfo = false,
}: ChatKitIntegrationProps) {
  const { 
    clientSecret, 
    isLoading, 
    isRefreshing,
    error, 
    isEnabled, 
    isValid,
    workflowId,
    sessionInfo,
    refreshSession,
    validateCurrentSession,
  } = useChatKit()
  
  const getClientSecret = useGetClientSecret()
  const chatKitRef = useRef<ChatKitElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!isEnabled) {
      console.warn('ChatKit is not enabled. Set VITE_OPENAI_CHATKIT_ENABLED=true')
      return
    }

    if (!workflowId) {
      console.error('ChatKit workflow ID is not configured. Set VITE_OPENAI_WORKFLOW_ID')
      return
    }

    if (initializedRef.current || !clientSecret || !chatKitRef.current || !isValid) {
      return
    }

    const initializeChatKit = async () => {
      const chatKitElement = chatKitRef.current
      if (!chatKitElement) return

      if (typeof window.ChatKit === 'undefined') {
        console.error('ChatKit script not loaded. Make sure chatkit.js is included in index.html')
        return
      }

      try {
        (chatKitElement as any).setOptions({
          api: {
            async getClientSecret(existingSecret?: string): Promise<string> {
              return getClientSecret(existingSecret)
            },
          },
          
          onAction: async (action: any) => {
            console.log('ChatKit action triggered:', action)
            
            try {
              const result = await handleWidgetAction({
                action: {
                  id: action.id,
                  payload: action.payload,
                },
              })

              if (result.success) {
                console.log('Action handled successfully:', result)
                toast.success(result.message || 'Ação executada com sucesso')
              } else {
                console.error('Action failed:', result.message)
                toast.error(result.message || 'Falha ao executar ação')
              }

              return result
            } catch (error) {
              console.error('Error handling action:', error)
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              toast.error(`Erro: ${errorMessage}`)
              return {
                success: false,
                message: errorMessage,
              }
            }
          },

          theme: {
            primaryColor: '#FFD60A',
            backgroundColor: 'oklch(0.99 0.002 85)',
            messageBackgroundColor: 'oklch(1.00 0 0)',
            messageBorderColor: 'oklch(0.85 0.002 85)',
            messageForegroundColor: 'oklch(0.15 0.01 85)',
          },

          customization: {
            title: 'Hélio - Co-Piloto Solar',
            subtitle: 'Seu assistente especializado em energia solar fotovoltaica',
            placeholder: 'Pergunte sobre dimensionamento, equipamentos, financiamento...',
            welcomeMessage: 'Olá! Sou o Hélio, seu co-piloto de engenharia solar. Como posso ajudar hoje?',
          },
        })

        initializedRef.current = true
        console.log('ChatKit initialized successfully')
        toast.success('Chat inicializado com sucesso')
      } catch (error) {
        console.error('Failed to initialize ChatKit:', error)
        toast.error('Falha ao inicializar o chat')
      }
    }

    initializeChatKit()
  }, [clientSecret, isEnabled, isValid, workflowId, getClientSecret])

  const handleRefreshClick = async () => {
    try {
      await refreshSession()
      toast.success('Sessão renovada com sucesso')
    } catch (error) {
      toast.error('Falha ao renovar sessão')
    }
  }

  const handleValidateClick = async () => {
    const valid = await validateCurrentSession()
    if (valid) {
      toast.success('Sessão válida')
    } else {
      toast.error('Sessão inválida, criando nova sessão...')
    }
  }

  if (!isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ChatKit Não Habilitado</CardTitle>
          <CardDescription>
            Para habilitar o ChatKit, configure as seguintes variáveis de ambiente:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <code className="block bg-muted p-4 rounded-md text-sm font-mono">
                VITE_OPENAI_CHATKIT_ENABLED=true<br />
                VITE_OPENAI_WORKFLOW_ID=wf_...<br />
                VITE_OPENAI_API_KEY=sk-proj-...
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning size={24} weight="fill" className="text-destructive" />
            Erro ao Inicializar ChatKit
          </CardTitle>
          <CardDescription>
            Ocorreu um erro ao conectar com o serviço de chat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Detalhes do Erro</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            <ArrowClockwise size={18} className="mr-2" weight="bold" />
            Recarregar Página
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !clientSecret) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner size={48} className="animate-spin text-accent" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Inicializando chat...</p>
              <p className="text-sm text-muted-foreground">Criando sessão segura</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showDebugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Status da Sessão
              <div className="flex items-center gap-2">
                <Badge variant={isValid ? "default" : "secondary"} className="flex items-center gap-1">
                  {isValid ? (
                    <>
                      <CheckCircle size={14} weight="fill" />
                      Válida
                    </>
                  ) : (
                    <>
                      <Warning size={14} weight="fill" />
                      Inválida
                    </>
                  )}
                </Badge>
                {isRefreshing && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Spinner size={12} className="animate-spin" />
                    Renovando
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Workflow ID:</span>
                <p className="font-mono truncate">{workflowId}</p>
              </div>
              {sessionInfo?.userId && (
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="font-mono truncate">{sessionInfo.userId}</p>
                </div>
              )}
              {sessionInfo?.createdAt && (
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-mono">{new Date(sessionInfo.createdAt).toLocaleTimeString()}</p>
                </div>
              )}
              {sessionInfo?.expiresAt && (
                <div>
                  <span className="text-muted-foreground">Expira em:</span>
                  <p className="font-mono">{new Date(sessionInfo.expiresAt).toLocaleTimeString()}</p>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button 
                onClick={handleRefreshClick} 
                variant="outline" 
                size="sm" 
                disabled={isRefreshing}
                className="flex-1"
              >
                <ArrowClockwise size={14} className="mr-1" weight="bold" />
                Renovar Sessão
              </Button>
              <Button 
                onClick={handleValidateClick} 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <CheckCircle size={14} className="mr-1" weight="bold" />
                Validar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={className}>
        <div
          ref={chatKitRef as any}
          style={{ height, width: '100%', border: 'none' }}
        />
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ChatKit?: any
  }
}
