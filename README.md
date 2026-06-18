# Shoppinglista Midsommar 🌸

A simple mobile-first shared shopping list for midsummer celebrations. No login required — anyone with the link can add, check off, and delete items. Changes sync in real time for all users.

## Features

- Add items with name, category, and quantity
- Check/uncheck items to track what's been bought
- Delete items
- Items sorted by category
- Real-time sync — all users see changes instantly
- Works great on mobile

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + real-time)

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once the project is ready, go to **SQL Editor** and run the following:

```sql
create table shopping_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null default 'Övrigt',
  quantity text not null default '1',
  checked boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Allow anyone to read, insert, update, delete (no login required)
alter table shopping_items enable row level security;

create policy "Public read" on shopping_items for select using (true);
create policy "Public insert" on shopping_items for insert with check (true);
create policy "Public update" on shopping_items for update using (true);
create policy "Public delete" on shopping_items for delete using (true);
```

4. Enable **Realtime** for the table:
   - Go to **Database → Replication**
   - Under "Supabase Realtime", enable `shopping_items`

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Find the values in your Supabase project under **Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — share the URL with everyone who needs to shop!
