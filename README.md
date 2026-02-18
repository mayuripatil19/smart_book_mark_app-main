# 🔖 Smart Bookmark

A modern, real-time bookmark manager built with Next.js 16, Supabase, and Tailwind CSS. Save, sync, and access your favorite links from anywhere with instant updates across all your devices.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure sign-in without email/password
- ⚡ **Real-time Sync** - Changes appear instantly across all devices
- 🔒 **Private & Secure** - Your bookmarks are yours alone (Row Level Security)
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🚀 **Fast & Lightweight** - Optimized performance with Next.js 16
- ✅ **Optimistic Updates** - Instant feedback with automatic rollback on errors

## 🚀 Live Demo

**[View Live Demo →](#)** *(https://smart-bookmark-app-tawny-one.vercel.app/)*

## 📸 Screenshots

### Landing Page

<img width="1240" height="877" alt="image" src="https://github.com/user-attachments/assets/2c1a728c-2d86-4470-8e35-b55a8c724de5" />


### Bookmarks Dashboard

<img width="1240" height="845" alt="image" src="https://github.com/user-attachments/assets/9499b57e-2a5d-4072-b09c-03c2dae9b78d" />


## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19** - UI library

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Google OAuth provider

### Deployment
- **Vercel** - Hosting platform for Next.js

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console project (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the setup script:

```sql
-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

3. Get your API credentials from **Settings** → **API**

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
6. Copy Client ID and Client Secret
7. In Supabase: **Authentication** → **Providers** → **Google**
8. Paste credentials and save

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smart-bookmark-app)

**Manual Deployment:**

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel URL)

4. Deploy!

5. **Post-deployment:**
   - Update Google OAuth redirect URI with your Vercel URL
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
   - Redeploy if necessary

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── bookmarks/
│   │   └── page.tsx              # Main bookmarks page
│   ├── globals.css               # Global styles (Tailwind v4)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── AddBookmark.tsx           # Add bookmark form
│   ├── BookmarkList.tsx          # Bookmark list with real-time
│   └── Header.tsx                # Navigation header
├── lib/
│   └── supabase.ts               # Supabase client setup
├── .env.local                    # Environment variables (create this)
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS config (Tailwind v4)
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🐛 Problems Encountered & Solutions

### Problem 1: Real-time Connection Timeout

**Issue:** WebSocket connection to Supabase Realtime was timing out.

**Root Cause:** The `bookmarks` table wasn't added to the `supabase_realtime` publication.

**Solution:**

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;


### Problem 2: Delete Button Not Working

**Issue:** Clicking delete only removed bookmark after page refresh.

**Root Cause:** UI was waiting for real-time DELETE event instead of updating immediately.

**Solution:** Implemented optimistic updates to remove from UI instantly, then sync with database.



### Problem 3: OAuth Redirect Issues

**Issue:** Google sign-in would redirect to error page.

**Root Cause:** Redirect URI mismatch between Google Console and Supabase.

**Solution:** Ensured exact match of redirect URIs and proper environment variable configuration.


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Vercel](https://vercel.com/) - Deployment platform



<div align="center">
  Made with ❤️ using Next.js, Supabase & Tailwind CSS
</div>
