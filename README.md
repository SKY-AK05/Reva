# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Database Setup (Manual)

This application is designed to be connected to a database to persist user data for features like tasks, expenses, and reminders. The following guide outlines the necessary tables and security policies for a PostgreSQL-based service like Supabase.

### 1. `tasks` Table
Stores all user-created tasks.

| Column      | Type      | Description                                     |
|-------------|-----------|-------------------------------------------------|
| `id`        | `uuid`    | Primary Key. Defaults to `uuid_generate_v4()`.  |
| `user_id`   | `uuid`    | Foreign Key to `auth.users(id)`.                |
| `description`| `text`    | The content of the task (e.g., "Buy groceries").|
| `due_date`  | `date`    | The date the task is due.                       |
| `priority`  | `text`    | 'low', 'medium', or 'high'.                     |
| `completed` | `boolean` | `true` if the task is done. Defaults to `false`.|
| `created_at`| `timestamptz` | Defaults to `now()`.                          |

### 2. `expenses` Table
Tracks user-logged expenses.

| Column      | Type      | Description                                     |
|-------------|-----------|-------------------------------------------------|
| `id`        | `uuid`    | Primary Key.                                    |
| `user_id`   | `uuid`    | Foreign Key to `auth.users(id)`.                |
| `description`| `text`    | What the expense was for (e.g., "Coffee").      |
| `amount`    | `numeric` | The monetary value of the expense.              |
| `category`  | `text`    | Category like 'Food', 'Software', 'Travel'.     |
| `date`      | `date`    | The date the expense occurred.                  |
| `created_at`| `timestamptz` | Defaults to `now()`.                          |

### 3. `reminders` Table
Stores all user-set reminders.

| Column      | Type      | Description                                     |
|-------------|-----------|-------------------------------------------------|
| `id`        | `uuid`    | Primary Key.                                    |
| `user_id`   | `uuid`    | Foreign Key to `auth.users(id)`.                |
| `description`| `text`    | What to be reminded of.                         |
| `remind_at` | `timestamptz`| The exact time for the notification.          |
| `created_at`| `timestamptz` | Defaults to `now()`.                          |


### 4. `training_memory` Table
Logs chat interactions for future fine-tuning.

| Column      | Type      | Description                                     |
|-------------|-----------|-------------------------------------------------|
| `id`        | `uuid`    | Primary Key.                                    |
| `chat_input`| `text`    | The user's original message.                    |
| `response`  | `text`    | The AI-generated response.                      |
| `created_at`| `timestamptz` | Defaults to `now()`.                          |


### Row-Level Security (RLS) Policies

To ensure users can only access their own data, you must enable Row-Level Security (RLS) on your tables and create policies. Here is a general example for the `tasks` table. You should apply similar policies to `expenses` and `reminders`.

**Example Policy: Allow users to manage their own tasks**
```sql
-- 1. Enable RLS on the table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy for SELECT (read)
CREATE POLICY "Users can view their own tasks."
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- 3. Create a policy for INSERT (create)
CREATE POLICY "Users can create their own tasks."
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy for UPDATE (update)
CREATE POLICY "Users can update their own tasks."
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Create a policy for DELETE (delete)
CREATE POLICY "Users can delete their own tasks."
ON tasks FOR DELETE
USING (auth.uid() = user_id);
```
The `training_memory` table can have a simpler policy that just allows inserts if you don't need users to read from it.
```sql
CREATE POLICY "Allow authenticated inserts for training data"
ON training_memory FOR INSERT
TO authenticated
WITH CHECK (true);
```
