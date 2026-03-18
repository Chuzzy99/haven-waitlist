# Haven Waitlist System

A complete waitlist system for Haven - a daily spiritual companion for Christians and Muslims.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Update `.env.local` with your actual API keys:

```env
# Existing
ANTHROPIC_API_KEY=your_key_here

# Waitlist
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Supabase Setup (5 minutes)
1. Go to [supabase.com](https://supabase.com) → New project
2. Go to SQL Editor → paste the SQL below → Run
3. Go to Settings → API
4. Copy: Project URL → `SUPABASE_URL`
5. Copy: service_role key → `SUPABASE_SERVICE_KEY`
6. Paste both into `.env.local`

### 4. Resend Setup (5 minutes)
1. Go to [resend.com](https://resend.com) → Sign up free
2. Add your domain OR use their test domain
3. Copy your API key
4. Paste into `.env.local` as `RESEND_API_KEY`
5. Update the "from" email in `app/api/waitlist/route.ts` to match your domain

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000/waitlist](http://localhost:3000/waitlist) to see your waitlist page.

---

## Supabase SQL Schema

Run this SQL in your Supabase SQL editor:

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

---

## Features

- **Beautiful Landing Page**: Elegant design with animations and faith-specific content
- **Dual Faith Support**: Separate experiences for Christian and Muslim users
- **Email Confirmations**: Automated emails via Resend with faith-appropriate greetings
- **Position Tracking**: Automatic position assignment with total count display
- **Responsive Design**: Works perfectly on all devices
- **Social Sharing**: Built-in sharing buttons for X (Twitter) and WhatsApp

---

## API Endpoints

### POST /api/waitlist
Adds a new email to the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "faith": "christian" | "muslim" | "both"
}
```

**Response:**
```json
{
  "success": true,
  "position": 42,
  "total": 150,
  "message": "You're on the waitlist!"
}
```

### GET /api/waitlist
Returns the total number of people on the waitlist.

**Response:**
```json
{
  "count": 150
}
```

---

## Deployment

Once deployed to Vercel, your waitlist URL will be:
`https://yourdomain.com/waitlist`

Share this link everywhere:
- LinkedIn post
- Instagram bio  
- WhatsApp groups
- TikTok description
- Twitter/X profile

---

## View Your Waitlist Signups

In Supabase → Table Editor → waitlist, you can see every signup with:
- Email
- Faith preference
- Name (optional)
- Position
- Timestamp

Or hit your own API: `GET /api/waitlist` → returns `{ count: number }`

---

## Free Tier Limits

- **Supabase**: 500MB database, unlimited API calls (perfect for launch)
- **Resend**: 3,000 emails/month (more than enough for most launches)

---

## License

© Haven App. All rights reserved.
