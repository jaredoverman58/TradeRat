# Trade Rat

Fantasy football trade advice web app connecting users with expert analysts for personalized trade recommendations.

## Tech Stack

- **Frontend:** Next.js 15 (React 19)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Stripe account (for payments)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`

### 3. Create Database Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT
);

-- Package types enum
CREATE TYPE package_type AS ENUM (
  'free',
  'single',
  'single_premium',
  'bronze',
  'bronze_premium',
  'silver',
  'silver_premium'
);

-- Expert tier enum
CREATE TYPE expert_tier AS ENUM ('any', 'rat_guaranteed');

-- Expert enum
CREATE TYPE expert AS ENUM ('rat', 'badger', 'monkey');

-- Request status enum
CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'completed', 'refunded');

-- Recommendation enum
CREATE TYPE recommendation AS ENUM ('accept', 'decline', 'counter');

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_type package_type NOT NULL,
  credits_purchased INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  expert_tier expert_tier NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_payment_id TEXT NOT NULL
);

-- Trade requests table
CREATE TABLE trade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  status request_status DEFAULT 'pending',
  assigned_expert expert,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  screenshot_urls TEXT[] NOT NULL,
  league_rules JSONB NOT NULL,
  user_notes TEXT
);

-- Trade advice table
CREATE TABLE trade_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_request_id UUID NOT NULL REFERENCES trade_requests(id) ON DELETE CASCADE,
  expert expert NOT NULL,
  proposed_trade TEXT NOT NULL,
  recommendation recommendation NOT NULL,
  analysis TEXT NOT NULL,
  audio_url TEXT,
  counter_offer TEXT,
  roster_impact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expert availability table
CREATE TABLE expert_availability (
  expert expert PRIMARY KEY,
  is_available BOOLEAN DEFAULT true,
  current_queue_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expert availability
INSERT INTO expert_availability (expert) VALUES ('rat'), ('badger'), ('monkey');

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', false);

-- RLS Policies

-- Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read their own packages
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own packages" ON packages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own trade requests
ALTER TABLE trade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own requests" ON trade_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON trade_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own trade advice
ALTER TABLE trade_advice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own advice" ON trade_advice
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_advice.trade_request_id
      AND trade_requests.user_id = auth.uid()
    )
  );

-- Storage policies for screenshots
CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 4. Set Up Stripe

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add them to `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── dashboard/        # User dashboard
│   ├── admin/            # Admin dashboard
│   └── layout.tsx        # Root layout
├── components/           # React components
├── lib/
│   └── supabase/         # Supabase client utilities
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

This app is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables
4. Deploy

## Next Steps

- [ ] Implement Stripe payment flow
- [ ] Create trade request submission form
- [ ] Build admin dashboard
- [ ] Add expert advice submission interface
- [ ] Set up email notifications

## License

Private - All Rights Reserved
