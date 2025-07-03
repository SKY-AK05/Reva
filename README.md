# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Development Notes

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

### Step 6: `chat_messages` Table
Stores the user's chat history with the AI.
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL, -- 'user' or 'bot'
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat messages"
ON chat_messages FOR ALL
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

### Step 8: Supabase Storage for Avatars
The settings page allows users to upload a profile picture. This requires creating a "bucket" in Supabase Storage.

1.  Navigate to the **Storage** section in your Supabase dashboard.
2.  Click **Create a new bucket**.
3.  Name the bucket `avatars` and make it a **Public** bucket.

Then, run the following SQL policies to control who can upload and manage avatars:

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
# Reva
