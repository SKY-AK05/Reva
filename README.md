
# Reva: Smart Chat Assistant - Developer Documentation

Welcome to the Reva project! This document serves as the single source of truth for developers working on the application.

## Table of Contents

1.  [Introduction](#1-introduction)
    *   [1.1. Purpose & Core Features](#11-purpose--core-features)
    *   [1.2. Target Audience](#12-target-audience)
2.  [Technology Stack](#2-technology-stack)
3.  [Project Structure](#3-project-structure)
4.  [Core Architecture & Concepts](#4-core-architecture--concepts)
    *   [4.1. Authentication Flow](#41-authentication-flow)
    *   [4.2. Frontend State Management (React Context & Real-time)](#42-frontend-state-management-react-context--real-time)
    *   [4.3. AI Architecture: Tool-Based Genkit Flow](#43-ai-architecture-tool-based-genkit-flow)
    *   [4.4. Note Editor & Image Handling](#44-note-editor--image-handling)
5.  [Backend & AI Flows](#5-backend--ai-flows)
6.  [Database Setup](#6-database-setup)
    *   [Prerequisites: Enable UUID Extension](#prerequisites-enable-uuid-extension)
    *   [Database Tables](#database-tables)
    *   [Supabase Storage Setup](#supabase-storage-setup)
7.  [Local Development Setup](#7-local-development-setup)
8.  [Deployment](#8-deployment)

---

## 1. Introduction

### 1.1. Purpose & Core Features

Reva is a chat-based, AI-powered smart life assistant designed to streamline a user's daily productivity. It combines a modern, conversational interface with powerful backend AI to help users manage their lives with simple, natural language commands.

**Core Features:**

*   **Conversational Interface:** A primary chat UI for all interactions.
*   **AI-Powered Task Management:** Create, update, and manage tasks using natural language.
*   **AI-Powered Expense Tracking:** Log single or multiple expenses and have the AI automatically categorize them.
*   **Smart Reminders:** Set reminders with natural language (e.g., "remind me to call mom in 2 hours").
*   **Goal & Journal Management:** Track long-term goals and maintain a private journal.
*   **Rich Note-Taking:** A dedicated notes section with a rich text editor that supports image uploads.
*   **Overview Dashboard:** A central "Library" page that summarizes all user data.

### 1.2. Target Audience

The application is for individuals seeking a unified, intelligent tool to manage various aspects of their personal and professional lives without juggling multiple apps.

## 2. Technology Stack

Reva is a modern, full-stack TypeScript application built with the following technologies:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **AI Framework:** [Genkit (by Google)](https://firebase.google.com/docs/genkit)
*   **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 3. Project Structure

The project follows a standard Next.js App Router structure with feature-based organization.

```
/
├── public/                 # Static assets (images, videos, fonts)
├── src/
│   ├── ai/                 # All Genkit AI-related code
│   │   ├── flows/          # Core AI flows (e.g., command processing, note composition)
│   │   ├── dev.ts          # Entry point for Genkit development server
│   │   └── genkit.ts       # Genkit global configuration
│   ├── app/                # Next.js App Router
│   │   ├── (app)/          # Route group for authenticated app pages
│   │   │   ├── chat/
│   │   │   ├── notes/
│   │   │   └── ... (other app pages)
│   │   │   └── layout.tsx  # Main app layout with sidebar and header
│   │   ├── (auth)/         # Route group for authentication pages (login, signup)
│   │   ├── globals.css     # Global styles and ShadCN theme variables
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable React components
│   │   └── ui/             # ShadCN UI components
│   ├── context/            # React Context providers for global state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and libraries
│   │   └── supabase/       # Supabase client configurations (client/server)
│   ├── services/           # Database interaction logic (data access layer)
│   └── middleware.ts       # Authentication middleware for protecting routes
├── .env                    # Environment variables (MUST BE CREATED MANUALLY)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

## 4. Core Architecture & Concepts

### 4.1. Authentication Flow

Authentication is managed by Supabase Auth and integrated into Next.js using a custom middleware.

1.  **Middleware (`src/middleware.ts`):** This is the gatekeeper. It checks for a valid user session on every request to a protected route (e.g., `/chat`, `/tasks`). If no session exists, it redirects the user to `/login`.
2.  **Client-Side Auth:** The login (`/login`) and signup (`/signup`) pages use the Supabase client-side library (`@supabase/ssr`) to handle user authentication. Supabase automatically manages session tokens and stores them in cookies.
3.  **Server-Side Auth:** Server Components and Server Actions use a server-side Supabase client initialized in `src/lib/supabase/server.ts`. This client reads the session cookie to securely identify the user for database operations.

### 4.2. Frontend State Management (React Context & Real-time)

The application avoids complex state management libraries like Redux, instead opting for a robust system using **React Context** and **Supabase Realtime**.

*   **Context Providers:** Each data type (Tasks, Expenses, Notes, etc.) has its own context provider located in `src/context/`. For example, `TasksContextProvider` is responsible for the global state of tasks.
*   **Initial Data Fetch:** When a context provider mounts, it performs an initial fetch of its data from the database via a function in `src/services/`.
*   **Real-time Subscriptions & Reconciliation:** The magic happens here. Each context provider subscribes to its corresponding database table using Supabase's `postgres_changes` feature. This listener provides a specific payload (`INSERT`, `UPDATE`, `DELETE`) for any change.
    *   **Example (`TasksContext`):**
        ```typescript
        // Subscribes to any INSERT, UPDATE, or DELETE on the 'tasks' table
        const channel = client
          .channel('public:tasks')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks' },
            (payload) => {
              // Instead of re-fetching, we reconcile the change locally
              if (payload.eventType === 'INSERT') {
                setTasks(prev => [...prev, payload.new]);
              }
              if (payload.eventType === 'UPDATE') {
                setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
              }
              if (payload.eventType === 'DELETE') {
                 setTasks(prev => prev.filter(t => t.id !== payload.old.id));
              }
            }
          )
          .subscribe();
        ```
*   **Result:** This architecture ensures that if a user creates a task in the chat, the Tasks page UI updates instantly by manipulating the local state, without requiring a network request for a full data refresh. This makes the application feel significantly faster and more responsive.

### 4.3. AI Architecture: Tool-Based Genkit Flow

The heart of Reva's intelligence is a **Tool-based AI flow** powered by Genkit. This is far more sophisticated than simple keyword matching.

**The Core Idea:** We don't just ask the AI to "chat." We give it a set of "tools" (functions) and instruct it to choose the best one for the user's request.

**The Central Hub: `processCommand` Flow**

The file `src/ai/flows/process-command.ts` is the AI's main brain. It defines the tools and the master prompt that guides the AI's decision-making process.

**Tools (`ai.defineTool`)**

Each "tool" is a TypeScript function that the AI can decide to call. Examples:

*   `createTask`: Creates a new task in the database.
*   `updateReminder`: Modifies an existing reminder.
*   `trackExpenses`: Logs one or more expenses.
*   `generalChat`: Handles conversational chit-chat.

Each tool has a `name`, a `description` (crucial for the AI to understand its purpose), and input/output schemas defined with `zod`.

**The Conversational Flow (Example: Updating a Reminder)**

1.  **User Creates:** `You: "Remind me to call mom at 10am"`
    *   The `processCommand` flow receives this input.
    *   The AI's prompt guides it to recognize the intent to create a reminder.
    *   It calls the `createReminder` tool, which saves the reminder to the database and returns the new reminder's ID (e.g., `abc-123`).
    *   The application UI receives this new ID and stores it as `lastItemContext`.
    *   The AI responds: `Reminder set for "Call mom" at 10:00 AM.`

2.  **User Updates (with Context):** `You: "Actually, change it to 8am"`
    *   The chat UI sends the new message **along with the context** from the previous turn (`lastItemContext: { id: 'abc-123', type: 'reminder' }`) and the recent chat history.
    *   The `processCommand` flow receives this rich input. Its prompt is specifically designed to handle this:
        *   It sees the instruction "change it".
        *   It sees the `contextItem` that the last interaction was about reminder `abc-123`.
        *   It correctly deduces that "it" refers to the existing reminder and the intent is to *update*, not create.
    *   The AI model chooses to use the `updateReminder` tool, passing it the ID `abc-123` and the new time.
    *   The tool function executes, updating the correct row in the database. The real-time listener on the Reminders page ensures the UI updates instantly.
    *   The AI responds: `OK, I've updated that reminder.`

This tool-based approach, combined with passing conversational history and context, allows for fluid, powerful, and intuitive interactions.

### 4.4. Note Editor & Image Handling

The notes feature uses the [Tiptap](https://tiptap.dev/) rich text editor.

*   **Persistence:** Notes are saved in the `notes` database table.
*   **Image Uploads:** Image handling is designed to be seamless.
    1.  A user can drag-and-drop or paste an image into the editor.
    2.  A client-side event intercepts the file.
    3.  The file is sent to the `uploadImage` Server Action in `src/app/(app)/notes/actions.ts`.
    4.  This action uploads the image to a Supabase Storage bucket named `notes-images`.
    5.  It returns the public URL of the uploaded image.
    6.  The Tiptap editor inserts the image into the note's content using this URL.
*   **Resizing:** The editor uses a custom image extension that wraps the `<img>` tag in a resizable `<div>`, allowing native browser resizing.

## 5. Backend & AI Flows

The application does not have a traditional REST or GraphQL API. Instead, it uses a combination of **Next.js Server Actions** and **Genkit Flows**.

*   **Server Actions (e.g., `src/app/(app)/chat/actions.ts`):** These are used for client-server communication that doesn't require complex AI logic, such as orchestrating the call to the main AI flow. `processUserChat` is the primary action for the chat interface.
*   **Genkit Flows (`src/ai/flows/`):** These are the core of the backend logic.
    *   `process-command.ts`: The main AI orchestrator described above.
    *   `compose-note.ts`: Takes raw text/HTML and uses AI to format it, add headings, lists, and generate a title.
    *   `generate-chart-from-text.ts`: Analyzes a block of text and attempts to convert it into structured data for a chart.

## 6. Database Setup

This application is designed to be connected to a database to persist user data. The following guide outlines the necessary tables and security policies for a PostgreSQL-based service like Supabase.

**IMPORTANT:** You must execute the following SQL queries in your Supabase SQL Editor to set up the necessary tables and policies for the application to function correctly.

### Prerequisites: Enable UUID Extension

First, you need to enable the `uuid-ossp` extension, which allows you to generate unique identifiers for your database records.

```sql
-- Run this command just once for your project
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Database Tables

Run the following SQL to create all the necessary tables and enable Row Level Security (RLS) policies. RLS ensures that users can only access and modify their own data.

```sql
-- tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    priority TEXT NOT NULL DEFAULT 'medium',
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own expenses" ON expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reminders Table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reminders" ON reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- journal_entries Table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notes Table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- training_memory Table
CREATE TABLE training_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    chat_input TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE training_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated inserts for training data" ON training_memory FOR INSERT TO authenticated WITH CHECK (true);
```

### Supabase Storage Setup

The application uses Supabase Storage for user avatars and images within notes. You must create these buckets manually.

#### Bucket: `avatars`

1.  Navigate to the **Storage** section in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Name the bucket `avatars` and make it a **Public** bucket.
4.  Run the following SQL policies to control access:

```sql
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = (storage.foldername(name))[1]::uuid) WITH CHECK (bucket_id = 'avatars');
```

#### Bucket: `notes-images`

1.  Navigate to the **Storage** section in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Name the bucket `notes-images` and make it a **Public** bucket.
4.  Run the following SQL policies:

```sql
CREATE POLICY "Users can view their own note images" ON storage.objects FOR SELECT USING (bucket_id = 'notes-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Users can upload their own note images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'notes-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Users can update their own note images" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid() = (storage.foldername(name))[1]::uuid) WITH CHECK (bucket_id = 'notes-images');
CREATE POLICY "Users can delete their own note images" ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = (storage.foldername(name))[1]::uuid);
```

## 7. Local Development Setup

Follow these steps to get the project running on your local machine.

**1. Prerequisites:**
*   [Node.js](https://nodejs.org/) (v20 or later recommended)
*   A [Supabase](https://supabase.com/) project
*   A [Google AI Studio](https://aistudio.google.com/) API Key for Genkit

**2. Clone the Repository:**
```bash
git clone <repository_url>
cd <repository_directory>
```

**3. Install Dependencies:**
```bash
npm install
```

**4. Set Up Environment Variables:**
Create a file named `.env` in the root of the project and add the following keys. You can get the Supabase keys from your project's "API Settings" page.

```env
# Supabase URL and Anon Key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI API Key for Genkit
GOOGLE_API_KEY=your_google_ai_api_key
```

**5. Set Up the Database:**
Go to the Supabase SQL Editor for your project and run all the SQL commands outlined in the [Database Setup](#6-database-setup) section above.

**6. Run the Development Server:**
```bash
npm run dev
```
The application will be available at `http://localhost:9002`.

## 8. Deployment

This application is pre-configured for deployment on **Firebase App Hosting**. The `apphosting.yaml` file contains the necessary configuration. To deploy, follow the [Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting).
