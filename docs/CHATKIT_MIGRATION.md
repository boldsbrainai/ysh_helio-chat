# ChatKit Migration Guide

## Overview

This guide helps you integrate ChatKit with the existing Yello Solar Hub application while preserving current functionality.

## Migration Strategy

We recommend a **phased approach** that allows both systems to coexist:

### Phase 1: Parallel Implementation (Recommended)
- Keep existing Spark chat functioning
- Add ChatKit as an optional feature
- Allow users to switch between interfaces
- Gather feedback before full migration

### Phase 2: Gradual Transition
- Default to ChatKit for new users
- Migrate existing users incrementally
- Maintain fallback to Spark chat
- Monitor performance and user satisfaction

### Phase 3: Full Migration
- Make ChatKit the primary interface
- Remove or archive Spark chat code
- Optimize for ChatKit workflows

## Implementation Steps

### Step 1: Install Dependencies

No additional npm packages needed - all dependencies are already included.

### Step 2: Add ChatKit to Main App

Update `src/App.tsx`:

```tsx
import { ChatKitProvider } from '@/components/ChatKitProvider'
import { useState } from 'react'

function App() {
  const [chatMode, setChatMode] = useKV<'spark' | 'chatkit'>('chat-mode', 'spark')
  
  return (
    <ChatKitProvider
      userId={user?.id}
      metadata={{
        appVersion: '1.0.0',
        source: 'yello-solar-hub',
      }}
    >
      {/* Rest of your app */}
      
      {/* Add mode toggle in header */}
      <ChatModeToggle 
        mode={chatMode} 
        onChange={setChatMode} 
      />
      
      {/* Conditional rendering */}
      {chatMode === 'chatkit' ? (
        <ChatKitIntegration className="flex-1" />
      ) : (
        <YourExistingChat />
      )}
    </ChatKitProvider>
  )
}
```

### Step 3: Create Mode Toggle Component

```tsx
// src/components/ChatModeToggle.tsx
import { Button } from '@/components/ui/button'
import { Chat, Robot } from '@phosphor-icons/react'

interface ChatModeToggleProps {
  mode: 'spark' | 'chatkit'
  onChange: (mode: 'spark' | 'chatkit') => void
}

export function ChatModeToggle({ mode, onChange }: ChatModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <Button
        variant={mode === 'spark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('spark')}
      >
        <Chat size={18} className="mr-2" />
        Chat Clássico
      </Button>
      <Button
        variant={mode === 'chatkit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('chatkit')}
      >
        <Robot size={18} className="mr-2" />
        Hélio IA
      </Button>
    </div>
  )
}
```

### Step 4: Preserve Session State

The existing chat sessions are stored in `useKV("chat-sessions")`. ChatKit manages its own sessions, but you can maintain history:

```tsx
// Save ChatKit conversations to history
function useChatKitHistory() {
  const [history, setHistory] = useKV<ChatKitConversation[]>('chatkit-history', [])
  
  const saveConversation = useCallback((conversation: ChatKitConversation) => {
    setHistory(prev => [...prev, conversation])
  }, [setHistory])
  
  return { history, saveConversation }
}
```

### Step 5: Widget Integration

The existing app uses custom widgets. ChatKit widgets are defined differently but can coexist:

```tsx
// Existing widget system
import { Widget } from '@/components/widgets/WidgetRenderer'

// ChatKit widgets
import { productCardWidget } from '@/lib/openai/widget-templates'

// Use appropriate widget based on chat mode
const widget = chatMode === 'spark' 
  ? yourExistingWidget
  : productCardWidget(product)
```

## Feature Mapping

### Current Features → ChatKit Equivalents

| Current Feature | ChatKit Implementation | Notes |
|----------------|----------------------|-------|
| Chat sessions | ChatKit sessions | Automatic management |
| Message history | Thread persistence | Managed by OpenAI |
| Custom prompts | Agent Builder prompts | Configure in workflow |
| Widget rendering | ChatKit widgets | Use widget templates |
| Voice input | Whisper integration | Already implemented |
| File uploads | ChatKit attachments | Built-in support |
| Search | Built-in search | Native ChatKit feature |

### Maintaining Current Features

#### 1. Chat History Sidebar

Keep the existing sidebar but show both types of conversations:

```tsx
function ChatSidebar() {
  const sparkSessions = useKV<ChatSession[]>('chat-sessions', [])
  const chatkitSessions = useKV<ChatKitSession[]>('chatkit-history', [])
  
  return (
    <div>
      <Section title="Conversas Recentes (IA)">
        {chatkitSessions.map(session => (
          <SessionItem key={session.id} session={session} />
        ))}
      </Section>
      
      <Section title="Conversas Clássicas">
        {sparkSessions.map(session => (
          <SessionItem key={session.id} session={session} />
        ))}
      </Section>
    </div>
  )
}
```

#### 2. Prompt Library

Adapt the prompt library to work with both systems:

```tsx
function PromptLibrary() {
  const { chatMode } = useChatMode()
  
  const handleSelectPrompt = (prompt: string) => {
    if (chatMode === 'chatkit') {
      // Send to ChatKit
      chatKitRef.current?.sendMessage(prompt)
    } else {
      // Use existing implementation
      setInput(prompt)
    }
  }
  
  return (/* ... */)
}
```

#### 3. Settings Dialog

Extend settings to include ChatKit preferences:

```tsx
function SettingsDialog() {
  const [preferredMode, setPreferredMode] = useKV<'spark' | 'chatkit'>('preferred-chat-mode', 'spark')
  const [enableAutoSwitch, setEnableAutoSwitch] = useKV('auto-switch-chat', false)
  
  return (
    <Dialog>
      {/* Existing settings */}
      
      <Section title="Interface de Chat">
        <Select value={preferredMode} onValueChange={setPreferredMode}>
          <SelectItem value="spark">Chat Clássico</SelectItem>
          <SelectItem value="chatkit">Hélio IA (ChatKit)</SelectItem>
        </Select>
        
        <Switch
          checked={enableAutoSwitch}
          onCheckedChange={setEnableAutoSwitch}
          label="Alternar automaticamente para IA quando disponível"
        />
      </Section>
    </Dialog>
  )
}
```

## Data Migration

### Session Data Structure

Existing format:
```typescript
interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  timestamp: number
}
```

ChatKit format:
```typescript
interface ChatKitSession {
  client_secret: string
  session_id: string
  expires_at?: string
}
```

### Migration Script

Create a utility to convert existing sessions to ChatKit format (if needed):

```typescript
// src/lib/migration/chat-migration.ts
export function migrateSparkSessionToChatKit(
  sparkSession: ChatSession
): ChatKitConversation {
  return {
    id: sparkSession.id,
    title: sparkSession.title,
    timestamp: sparkSession.timestamp,
    messages: sparkSession.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
    metadata: {
      migratedFrom: 'spark',
      originalId: sparkSession.id,
    },
  }
}
```

## Rollback Plan

If you need to revert to the original implementation:

### 1. Disable ChatKit

```bash
# .env
VITE_OPENAI_CHATKIT_ENABLED=false
```

### 2. Remove Provider

Comment out ChatKitProvider in App.tsx:

```tsx
// <ChatKitProvider>
  <YourApp />
// </ChatKitProvider>
```

### 3. Remove Toggle

Hide or remove the chat mode toggle component.

### 4. Preserve Data

All Spark chat data remains in `useKV` storage - nothing is lost.

## Testing Strategy

### 1. Unit Tests

Test session management:
```typescript
describe('ChatKit Session', () => {
  it('creates session with valid credentials', async () => {
    const session = await createChatKitSession()
    expect(session).toBeDefined()
  })
  
  it('refreshes session before expiry', async () => {
    const newSecret = await refreshChatKitSession(oldSecret)
    expect(newSecret).not.toBe(oldSecret)
  })
})
```

### 2. Integration Tests

Test both chat modes:
```typescript
describe('Chat Interface', () => {
  it('switches between Spark and ChatKit', () => {
    render(<App />)
    
    // Start with Spark
    expect(screen.getByText('Chat Clássico')).toBeInTheDocument()
    
    // Switch to ChatKit
    fireEvent.click(screen.getByText('Hélio IA'))
    expect(screen.getByRole('chatkit-embed')).toBeInTheDocument()
  })
})
```

### 3. E2E Tests

Test complete user flows:
```typescript
describe('User Journey', () => {
  it('completes solar project workflow in ChatKit', async () => {
    await login()
    await selectChatMode('chatkit')
    await sendMessage('Dimensione um sistema de 10kWp')
    await waitForResponse()
    await clickWidget('add_to_quote')
    expect(await getQuote()).toContain('10kWp')
  })
})
```

## Performance Considerations

### 1. Lazy Loading

Load ChatKit only when needed:

```tsx
const ChatKitIntegration = lazy(() => import('@/components/ChatKitIntegration'))

{chatMode === 'chatkit' && (
  <Suspense fallback={<ChatLoadingSkeleton />}>
    <ChatKitIntegration />
  </Suspense>
)}
```

### 2. Session Caching

Cache active sessions to avoid unnecessary API calls:

```typescript
const sessionCache = new Map<string, string>()

function getCachedSession(userId: string): string | null {
  const cached = sessionCache.get(userId)
  if (cached && !isExpired(cached)) {
    return cached
  }
  return null
}
```

### 3. Optimize Renders

Prevent unnecessary re-renders:

```tsx
const MemoizedChatKit = React.memo(ChatKitIntegration)

export function ChatContainer() {
  return <MemoizedChatKit />
}
```

## Monitoring

### Track Migration Success

```typescript
function trackChatMode(mode: 'spark' | 'chatkit') {
  // Your analytics
  analytics.track('chat_mode_selected', {
    mode,
    timestamp: Date.now(),
    userId: user?.id,
  })
}

function trackChatKitSession(success: boolean, error?: Error) {
  analytics.track('chatkit_session_created', {
    success,
    error: error?.message,
    timestamp: Date.now(),
  })
}
```

## Support Plan

### User Communication

**Email to users:**

> 🎉 **Novo: Conheça o Hélio, seu Co-Piloto Solar com IA**
>
> Estamos introduzindo uma nova experiência de chat com inteligência artificial avançada. 
> Você pode continuar usando o chat clássico ou experimentar o novo Hélio IA.
>
> Clique no botão "Hélio IA" no topo do chat para experimentar!

### Documentation Updates

Update user guides to cover both modes:
- How to switch between modes
- When to use each mode
- Feature differences
- Troubleshooting tips

## Timeline

**Week 1: Setup**
- Configure environment
- Add ChatKitProvider
- Test session creation

**Week 2: Integration**
- Add mode toggle
- Implement parallel interfaces
- Test widget actions

**Week 3: Testing**
- Internal testing
- Fix bugs
- Performance optimization

**Week 4: Beta Launch**
- Release to select users
- Gather feedback
- Monitor performance

**Week 5-6: Full Rollout**
- Enable for all users
- Make ChatKit default (optional)
- Continue monitoring

## Conclusion

This migration approach allows you to:
✅ Preserve existing functionality
✅ Test ChatKit in production safely
✅ Gather user feedback before full commitment
✅ Rollback easily if needed
✅ Maintain data integrity throughout

The parallel implementation ensures zero downtime and maximum flexibility as you transition to the new ChatKit-powered interface.
