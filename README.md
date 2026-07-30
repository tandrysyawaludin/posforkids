# POS for Kids 🛒

A fun, kid-friendly Point of Sale (POS) web app where kids can run their own shop or restaurant!

## Features

- **Login** with just your name — no password!
- **Profile photo** via web camera
- **Add / Edit / Delete items** with photos and scan codes
- **Sell items** by scanning codes written on paper (OCR) or typing manually
- **Table selection** for restaurant role-play
- **Payment** via cash or credit
- **WhatsApp receipt** — generates a receipt image and shares via the native share sheet (WhatsApp on mobile)
- **Kid-friendly UI** — big buttons, cute emojis, pastel colors

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** — PostgreSQL database + Storage buckets for images
- **Tesseract.js** — client-side OCR for paper code scanning
- **Tailwind CSS** — styling

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor
3. Create two **public** storage buckets named exactly:
   - `avatars` — for profile photos
   - `items` — for menu item photos
4. Copy your project URL and service role key

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SESSION_SECRET=optional_if_service_role_key_is_set
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel (for parents — 2 steps!)

**Kids don't need to do this. A grown-up does it once:**

1. In Vercel → your project → **Integrations** → search **Supabase** → **Connect**  
   (This adds everything automatically — no copy-paste needed!)

2. In Supabase → **SQL Editor** → run `supabase/schema.sql`  
   Then create buckets **`avatars`** and **`items`** (both **public**)

3. **Redeploy** in Vercel

That's it! Kids just open the website and type their name. 🎉

## How Kids Play

1. **Type your name** and tap Let's Play!
2. **Add items** — take a photo, give it a name, price, and a short code (e.g. `PIZZA1`)
3. **Write the code** on a piece of paper
4. **Go to Sell** — pick a table, scan the paper code or tap items
5. **Checkout** with cash or credit
6. **Share receipt** on WhatsApp!

## Project Structure

```
src/
  app/
    (app)/          # Authenticated pages (dashboard, items, sell, profile)
    api/            # API routes (auth, items, orders, upload)
    login/          # Login page
    register/       # Registration page
  components/       # UI components (camera, scanner, receipt, etc.)
  lib/              # Auth, Supabase, utilities
supabase/
  schema.sql        # Database schema
```
