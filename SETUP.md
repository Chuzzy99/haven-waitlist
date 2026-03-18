# 🚀 Quick Setup Guide

Your Haven waitlist is running! To make it fully functional, follow these steps:

## 1. Supabase Setup (Required for database)

1. Go to [supabase.com](https://supabase.com) → Sign up → Create new project
2. Once your project is ready, go to **SQL Editor** 
3. Paste this SQL and click **Run**:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  faith TEXT CHECK (faith IN ('christian', 'muslim', 'both')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed BOOLEAN DEFAULT FALSE,
  position INTEGER
);

-- Auto-assign position on insert
CREATE OR REPLACE FUNCTION set_waitlist_position() RETURNS TRIGGER AS $$
BEGIN
  NEW.position := (SELECT COUNT(*) + 1 FROM waitlist);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_position
BEFORE INSERT ON waitlist
FOR EACH ROW
EXECUTE FUNCTION set_waitlist_position();

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
```

4. Go to **Settings** → **API**
5. Copy **Project URL** and **service_role** key
6. Update your `.env.local` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

## 2. Resend Setup (Required for emails)

1. Go to [resend.com](https://resend.com) → Sign up
2. Add your domain (or use their free test domain)
3. Copy your API key
4. Update your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

5. Update the "from" email in `app/api/waitlist/route.ts` to match your domain

## 3. Update Site URL

In `.env.local`, change:
```env
NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com
```

## 4. Restart the Server

Stop the current server (Ctrl+C) and run:
```bash
npm run dev
```

## 🎉 You're Done!

Your waitlist will now be fully functional at:
- **Local**: http://localhost:3001/waitlist
- **Production**: https://yourdomain.com/waitlist (after deployment)

## 🔧 What's Working Now

Even without setup, you can:
- ✅ View the beautiful landing page
- ✅ See the design and animations
- ✅ Test the form (will show setup error)
- ✅ Preview all faith-specific content

## 📊 Free Tier Limits

- **Supabase**: 500MB database, unlimited API calls
- **Resend**: 3,000 emails/month (perfect for launch)

Need help? Check the full README.md for detailed instructions.
