# Voice AI Assistant

A modern voice-powered AI assistant application built with React, featuring real-time conversational AI capabilities powered by ElevenLabs.

**Project URL**: https://lovable.dev/projects/451314f8-6a5f-4190-aac2-87994609d46f

## Features

- **Voice Chat Agent** - Real-time voice conversations with an AI assistant using ElevenLabs Conversational AI
- **Phone Call Support** - Call the AI assistant directly via phone (+31 97010222286)
- **User Authentication** - Secure email/password authentication
- **Subscription Management** - Tiered subscription plans with minute-based usage tracking
  - Basic Plan: 300 minutes/month at €9.99
  - Premium Plan: 1000 minutes/month with monthly/6-month/annual options
- **7-Day Free Trial** - All new users get a free trial period
- **Payment Processing** - Integrated with Mollie Payments for secure transactions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Backend**: Lovable Cloud (Supabase)
- **Voice AI**: ElevenLabs Conversational AI
- **Payments**: Mollie

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd <project-name>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/
│   ├── 3d/              # Three.js 3D components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Feature components
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── integrations/        # External service integrations
└── utils/               # Utility functions

supabase/
└── functions/           # Edge functions for backend logic
```

## Environment Variables

The following environment variables are automatically configured:

- `VITE_SUPABASE_URL` - Backend URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - API key
- `VITE_SUPABASE_PROJECT_ID` - Project identifier

## Deployment

Deploy via Lovable by clicking **Share → Publish** in the editor.

## License

Private project - All rights reserved.
