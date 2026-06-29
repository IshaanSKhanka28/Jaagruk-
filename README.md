<div align="center">

<img src="https://jaagruk.vercel.app/logo.png" alt="Jaagruk Logo" width="120" />

# Jaagruk

### See it. Report it. Fix it.

**AI-powered civic issue reporting for India**

[![Live App](https://img.shields.io/badge/Live%20App-jaagruk.vercel.app-1A73E8?style=for-the-badge&logo=vercel&logoColor=white)](https://jaagruk.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://jaagruk-production.up.railway.app)
[![Built with Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash%20Lite-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Vibe2Ship](https://img.shields.io/badge/Vibe2Ship%20by%20Google-PS2%20Community%20Hero-34A853?style=for-the-badge&logo=google&logoColor=white)]()

</div>

---

## What is Jaagruk?

Jaagruk ("Aware" in Hindi) is a full-stack civic tech platform that turns citizen photos into formal municipal complaints — automatically, in under 60 seconds.

Upload a photo of a pothole, broken streetlight, or water leak. Jaagruk's **multi-agent AI pipeline** validates it, classifies it, routes it to the right department, and generates an official complaint letter — with zero manual effort.

---

## The Problem

Communities across India face daily civic failures — broken roads, water leaks, garbage dumps, damaged streetlights. But:

- Reporting is **fragmented** across WhatsApp groups and offline forms
- Complaints reach the **wrong authority** or no one at all
- Citizens have **no visibility** into what happens after they report
- Spam and false reports **overwhelm** municipal systems

Jaagruk solves all of this with AI.

---

## Multi-Agent AI Pipeline

Every report triggers a 4-stage agent pipeline powered by **Gemini 2.5 Flash Lite**:

```
📸 Photo Upload
      │
      ▼
┌─────────────────┐
│  Validator Agent │  ← Gemini Vision: Is this a real civic issue?
│                 │    Rejects spam, assesses damage severity
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Classifier Agent    │  ← Gemini Vision: What type of issue?
│                      │    Category (Roads/Water/Sanitation/Electrical)
│                      │    Priority level (public safety impact)
└──────────┬───────────┘
           │
           ▼
┌───────────────────┐
│   Router Agent    │  ← Gemini Text: Which department?
│                   │    Geolocation → municipal ward → responsible officer
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Reporter Agent   │  ← Gemini Text: Generate formal complaint
│                   │    Guidelines violated + structured letter + PDF
└───────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| 📸 **Photo Validation** | Gemini Vision rejects spam and irrelevant uploads |
| 🏷️ **Smart Classification** | Auto-detects issue type, category, and priority |
| 🗺️ **Live Issue Map** | Real-time Leaflet.js map with category filters |
| 📋 **Formal Complaints** | AI-generated official letters, downloadable as PDF |
| 📊 **Impact Dashboard** | Recharts analytics — trends, resolution rates, ward heatmaps |
| 🏆 **Citizen Leaderboard** | Gamified impact points and badges for contributors |
| 👍 **Community Upvoting** | Escalate unresolved high-priority issues |
| 🌙 **Dark / Light Mode** | Full theme support across all pages |
| 🔍 **Agent Reasoning Panel** | See exactly how the AI made each decision |

---

## Tech Stack

### Frontend
```
Next.js 14          → App framework
Tailwind CSS        → Styling
shadcn/ui           → Component library
Framer Motion       → Animations
Leaflet.js          → Live map
Recharts            → Dashboard analytics
Vercel              → Deployment
```

### Backend
```
FastAPI             → API framework
asyncpg             → Async PostgreSQL driver
Supabase            → PostgreSQL database
Cloudinary          → Image storage & CDN
Railway             → Deployment
```

### AI & Google Technologies
```
Gemini 2.5 Flash Lite   → All 4 AI agents
google-genai SDK        → Python integration
Gemini Vision           → Photo analysis
Google Cloud            → API infrastructure
Google Flow             → Logo design & animation
```

---

## Project Structure

```
Jaagruk/
├── frontend/                   # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx            # Homepage + live feed
│   │   ├── report/             # Issue submission flow
│   │   ├── map/                # Live issue map
│   │   ├── dashboard/          # Analytics dashboard
│   │   ├── leaderboard/        # Citizen rankings
│   │   └── settings/           # User settings
│   └── components/
│       ├── ui/                 # shadcn components
│       └── ...
│
└── backend/                    # FastAPI app
    ├── main.py                 # API entry point
    ├── agents/
    │   ├── validator.py        # Gemini Vision validator
    │   ├── classifier.py       # Issue classifier
    │   ├── router.py           # Department router
    │   └── reporter.py         # Complaint generator
    ├── models/                 # Supabase DB models
    └── utils/
        ├── cloudinary.py       # Image upload
        └── pdf.py              # PDF generation
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- Cloudinary account
- Google AI API key (Gemini)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_API_URL=your-backend-url
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY, CLOUDINARY_* vars
uvicorn main:app --reload --port 8001
```

### Environment Variables

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

**Backend (`.env`)**
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## How It Works — User Flow

1. **Citizen opens Jaagruk** → sees live map of local issues
2. **Taps "Report Issue"** → uploads photo + location + description
3. **Validator Agent** → checks if photo is a real civic problem
4. **Classifier Agent** → identifies category (Roads/Water/Sanitation/Electrical) and priority
5. **Router Agent** → maps location to the correct municipal ward and department
6. **Reporter Agent** → generates a formal complaint letter
7. **Citizen gets** → a shareable report with tracking ID, PDF download, and map pin
8. **Community** → upvotes, monitors, and holds authorities accountable

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [jaagruk.vercel.app](https://jaagruk.vercel.app) |
| Backend | Railway | [jaagruk-production.up.railway.app](https://jaagruk-production.up.railway.app) |
| Database | Supabase | PostgreSQL (ap-south-1) |
| Images | Cloudinary | CDN delivery |

---

## Built For

**Vibe2Ship by Google** — Problem Statement 2: Community Hero

> *Build a platform that enables citizens to identify, report, validate, track, and resolve community issues through collaboration, data, and intelligent automation.*

---

<div align="center">

**Jaagruk** — Built with ❤️ for India's 1.4 billion citizens

[Live App](https://jaagruk.vercel.app) · [Report an Issue](https://jaagruk.vercel.app/report) · [View the Map](https://jaagruk.vercel.app/map)

</div>
