# 🎓 KnowledgeOS — Personal Learning & Technical Knowledge Management System

> A production-quality, modern web application for organizing technical roadmaps, tracking mastery progress, writing rich notes, managing handwritten scans/PDFs, and creating interactive mind maps.

![KnowledgeOS Banner](https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Key Features

1. **Dashboard Overview**:
   - Total Technologies, Total Topics, Completed Topics, Topics in Progress, Total Notes, All-Time Study Hours.
   - Per-technology visual progress bars with automatic percentage calculation.
   - **Continue Learning** cards with instant progress updates and quick resumption.
   - Live activity stream tracking newly mastered topics, notes, and study sessions.
   - **GitHub-style 365-day Activity Heatmap** visualizing study intensity.

2. **Technologies & Recursive Hierarchical Topics**:
   - Organize technologies (Java, Spring Boot, Docker, React, PostgreSQL, AI & ML).
   - **Unlimited nested subtopics** (e.g. Java → Core Java → Collections / Concurrency → Executors / JVM → GC).
   - Expand/collapse subtrees and add child subtopics directly under any node.
   - Status transitions (*Not Started, Learning, Completed, Paused*) and priority levels (*Low, Medium, High*).
   - Automatic completion triggers with celebratory confetti when progress reaches 100%.

3. **Topic Deep Dive & Learning Page**:
   - Interactive checklist manager with progress rollups.
   - **Tiptap Rich-Text Editor** with Markdown shortcuts, code blocks, syntax highlight, tables, quotes, lists, images, and **debounced autosave**.
   - Associated media and handwritten scans viewer.
   - Direct study session logger to record hours and minutes studied.

4. **Interactive Mind Maps (React Flow)**:
   - Dynamic node canvas powered by `@xyflow/react`.
   - Add custom nodes, edit labels inline, drag freely, connect/disconnect handles.
   - Auto-generate mind maps from technology roadmaps or topic deep-dives with 1-click.
   - MiniMap, zoom, pan, fit view, and export to JSON.

5. **Files & Handwritten Notes Gallery**:
   - Support for PDF documents, handwritten notes, PNG/JPG scans, and text documents.
   - Dedicated **Handwritten Notes Gallery** with high-resolution, zoomable & pan-capable modal inspector.
   - Association with technologies and topics.

6. **Learning History & Analytics**:
   - Daily study time bar chart and technology time distribution donut chart powered by **Recharts**.
   - Study time filters (*This Week, This Month, All Time*).
   - Complete historical session logs.

7. **Global Search (Ctrl + K) & Favorites**:
   - Command palette with instant keyboard navigation across all entities.
   - Consolidated Favorites hub.

8. **Theme & Storage Flexibility**:
   - Seamless **Dark Mode**, **Light Mode**, and **System Mode**.
   - Zero-barrier local vault mode with pre-seeded realistic data + full Supabase Cloud PostgreSQL integration.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Variables Design System
- **Components & Icons**: Radix UI Primitives, Lucide Icons
- **Rich Text Notes**: Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, tables, code blocks, highlight, underline)
- **Mind Maps**: React Flow (`@xyflow/react`)
- **Analytics & Charts**: Recharts, Date-fns
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Supabase Storage
- **State & Sync**: Universal Learning Store with optimistic reactivity & local persistence

---

## 📦 Getting Started Locally

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional for Local Demo Mode)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

If connecting to Supabase Cloud, provide:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*Note: If no keys are provided, the app will smoothly run in local vault mode with pre-loaded realistic sample data.*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Cloud Database & Storage Setup

1. Create a free Supabase project at [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of [`supabase/schema.sql`](file:///supabase/schema.sql).
4. Go to **Storage** and ensure the `learning-files` bucket is created.
5. In **Project Settings -> API**, copy the `Project URL` and `anon/public` key into your `.env.local` or Vercel environment settings.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will build and deploy your application in under a minute!

---

## 📄 License

MIT License — Built for personal technical mastery and knowledge management.
