# ChatKit Session Management Implementation

## Overview

This implementation provides complete ChatKit session management and authentication for the Yello Solar Hub. It enables seamless integration with OpenAI's Agent Builder workflows to create an agentic chat experience powered by the Hélio solar assistant.

## What's Included

### Core Files

1. **Session Management** (`src/lib/openai/chatkit.ts`)
   - Session creation and refresh logic
   - Device ID generation and persistence
   - OpenAI API integration

2. **API Endpoints** (`src/lib/api/chatkit-endpoints.ts`)
   - Session creation handler
   - Session refresh handler
   - Widget action processing
   - Support for all solar-specific actions

3. **React Hook** (`src/hooks/use-chatkit-session.ts`)
   - Session lifecycle management
   - Automatic token refresh (every 50 minutes)
   - Error handling and recovery

4. **Provider Component** (`src/components/ChatKitProvider.tsx`)
   - Application-wide session context
   - Authentication state management
   - Helper hooks for session access

5. **Integration Component** (`src/components/ChatKitIntegration.tsx`)
   - Complete ChatKit UI integration
   - Theme customization for Yello brand
   - Widget action handlers
   - Error states and loading indicators

6. **Documentation** (`docs/CHATKIT_INTEGRATION.md`)
   - Complete integration guide
   - API reference
   - Troubleshooting tips
   - Security best practices

## Quick Start

### 1. Configure Environment

Add to your `.env` file:

```bash
VITE_OPENAI_API_KEY=sk-proj-your-key-here
VITE_OPENAI_CHATKIT_ENABLED=true
VITE_OPENAI_WORKFLOW_ID=wf_your-workflow-id
```

### 2. Create Agent Workflow

1. Visit [Agent Builder](https://platform.openai.com/agent-builder)
2. Create a workflow for the Hélio solar assistant
3. Configure with solar engineering knowledge base
4. Copy the workflow ID

### 3. Wrap Your App

```tsx
import { ChatKitProvider } from '@/components/ChatKitProvider'

function App() {
  return (
    <ChatKitProvider>
      {/* Your application */}
    </ChatKitProvider>
  )
}
```

### 4. Add Chat Interface

```tsx
import { ChatKitIntegration } from '@/components/ChatKitIntegration'

function ChatPage() {
  return <ChatKitIntegration className="h-[600px] w-full" />
}
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend App                       │
│  ┌───────────────────────────────────────────────┐  │
│  │         ChatKitProvider (Context)             │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │    useChatKitSession (Hook)             │ │  │
│  │  │  • Session creation                     │ │  │
│  │  │  • Auto-refresh (50 min)                │ │  │
│  │  │  • Error handling                       │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │    ChatKitIntegration (Component)             │  │
│  │  • UI rendering                               │  │
│  │  • Theme customization                        │  │
│  │  • Widget action handling                     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓
              API Endpoint Handlers
         (chatkit-endpoints.ts)
                        ↓
┌─────────────────────────────────────────────────────┐
│              OpenAI ChatKit API                      │
│  • Session management                                │
│  • Agent workflow execution                          │
│  • Widget rendering                                  │
└─────────────────────────────────────────────────────┘
```

## Session Flow

```
1. App Initialization
   ↓
2. ChatKitProvider mounts
   ↓
3. useChatKitSession creates session
   ↓
4. POST /api/chatkit/session → OpenAI
   ↓
5. Receive client_secret
   ↓
6. ChatKit UI initializes with secret
   ↓
7. User interacts with chat
   ↓
8. Auto-refresh at 50 minutes
   ↓
9. POST /api/chatkit/refresh → OpenAI
   ↓
10. New client_secret received
    ↓
11. Session continues seamlessly
```

## Widget Actions

### Supported Actions

- `add_to_quote` - Add products to quotation
- `simulate_financing` - Run financing simulations
- `view_irradiation_details` - Show solar data
- `add_to_cart` - Shopping cart operations
- `view_product_details` - Product information
- `compare_options` - Compare products/plans

### Adding Custom Actions

1. Add handler in `chatkit-endpoints.ts`:

```typescript
case 'my_custom_action':
  return handleMyCustomAction(action.payload)
```

2. Implement handler:

```typescript
async function handleMyCustomAction(
  payload?: Record<string, any>
): Promise<WidgetActionResponse> {
  // Your logic here
  return {
    success: true,
    message: 'Action completed',
    data: { ... }
  }
}
```

## Theme Customization

The ChatKit interface uses the Yello Solar Hub brand colors:

```typescript
theme: {
  primaryColor: '#FFD60A',        // Yello yellow
  backgroundColor: 'oklch(0.99 0.002 85)',
  messageBackgroundColor: 'oklch(1.00 0 0)',
  messageBorderColor: 'oklch(0.85 0.002 85)',
  messageForegroundColor: 'oklch(0.15 0.01 85)',
}
```

Customize in `ChatKitIntegration.tsx` to match your needs.

## Security

### Best Practices

1. **Never expose API keys in client code**
   - Keys are loaded from environment variables
   - Server-side only in production

2. **Session token lifecycle**
   - Tokens expire after 60 minutes
   - Auto-refresh at 50 minutes
   - New session created on errors

3. **Device ID persistence**
   - Stored in localStorage
   - Unique per browser/device
   - Used for session continuity

4. **User authentication**
   - Pass `userId` to provider
   - Integrate with your auth system
   - Track sessions per user

## Integration Options

### Option 1: Replace Existing Chat

Replace the current Spark chat entirely with ChatKit:

```tsx
// Instead of the existing chat UI
<ChatKitIntegration className="flex-1" />
```

### Option 2: Dual Chat Interface

Provide both options with a toggle:

```tsx
const [chatMode, setChatMode] = useState<'spark' | 'chatkit'>('spark')

{chatMode === 'spark' ? <SparkChat /> : <ChatKitIntegration />}
```

### Option 3: Context-Specific

Use different chats for different purposes:

```tsx
// Sales/support: ChatKit with Agent Builder
<ChatKitIntegration />

// Technical engineering: Spark with custom prompts
<SparkChat />
```

## Testing

### Manual Testing

1. Start the app with ChatKit enabled
2. Verify session creation in console
3. Send test messages
4. Trigger widget actions
5. Wait 50+ minutes to test refresh
6. Force error to test recovery

### Console Logs

The implementation provides detailed logging:

```
ChatKit session created: cs_...
Widget action triggered: add_to_quote
Action handled successfully: { success: true, ... }
ChatKit session refreshed: cs_...
```

## Troubleshooting

### Common Issues

**ChatKit not loading**
- Check `VITE_OPENAI_CHATKIT_ENABLED=true`
- Verify workflow ID is correct
- Ensure script loaded: check `window.ChatKit`

**Session creation fails**
- Validate API key
- Check OpenAI account has ChatKit access
- Review network requests in DevTools

**Widget actions not working**
- Verify action ID matches handler
- Check payload structure
- Review console errors

**Auto-refresh not working**
- Check if `autoRefresh` prop is true
- Verify timer is running (50 min interval)
- Check for error recovery

## Next Steps

1. **Configure Agent Builder Workflow**
   - Add solar engineering knowledge
   - Include Brazilian regulations (ANEEL, ABNT)
   - Set up RAG with equipment databases

2. **Customize Widgets**
   - Use widget templates in `widget-templates.ts`
   - Create solar-specific widgets
   - Implement data visualization

3. **Connect to Backend**
   - Wire up widget actions to real services
   - Store quotes and simulations
   - Track user interactions

4. **Add Analytics**
   - Monitor session success rates
   - Track widget action usage
   - Measure user engagement

5. **Production Deployment**
   - Move API key to server-side
   - Implement rate limiting
   - Add monitoring and alerts

## Resources

- [Full Documentation](docs/CHATKIT_INTEGRATION.md)
- [ChatKit Docs](https://openai.github.io/chatkit-python)
- [Agent Builder](https://platform.openai.com/agent-builder)
- [Widget Studio](https://widgets.chatkit.studio)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Consult the full documentation
4. Check OpenAI Platform status
