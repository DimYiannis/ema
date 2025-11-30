# Voice AI Assistant

<img width="2802" height="1418" alt="image" src="https://github.com/user-attachments/assets/57678110-3bc1-471e-bb2a-fd5f38deaa03" />

A modern voice-powered AI assistant application built with React, featuring real-time conversational AI capabilities powered by ElevenLabs.

<img width="2888" height="1418" alt="image" src="https://github.com/user-attachments/assets/c67e55b1-29bb-4c3d-af1c-b8e886659de1" />

**Project URL**: https://lovable.dev/projects/451314f8-6a5f-4190-aac2-87994609d46f

## Features

- **Voice Chat Agent** - Real-time voice conversations with an AI assistant using ElevenLabs Conversational AI

- 
  <img width="2682" height="1392" alt="image" src="https://github.com/user-attachments/assets/1ed12489-4adb-4c77-a501-716f8044c0b4" />

- **Phone Call Support** - Call the AI assistant directly via phone (+31 97010222286)
  
  <img width="2834" height="1412" alt="image" src="https://github.com/user-attachments/assets/a32a954f-ecb6-474c-87eb-f3e2399eab95" />

- **User Authentication** - Secure email/password authentication
- **Subscription Management** - Tiered subscription plans with minute-based usage tracking
  - Basic Plan: 300 minutes/month at €9.99
  - Premium Plan: 1000 minutes/month with monthly/6-month/annual options
    
    <img width="2690" height="1402" alt="image" src="https://github.com/user-attachments/assets/22577fde-7840-41f6-9608-200f5aeeb290" />

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
## Deployment

Deploy via Lovable by clicking **Share → Publish** in the editor.

## License

Private project - All rights reserved.
