# ConsultantAI

A production-ready React application for analyzing interview transcripts using Claude AI (Anthropic), with Supabase persistence, batch upload capabilities, and professional PDF exports.

## Features

- 🤖 **Claude AI Integration** - Intelligent transcript analysis using Claude 3.5 Sonnet
- 💾 **Supabase Backend** - Cloud database with real-time sync and authentication
- 📤 **Batch Upload** - Process multiple transcripts at once (.txt, .docx, .pdf)
- 📊 **Analysis Views** - Workflows, Pain Points, Tools & Roles
- 📄 **PDF Export** - Professional reports with @react-pdf/renderer
- ✏️ **Inline Editing** - Manual refinement of AI-generated insights
- 📈 **Company Summaries** - Aggregate multiple interviews into strategic reports

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript 5.3.3
- **Build Tool:** Vite 5.1.4
- **Styling:** Tailwind CSS 3.4.1
- **Backend:** Supabase 2.45.0 (PostgreSQL + Auth + Real-time)
- **AI Service:** Anthropic SDK 0.32.0 (Claude 3.5 Sonnet)
- **PDF Generation:** @react-pdf/renderer 4.0.0
- **Icons:** Lucide React 0.344.0

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (https://supabase.com)
- Anthropic API key (https://console.anthropic.com)

### Installation

1. Clone the repository
```bash
cd /Users/carliegbert/Desktop/consultant-ai
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
   - Create a new project in Supabase Dashboard
   - Run the SQL in `supabase-schema.sql` in the SQL Editor
   - Copy your project URL and anon key

4. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key
```

5. Start development server
```bash
npm run dev
```

## Project Structure

```
src/
├── types/          # TypeScript type definitions
├── lib/            # Core libraries (Supabase, Anthropic clients)
├── services/       # Business logic (analysis, PDF, upload)
├── hooks/          # Custom React hooks
├── components/     # React components
│   ├── auth/       # Authentication
│   ├── layout/     # Layout components
│   ├── upload/     # File upload
│   ├── analysis/   # Analysis views
│   ├── summary/    # Company summaries
│   └── export/     # Export functionality
└── utils/          # Utility functions
```

## Usage

1. **Sign Up/Login** - Create an account or sign in
2. **Upload Transcripts** - Drag & drop or select files
3. **View Analysis** - Browse AI-generated insights
4. **Edit & Refine** - Manually adjust analysis results
5. **Generate Summary** - Aggregate multiple interviews
6. **Export** - Download as PDF or JSON

## Cost Estimates

- **Claude API:** ~$0.015 per transcript analysis
- **Supabase:** Free tier (500MB database, sufficient for 5000 interviews)
- **Hosting:** Free tier on Vercel/Netlify

**Total:** ~$1.50/month for 100 analyses

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## License

MIT
