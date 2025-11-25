# OpenAI Integration Guide

## Overview

This project integrates multiple OpenAI services to provide advanced AI capabilities:

- **ChatKit**: Embeddable agent-powered chat with OpenAI workflows
- **Assistants API**: Create and manage AI assistants with tools and file uploads
- **Whisper**: Speech-to-text transcription for voice agents
- **Text-to-Speech**: Convert text responses to natural speech
- **Realtime API**: Real-time voice conversations with streaming responses

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `openai`: Official OpenAI SDK
- `@openai/chatkit-react`: ChatKit React components

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `VITE_OPENAI_API_KEY`: Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

Optional (enable features):
- `VITE_OPENAI_CHATKIT_ENABLED=true`: Enable ChatKit integration
- `VITE_OPENAI_WORKFLOW_ID=wf_...`: Your workflow ID from Agent Builder
- `VITE_OPENAI_ASSISTANTS_ENABLED=true`: Enable Assistants API
- `VITE_OPENAI_WHISPER_ENABLED=true`: Enable voice transcription
- `VITE_OPENAI_REALTIME_ENABLED=true`: Enable realtime voice

### 3. Create an Agent Workflow (for ChatKit)

1. Go to [Agent Builder](https://platform.openai.com/agent-builder)
2. Create a new workflow for your solar energy assistant
3. Configure the workflow with:
   - Prompt instructions for Brazilian solar energy context
   - Tools for energy calculations, kit selection, etc.
   - File upload support for energy bills
4. Copy the workflow ID (starts with `wf_`)
5. Add it to your `.env` as `VITE_OPENAI_WORKFLOW_ID`

## Usage Examples

### ChatKit Integration

Embed ChatKit in any component:

```tsx
import { ChatKitEmbed } from '@/components/ChatKitEmbed'

function MyPage() {
  return (
    <div>
      {/* Inline ChatKit */}
      <ChatKitEmbed 
        className="h-[600px] w-full"
        onReady={() => console.log('ChatKit ready')}
      />
      
      {/* Or floating widget */}
      <ChatKitEmbed 
        floating 
        position="bottom-right"
      />
    </div>
  )
}
```

### Voice Agent

Add voice input to any form or chat:

```tsx
import { VoiceAgent } from '@/components/VoiceAgent'

function ChatInput() {
  const handleTranscription = (text: string) => {
    console.log('User said:', text)
    // Send to your chat handler
  }

  return (
    <VoiceAgent
      onTranscription={handleTranscription}
      onSendMessage={(text) => sendMessage(text)}
      showTranscript={true}
    />
  )
}
```

### Assistants API

Create and use custom assistants:

```tsx
import { 
  createAssistant, 
  createThread, 
  addMessageToThread,
  runAssistant 
} from '@/lib/openai'

// Create an assistant for solar energy analysis
const assistant = await createAssistant({
  name: 'Solar Energy Analyzer',
  instructions: 'Você é um especialista em energia solar no Brasil...',
  tools: [
    { type: 'code_interpreter' },
    { type: 'file_search' }
  ]
})

// Create a conversation thread
const thread = await createThread()

// Add user message
await addMessageToThread(thread.id, 'Analise minha conta de luz')

// Run the assistant
const run = await runAssistant(thread.id, assistant.id)
```

### Whisper Voice Transcription

Transcribe audio files:

```tsx
import { transcribeAudio } from '@/lib/openai'

async function handleAudioUpload(file: File) {
  const result = await transcribeAudio(file, {
    language: 'pt', // Brazilian Portuguese
    response_format: 'verbose_json'
  })
  
  console.log('Transcript:', result.text)
  console.log('Duration:', result.duration)
}
```

### Text-to-Speech

Convert responses to speech:

```tsx
import { textToSpeech } from '@/lib/openai'

async function speakResponse(text: string) {
  const audioBlob = await textToSpeech(
    text,
    'alloy', // Voice style
    'tts-1'  // Model
  )
  
  // Play the audio
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)
  await audio.play()
}
```

### Realtime Voice Conversations

Real-time voice chat with streaming:

```tsx
import { RealtimeClient } from '@/lib/openai'

const client = new RealtimeClient()

// Connect to realtime API
await client.connect({
  voice: 'alloy',
  instructions: 'Você é um assistente solar brasileiro...'
})

// Listen for responses
client.on('response.text.delta', (message) => {
  console.log('Text:', message.delta)
})

client.on('response.audio.delta', (message) => {
  // Play audio chunk
  client.playAudio(message.delta)
})

// Send text message
client.sendText('Quanto custa um sistema de 5kWp?')

// Or send voice
const audioData = await recordAudio()
client.sendAudio(audioData)
client.commitAudio()
```

## Architecture

### File Structure

```
src/
├── lib/
│   └── openai/
│       ├── config.ts          # Configuration
│       ├── chatkit.ts         # ChatKit session management
│       ├── assistants.ts      # Assistants API
│       ├── whisper.ts         # Voice transcription
│       ├── realtime.ts        # Realtime API
│       └── index.ts           # Exports
├── components/
│   ├── ChatKitEmbed.tsx       # ChatKit component
│   └── VoiceAgent.tsx         # Voice input component
```

### Configuration Flow

1. Environment variables → `config.ts`
2. Config validation on app start
3. Services use config for API calls
4. Components use hooks/utilities from `/lib/openai`

### Session Management

ChatKit sessions are created per user/device:
- Device ID stored in localStorage
- Client secrets managed securely
- Automatic session refresh on expiry

## Best Practices

### Security

⚠️ **Never expose your API key in client code**

The current implementation includes the API key in frontend code for development. In production:

1. Create a backend API endpoint
2. Handle API calls server-side
3. Use environment variables on server
4. Return only client secrets to frontend

Example backend endpoint:

```typescript
// server.ts
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post('/api/chatkit/session', async (req, res) => {
  const { userId, deviceId } = req.body
  
  const session = await openai.chatkit.sessions.create({
    workflow: { id: process.env.WORKFLOW_ID },
    user: userId || deviceId
  })
  
  res.json({ client_secret: session.client_secret })
})
```

### Performance

- Use lazy loading for ChatKit components
- Stream responses when possible (Realtime API)
- Cache assistant threads per conversation
- Optimize audio quality vs. file size

### User Experience

- Show loading states during transcription
- Display audio level meters during recording
- Provide visual feedback for voice commands
- Offer fallback to text input
- Support both PT-BR and EN languages

## Troubleshooting

### ChatKit not loading

1. Check `VITE_OPENAI_WORKFLOW_ID` is set
2. Verify workflow exists in Agent Builder
3. Check browser console for errors
4. Ensure ChatKit script loaded in index.html

### Whisper transcription errors

1. Check microphone permissions
2. Verify audio format is supported (WebM, MP3, WAV)
3. Ensure file size < 25MB
4. Check language setting matches audio

### Realtime API connection issues

1. Verify API key has realtime access
2. Check WebSocket connection in network tab
3. Ensure audio permissions granted
4. Try reconnecting after errors

## Resources

- [OpenAI ChatKit Docs](https://openai.github.io/chatkit-python)
- [Assistants API Guide](https://platform.openai.com/docs/assistants/overview)
- [Whisper Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [Realtime API Beta](https://platform.openai.com/docs/guides/realtime)
- [Agent Builder](https://platform.openai.com/agent-builder)

## Support

For issues or questions:
1. Check the [OpenAI Community Forum](https://community.openai.com)
2. Review the [API Status Page](https://status.openai.com)
3. Open an issue in this repository
