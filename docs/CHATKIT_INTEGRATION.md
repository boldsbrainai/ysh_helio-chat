# ChatKit Integration Guide - Yello Solar Hub

## Overview

This guide explains the ChatKit session management and authentication implementation for the Yello Solar Hub. ChatKit enables an embeddable, agentic chat experience powered by OpenAI's Agent Builder workflows.

## Architecture

### Components

1. **Session Management** (`src/lib/openai/chatkit.ts`)
   - Creates and refreshes ChatKit sessions
   - Manages device IDs and user authentication
   - Interfaces with OpenAI's ChatKit API

2. **API Endpoints** (`src/lib/api/chatkit-endpoints.ts`)
   - Handles session creation requests
   - Processes session refresh requests
   - Manages widget action events from the chat interface

3. **React Hook** (`src/hooks/use-chatkit-session.ts`)
   - Provides session lifecycle management
   - Handles automatic token refresh
   - Manages error states

4. **Provider Component** (`src/components/ChatKitProvider.tsx`)
   - Wraps the application with session context
   - Provides authentication to child components
   - Exposes session management functions

5. **Integration Component** (`src/components/ChatKitIntegration.tsx`)
   - Renders the ChatKit chat interface
   - Configures theme and customization
   - Handles widget actions and callbacks

## Setup

### 1. Environment Configuration

Create a `.env` file with your OpenAI credentials:

```bash
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Enable ChatKit
VITE_OPENAI_CHATKIT_ENABLED=true

# Your Workflow ID from Agent Builder
VITE_OPENAI_WORKFLOW_ID=wf_your-workflow-id-here
```

### 2. Create Agent Workflow

1. Go to [OpenAI Agent Builder](https://platform.openai.com/agent-builder)
2. Create a new workflow for the Hélio solar assistant
3. Configure the agent with solar engineering knowledge
4. Copy the workflow ID to your `.env` file

### 3. Add ChatKit Script to HTML

The script is already included in `index.html`:

```html
<script 
  src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" 
  async
></script>
```

### 4. Wrap Application with Provider

In your root component or App.tsx:

```tsx
import { ChatKitProvider } from '@/components/ChatKitProvider'

function App() {
  return (
    <ChatKitProvider>
      {/* Your app components */}
    </ChatKitProvider>
  )
}
```

### 5. Use ChatKit Component

```tsx
import { ChatKitIntegration } from '@/components/ChatKitIntegration'

function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <ChatKitIntegration className="h-[600px] w-full max-w-4xl" />
    </div>
  )
}
```

## API Endpoints

### POST /api/chatkit/session

Creates a new ChatKit session.

**Request:**
```json
{
  "userId": "user-123",
  "deviceId": "device-abc",
  "metadata": {
    "source": "web-app",
    "version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "client_secret": "cs_...",
  "device_id": "device-abc",
  "expires_in": 3600
}
```

### POST /api/chatkit/refresh

Refreshes an existing session.

**Request:**
```json
{
  "currentClientSecret": "cs_..."
}
```

**Response:**
```json
{
  "client_secret": "cs_new...",
  "expires_in": 3600
}
```

### POST /api/widget-action

Handles widget action events.

**Request:**
```json
{
  "action": {
    "id": "add_to_quote",
    "payload": {
      "productId": "PNL-JINKO-550W",
      "quantity": 20
    }
  },
  "sessionId": "session-123",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Produto adicionado ao orçamento com sucesso",
  "data": {
    "productId": "PNL-JINKO-550W",
    "addedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Widget Actions

The following widget actions are supported:

1. **add_to_quote** - Add a product to a quote
2. **simulate_financing** - Start a financing simulation
3. **view_irradiation_details** - View solar irradiation data
4. **add_to_cart** - Add items to shopping cart
5. **view_product_details** - View detailed product information
6. **compare_options** - Compare multiple products or options

### Example Widget Definition

```typescript
import { productCardWidget } from '@/lib/openai/widget-templates'

const widget = productCardWidget({
  productId: 'PNL-JINKO-550W',
  name: 'Painel Solar Jinko 550W',
  imageUrl: '/assets/images/jinko-550w.jpg',
  price: 850.00,
  currency: 'BRL',
  specs: [
    { label: 'Potência', value: '550W' },
    { label: 'Eficiência', value: '21.2%' },
    { label: 'Garantia', value: '25 anos' },
  ],
})

// Send this widget in a message
await sendMessage({
  role: 'assistant',
  content: 'Encontrei este painel solar para você:',
  widget,
})
```

## Customization

### Theme Customization

Update the theme in `ChatKitIntegration.tsx`:

```typescript
theme: {
  primaryColor: '#FFD60A',
  backgroundColor: 'oklch(0.99 0.002 85)',
  messageBackgroundColor: 'oklch(1.00 0 0)',
  messageBorderColor: 'oklch(0.85 0.002 85)',
  messageForegroundColor: 'oklch(0.15 0.01 85)',
}
```

### Text Customization

```typescript
customization: {
  title: 'Hélio - Co-Piloto Solar',
  subtitle: 'Seu assistente especializado em energia solar fotovoltaica',
  placeholder: 'Pergunte sobre dimensionamento, equipamentos...',
  welcomeMessage: 'Olá! Como posso ajudar com seu projeto solar?',
}
```

## Session Management Flow

```
1. User opens chat interface
   ↓
2. ChatKitProvider creates session via createChatKitSession()
   ↓
3. OpenAI API returns client_secret
   ↓
4. ChatKit component initializes with client_secret
   ↓
5. User interacts with chat
   ↓
6. Session auto-refreshes every 50 minutes
   ↓
7. On error, new session is created automatically
```

## Security Considerations

1. **API Key Protection**: Never expose your OpenAI API key in client-side code
2. **Session Tokens**: Client secrets expire after 60 minutes
3. **Device IDs**: Persistent device IDs are stored in localStorage
4. **User Authentication**: Integrate with your authentication system via userId

## Troubleshooting

### ChatKit Not Loading

1. Check that `VITE_OPENAI_CHATKIT_ENABLED=true`
2. Verify workflow ID is correct
3. Ensure API key has ChatKit access
4. Check browser console for script loading errors

### Session Creation Fails

1. Verify API key is valid
2. Check network requests in DevTools
3. Ensure workflow ID exists and is active
4. Review error messages in console

### Widget Actions Not Working

1. Check `onAction` handler in ChatKitIntegration
2. Verify widget action IDs match handlers
3. Review payload structure
4. Check `/api/widget-action` endpoint logs

## Advanced Usage

### Custom Session Metadata

```typescript
<ChatKitProvider
  userId="user-123"
  metadata={{
    project: 'solar-project-456',
    role: 'integrator',
    region: 'southeast',
  }}
>
  {/* app */}
</ChatKitProvider>
```

### Manual Session Control

```typescript
const { createSession, refreshSession, clearSession } = useChatKit()

// Create new session
await createSession()

// Refresh current session
await refreshSession()

// Clear session (logout)
clearSession()
```

### Custom Action Handlers

Extend `handleWidgetAction` in `chatkit-endpoints.ts`:

```typescript
case 'custom_action':
  return handleCustomAction(action.payload)
```

## Integration with Existing Chat

The ChatKit implementation can coexist with the existing Spark chat (`App.tsx`). You can:

1. Replace the existing chat completely
2. Add ChatKit as an alternative mode
3. Use both for different purposes (e.g., ChatKit for sales, Spark chat for engineering)

## Resources

- [ChatKit Documentation](https://openai.github.io/chatkit-python)
- [Agent Builder](https://platform.openai.com/agent-builder)
- [ChatKit Widgets](https://widgets.chatkit.studio)
- [OpenAI Platform](https://platform.openai.com)

## Next Steps

1. Configure your Agent Builder workflow with solar domain knowledge
2. Add RAG (Retrieval Augmented Generation) for Brazilian regulations
3. Implement custom widgets for solar-specific data
4. Connect widget actions to your backend services
5. Set up analytics and monitoring
