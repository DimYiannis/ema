# ema.

<img width="2646" height="1472" alt="image" src="https://github.com/user-attachments/assets/115d8eef-fd64-4444-ab25-ab47ee4c9690" />

**No interface. Just speak.**

ema is a voice-first AI assistant for the third age — removing the interface barrier that locks elderly people out of AI. No apps to learn, no menus to navigate. One button, your voice, full AI access.

## Concept

The problem isn't age. It's interfaces. Apps are built by digital natives for digital natives. ema's thesis: eliminate the interface entirely. Voice is the only UI that 60 years of life already trained you to use.

## Features

- **In-browser voice AI** — push to talk, Whisper STT runs locally in browser, no phone number needed
- **NVIDIA LLM** — powered by `meta/llama-3.3-70b-instruct` via NVIDIA NIM
- **Evidence page** — peer-reviewed research on interface exclusion and voice AI adoption
- **Demo login** — try the app without signing up
- **User auth** — email/password via Supabase
- **Subscription plans** — Basic (300 min/mo) and Premium (1000 min/mo)
- **3D orb visualizer** — WebGL orb animates to voice activity

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **3D**: Three.js (custom GLSL shaders)
- **STT**: Whisper `tiny.en` via `@xenova/transformers` (in-browser, no API)
- **LLM**: NVIDIA NIM — `meta/llama-3.3-70b-instruct`
- **TTS**: Browser `speechSynthesis` API
- **Backend**: Supabase (auth + database)

## Project Structure

```
src/
├── components/
│   ├── 3d/          # Three.js orb + scene components
│   ├── ui/          # shadcn/ui components
│   └── Header.vue   # Nav with active route highlights
├── views/
│   ├── Voice.vue        # Voice AI — STT + LLM + TTS
│   ├── Index.vue        # Landing page
│   ├── Dashboard.vue    # User dashboard
│   ├── ArticlesEvidence.vue  # Research page
│   ├── Subscription.vue
│   ├── Login.vue        # Includes demo login
│   └── Register.vue
└── integrations/
    └── supabase/    # Auth + DB client

supabase/
└── migrations/      # DB schema
```

## License

Private — all rights reserved.
