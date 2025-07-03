# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development Notes

## How the AI Works (Tool-Based Flow)

The application has been upgraded to use a more sophisticated AI architecture powered by **Genkit Tools**. This allows for more natural, conversational interactions where the AI can understand context and differentiate between creating new items and updating existing ones.

### The Core Idea: Giving the AI Tools

Instead of relying on simple keywords, we provide the AI model with a set of "tools" it can choose to use. These tools are just regular TypeScript functions that the AI can call to perform actions, like `createTask` or `updateReminder`.

The central AI "brain" is the `processCommand` flow located in `src/ai/flows/process-command.ts`. This flow decides which tool to use based on your request and the current context.

### Example Flow: Updating a Reminder

Let's walk through the example from your plan:

**1. User creates a reminder:**
> **You:** "Remind me to call mom at 10am"

*   The `processCommand` flow sees the intent to create a reminder.
*   It calls the `createReminder` tool.
*   The tool saves the new reminder to the `reminders` table in the database.
*   The application receives the new reminder's ID (e.g., `abc-123`) and keeps it in memory for the next conversation turn.
*   The AI responds: `Reminder set for "Call mom" at 10:00 AM.`

**2. User asks to modify the reminder:**
> **You:** "Actually, change it to 8am"

*   The chat interface sends your new message **along with the context** from the previous turn (the reminder ID `abc-123`).
*   The `processCommand` flow receives this input. Its prompt is specifically designed to handle this:
    *   It sees the instruction "change it".
    *   It sees the context that the last interaction was about reminder `abc-123`.
    *   It correctly deduces that "it" refers to the reminder and that the intent is to *update*, not create.
*   The AI model chooses to use the `updateReminder` tool, passing it the ID `abc-123` and the new time, `8am`.
*   The `updateReminder` tool function executes, updating the correct row in the `reminders` database table.
*   The AI responds: `OK, I've updated that reminder.`

This tool-based approach makes the assistant much more powerful and intuitive, allowing for the kind of fluid, contextual conversations you expect from a smart assistant.


## Database Setup (Manual)

This application is designed to be connected to a database to persist user data. The following guide outlines the necessary tables and security policies for a PostgreSQL-based service like Supabase.

**IMPORTANT:** You must execute the following SQL queries in your Supabase SQL Editor to set up the necessary tables and policies for the application to function correctly.

### Prerequisites: Enable UUID Extension

First, you need to enable the `uuid-ossp` extension, which allows you to generate unique identifiers for your database records.

```sql
-- Run this command just once for your project
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 1: `tasks` Table
Stores all user-created tasks.
```sql
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

CREATE POLICY "Users can manage their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 2: `expenses` Table
Tracks user-logged expenses.
```sql
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

CREATE POLICY "Users can manage their own expenses"
ON expenses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 3: `reminders` Table
Stores all user-set reminders.
```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
ON reminders FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 4: `goals` Table
Tracks user-defined goals and their progress.
```sql
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

CREATE POLICY "Users can manage their own goals"
ON goals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 5: `journal_entries` Table
Stores user's private journal entries.
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries"
ON journal_entries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 6: `notes` Table
Stores user's notes with rich text content.
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
ON notes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Step 7: `training_memory` Table
Logs chat interactions for future fine-tuning.
```sql
CREATE TABLE training_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Nullable if you want to log anonymous interactions
    chat_input TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE training_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated inserts for training data"
ON training_memory FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Step 8: Supabase Storage Setup
The application uses Supabase Storage for user avatars and images within notes.

#### Bucket: `avatars`
1.  Navigate to the **Storage** section in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Name the bucket `avatars` and make it a **Public** bucket.
4.  Run the following SQL policies to control who can manage avatars:
```sql
-- Allow users to see their own avatar
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = (storage.foldername(name))[1]::uuid)
WITH CHECK (bucket_id = 'avatars');
```

#### Bucket: `notes_images`
1.  Navigate to the **Storage** section in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Name the bucket `notes_images` and make it a **Public** bucket.
4.  Run the following SQL policies to control who can manage note images:
```sql
-- Allow users to view their own note images
CREATE POLICY "Users can view their own note images"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to upload images to their folder
CREATE POLICY "Users can upload their own note images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notes_images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to update their own images
CREATE POLICY "Users can update their own note images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = (storage.foldername(name))[1]::uuid)
WITH CHECK (bucket_id = 'notes_images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own note images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = (storage.foldername(name))[1]::uuid);
```
# Reva
