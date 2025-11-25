# Yello Solar Hub ☀️

> **AI-powered solar energy management platform for Brazil**

An intelligent chat interface combining GitHub Spark and OpenAI technologies to provide comprehensive solar energy analysis, equipment recommendations, and financing solutions tailored for the Brazilian market.

## ✨ Features

- 🤖 **AI-Powered Chat**: GitHub Spark + OpenAI ChatKit integration
- 🎙️ **Voice Agents**: Speech-to-text with Whisper and text-to-speech capabilities
- 📊 **Interactive Widgets**: Energy analysis, solar kit selection, financing calculators
- 🎨 **Modern UI**: React 19, Tailwind CSS v4, Radix UI, Framer Motion
- 🌐 **Brazilian Context**: Portuguese language, R$ currency, local regulations
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔒 **Secure**: Environment-based configuration with API key protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- (Optional) OpenAI workflow ID from [Agent Builder](https://platform.openai.com/agent-builder)

### Installation

1. **Clone the repository**
2. 
   ```bash
   git clone <repository-url>
   cd chatgpt-mirror
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```bash
   VITE_OPENAI_API_KEY=sk-proj-...
   
   # Optional: Enable ChatKit
   VITE_OPENAI_CHATKIT_ENABLED=true
   VITE_OPENAI_WORKFLOW_ID=wf_...
   
   # Optional: Enable voice features
   VITE_OPENAI_WHISPER_ENABLED=true
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── pages/              # Page components (Dashboard, Equipment, etc.)
│   ├── ui/                 # Reusable UI primitives (Button, Card, etc.)
│   ├── widgets/            # Chat widgets (Solar Kit, Financing, etc.)
│   ├── ChatKitEmbed.tsx    # OpenAI ChatKit integration
│   └── VoiceAgent.tsx      # Voice input/output component
├── lib/
│   ├── openai/            # OpenAI service integrations
│   │   ├── chatkit.ts     # ChatKit session management
│   │   ├── assistants.ts  # Assistants API
│   │   ├── whisper.ts     # Voice transcription & TTS
│   │   └── realtime.ts    # Realtime voice API
│   └── utils.ts           # Utility functions
├── hooks/                  # Custom React hooks
└── styles/                 # CSS and theme files
```

## 📚 Documentation

- **[OpenAI Integration Guide](docs/OPENAI_INTEGRATION.md)**: Detailed setup and usage for all OpenAI features
- **[Copilot Instructions](.github/copilot-instructions.md)**: AI agent development guide

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Tech Stack

### Core
- **[GitHub Spark](https://github.com/github/spark)**: LLM integration framework
- **[React 19](https://react.dev)**: UI framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type safety
- **[Vite](https://vitejs.dev/)**: Build tool

### OpenAI Integration
- **[ChatKit](https://openai.github.io/chatkit-python)**: Agent-powered chat
- **[Assistants API](https://platform.openai.com/docs/assistants)**: Custom AI assistants
- **[Whisper](https://platform.openai.com/docs/guides/speech-to-text)**: Speech-to-text
- **[Realtime API](https://platform.openai.com/docs/guides/realtime)**: Voice conversations

### UI/UX
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Styling
- **[Radix UI](https://www.radix-ui.com/)**: Headless components
- **[Framer Motion](https://www.framer.com/motion/)**: Animations
- **[Phosphor Icons](https://phosphoricons.com/)**: Icon library

## 🎯 Key Features

### ChatKit Integration
Embed AI-powered chat with OpenAI workflows:
```tsx
import { ChatKitEmbed } from '@/components/ChatKitEmbed'

<ChatKitEmbed floating position="bottom-right" />
```

### Voice Agents
Add voice input to any component:
```tsx
import { VoiceAgent } from '@/components/VoiceAgent'

<VoiceAgent 
  onTranscription={(text) => console.log(text)}
  showTranscript={true}
/>
```

### Interactive Widgets
Specialized widgets for solar energy domain:
- Energy bill analysis
- Solar kit recommendations
- Financing calculators
- Equipment comparisons

## 🔒 Security

⚠️ **Important**: The current implementation includes API keys in frontend code for development purposes only.

**For production**:
1. Create a backend API service
2. Move OpenAI API calls to server-side
3. Use environment variables on the server
4. Return only client secrets to frontend

See [OpenAI Integration Guide](docs/OPENAI_INTEGRATION.md) for production setup.

## 🌍 Brazilian Solar Energy Context

This platform is specifically designed for the Brazilian market:
- Portuguese language interface
- Brazilian Real (R$) currency
- Local energy regulations and standards
- Solar irradiation data for Brazil
- Local equipment suppliers and financing options

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📧 Support

For issues or questions:
1. Check the [OpenAI Integration Guide](docs/OPENAI_INTEGRATION.md)
2. Review [GitHub Issues](../../issues)
3. Visit [OpenAI Community Forum](https://community.openai.com)

---

Built with ❤️ for sustainable energy in Brazil
