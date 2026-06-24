# ⚙️ WatchForge AI

> Describe your dream watch. The AI designs the movement.

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Groq API (free) — Llama 4 Scout
- **Database**: Supabase
- **Deploy**: Vercel

## Setup

### 1. Clone & install
```bash
git clone https://github.com/ia2213/watchforge-ai
cd watchforge-ai
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in:
```
VITE_GROQ_API_KEY=       # from console.groq.com (free, no card)
VITE_SUPABASE_URL=       # from supabase.com project settings
VITE_SUPABASE_ANON_KEY=  # from supabase.com project settings
```

### 3. Supabase — run the schema
In your Supabase project, go to **SQL Editor** and run the contents of `supabase/schema.sql`.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```
Add the 3 env variables in Vercel dashboard → Settings → Environment Variables.

## Supported complications
Tourbillon (simple, volant, double-axe, tri-axe), Répétition minutes/quarts, Grande sonnerie, Westminster, Chronographe (flyback, rattrapante), Calendrier perpétuel, Équation du temps, Phase de lune, Carte du ciel, GMT, Temps universel, Réserve de marche, Automates, et bien plus...
