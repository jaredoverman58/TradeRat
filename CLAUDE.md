# Trade Rat

Fantasy football trade advice web app connecting users with expert analysts for personalized trade recommendations.

## Overview

Trade Rat provides fantasy football managers with expert trade analysis from three tiers of analysts: The Trade Rat (premium), The Badger (intermediate), and The Monkey (entry-level). Users submit screenshots of league rosters and rules, then receive structured trade advice within 24-48 hours.

**Two Service Types:**
1. **Trade Evaluation** - Expert evaluates a specific trade offer you received (accept/decline/counter)
2. **Trade Finder** - Expert analyzes your entire league and creates custom trade suggestions from scratch

**Selling Points:**
- Human expertise from named analysts (not AI-generated generic advice)
- Two distinct services for different needs (evaluate vs. find trades)
- Quick turnaround (24-48 hours)
- Flexible pricing: free tier, pay-per-trade, and discounted packages
- Supports all major fantasy platforms (ESPN, Yahoo, Sleeper, NFL.com, etc.)

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Stripe
- **Hosting:** Vercel
- **Design:** Dark theme with gold accents

## User Roles

### End Users (Fantasy Managers)
- Create account (no credit card required for free tier)
- Submit trade advice requests with screenshots
- Purchase packages or pay-per-trade
- View advice history
- Track remaining credits in packages

### Experts (Analysts)
- **The Trade Rat:** Premium tier, highest expertise
- **The Badger:** Mid-tier expert
- **The Monkey:** Entry-level expert

### Admin (You)
- Manually assign trade requests to available experts
- Monitor expert capacity and request queues
- Handle refunds for late advice
- Track package usage and expirations

## Pricing & Packages

All paid packages expire at end of fantasy season. Users can use credits over time (don't need to use all at once).

### Trade Evaluation Packages
For users who have a specific trade offer to evaluate (accept/decline/counter).

| Tier | Price | Credits | Expert | Est. Time |
|------|-------|---------|--------|-----------|
| **Free** | $0 | 1 review | Any | 20-30 min |
| **Single** | $4.99 | 1 review | Any | 20-30 min |
| **Single Premium** | $7.99 | 1 review | The Rat | 20-30 min |
| **Bronze** | $9.99 | 3 reviews | Any | 20-30 min each |
| **Gold** | $14.99 | 3 reviews | The Rat | 20-30 min each |
| **Silver** | $24.99 | 7 reviews | Any | 20-30 min each |
| **Platinum** | $29.99 | 7 reviews | The Rat | 20-30 min each |

### Trade Finder Packages (Premium)
For users who want expert to create custom trade suggestions by analyzing entire league.

| Tier | Price | Credits | Expert | Est. Time |
|------|-------|---------|--------|-----------|
| **Finder Single** | $8.99 | 1 review | Any | 45-60 min |
| **Finder Single Premium** | $13.99 | 1 review | The Rat | 45-60 min |
| **Finder Bronze** | $17.99 | 3 reviews | Any | 45-60 min each |
| **Finder Gold** | $26.99 | 3 reviews | The Rat | 45-60 min each |
| **Finder Silver** | $44.99 | 7 reviews | Any | 45-60 min each |
| **Finder Platinum** | $52.99 | 7 reviews | The Rat | 45-60 min each |

**Refund Policy:**
- If advice is delivered late (beyond 48 hours), refund is issued
- Exception: If user submits request within 48 hours of their league's trade deadline, no refund for late advice (insufficient time buffer)
- Users are responsible for knowing their own league trade deadlines

## User Flows

### Free Tier Flow
1. User signs up (email + password, no payment info)
2. Uploads screenshot of their roster
3. Provides league format details (PPR, roster size, etc.)
4. Receives generic roster evaluation within 24-48 hours:
   - Position strength/weakness analysis
   - Trade asset identification
   - General strategy (e.g., "trade WR depth for RB")
   - 2 example trade scenarios
5. No competitor roster analysis (limited scope to drive conversions)

### Trade Evaluation Flow (Paid)
1. User purchases evaluation package via Stripe
2. Clicks "Submit Trade Request" → Selects "Evaluate an Offer"
3. Describes specific trade offer: "Their CMC for my Jefferson and Mixon"
4. Uploads 2 screenshots (their roster + opponent's roster)
5. Provides league rules (PPR, scoring, roster limits, etc.)
6. Adds context in notes (team needs, playoff outlook, concerns)
7. Files stored in Supabase Storage
8. Admin assigns request to available expert based on:
   - Package tier (Rat guaranteed vs any available)
   - Expert capacity/queue
9. Expert evaluates and submits: Accept/Decline/Counter + analysis
10. User receives notification when advice is ready
11. User views recommendation in dashboard

### Trade Finder Flow (Premium)
1. User purchases finder package via Stripe
2. Clicks "Submit Trade Request" → Selects "Find Me a Trade"
3. Uploads 10-12 screenshots (all team rosters in league)
4. Provides league rules and roster details
5. Adds strategic notes (positions to upgrade, rebuild vs compete, untouchables)
6. Admin assigns to expert
7. Expert analyzes entire league to identify realistic trade partners
8. Expert creates 1-3 specific trade suggestions with target teams
9. User receives notification
10. User views custom trade suggestions with full analysis

### Advice Structure (Expert Submission)

Experts provide advice in structured fields based on request type:

**For Trade Evaluation Requests:**
- **Proposed Trade:** Restatement of the offer being evaluated
- **Recommendation:** Accept / Decline / Counter-offer
- **Analysis:** Text writeup explaining the reasoning
- **Counter-offer (Optional):** "Suggest [Player A] for [Player Y] instead"
- **Roster Impact:** Positional depth before/after, playoff outlook, risk assessment
- **Audio (Optional):** Voice commentary (uploaded audio file)

**For Trade Finder Requests:**
- **Proposed Trade:** "You should offer [Player A, B] to Team X for [Player C, D]"
- **Analysis:** Why this trade works for both teams, why this partner was selected
- **Alternative Options:** 1-2 additional trade suggestions if available
- **Roster Impact:** How each suggestion impacts team composition and strategy
- **Audio (Optional):** Voice commentary walking through suggestions

## Admin Dashboard Requirements

The admin interface must support:

### Request Management
- View all pending trade requests (sortable by submission time, package tier)
- Filter by status: Pending / Assigned / Completed / Refunded
- Assign requests to specific experts (Rat, Badger, Monkey)
- Bulk actions (assign multiple to one expert)

### Expert Capacity Tracking
- Real-time queue view for each expert:
  - Requests currently assigned
  - Average completion time
  - Availability status (toggle on/off)
- Alerts when expert queues exceed thresholds (e.g., >10 pending)

### Package & Credit Management
- View user package details (credits remaining, expiration date)
- Manual credit adjustments (refunds, comp credits)
- Bulk expire packages at season end

### Analytics
- Revenue by package tier
- Conversion rate (free → paid)
- Average turnaround time by expert
- Request volume trends

## Data Models (Supabase Tables)

### users
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
- stripe_customer_id (text, nullable)

### packages
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- package_type (enum: free, single, single_premium, bronze, bronze_premium, silver, silver_premium)
- credits_purchased (integer)
- credits_remaining (integer)
- expert_tier (enum: any, rat_guaranteed)
- purchased_at (timestamp)
- expires_at (timestamp) // End of fantasy season
- stripe_payment_id (text)

### trade_requests
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- package_id (uuid, foreign key → packages, nullable for free tier)
- status (enum: pending, assigned, completed, refunded)
- assigned_expert (enum: rat, badger, monkey, nullable)
- request_type (enum: trade_evaluation, trade_finder)
- specific_trade_offer (text, nullable - only for trade_evaluation requests)
- submitted_at (timestamp)
- completed_at (timestamp, nullable)
- screenshot_urls (text[], array of Supabase Storage URLs)
- league_rules (jsonb: {platform, scoring, roster_size, etc.})
- user_notes (text)

### trade_advice
- id (uuid, primary key)
- trade_request_id (uuid, foreign key → trade_requests)
- expert (enum: rat, badger, monkey)
- proposed_trade (text)
- recommendation (enum: accept, decline, counter)
- analysis (text)
- audio_url (text, nullable) // Supabase Storage URL
- counter_offer (text, nullable)
- roster_impact (text)
- created_at (timestamp)

### expert_availability
- expert (enum: rat, badger, monkey, primary key)
- is_available (boolean)
- current_queue_count (integer)
- updated_at (timestamp)

## File Upload Implementation

### Supabase Storage Bucket
- Bucket name: `trade-screenshots`
- Public read access: No (requires authenticated user)
- File size limit: 10 MB per image
- Allowed formats: .jpg, .jpeg, .png, .webp

### Upload UI (Next.js Component)
- **Direct upload:** File input button
- **Drag-and-drop zone:** Using `react-dropzone` or similar
- Preview thumbnails before submission
- Multi-file support (users can upload multiple roster screenshots)

### Storage Path Structure
```
/trade-screenshots/{user_id}/{trade_request_id}/{filename}
```

## Design Guidelines

### Color Palette
- **Primary background:** Dark gray/charcoal (#1a1a1a, #2d2d2d)
- **Accent color:** Gold (#d4af37, #f4e5b8 for highlights)
- **Text:** White/off-white (#f5f5f5)
- **Secondary elements:** Muted gold/bronze tones

### Typography
- Headings: Bold, high contrast
- Body: Readable size (16px+), good line height for long-form advice

### Key UI Elements
- Expert badges (Rat/Badger/Monkey) with distinct iconography
- Package tier cards with clear pricing/value prop
- Progress indicators for request status
- Dark mode optimized (primary theme)

## Future Enhancements (Post-MVP)

- Google Ads integration for user acquisition
- Email/SMS notifications when advice is ready
- Trade history archive
- Expert leaderboard (accuracy tracking if users report outcomes)
- Mobile app (React Native)
- OCR for automatic roster parsing (stretch goal)
- AI pre-screening to flag incomplete submissions

## Development Priorities

### Phase 1: MVP
1. User authentication (Supabase Auth)
2. Basic trade submission form with file upload
3. Stripe integration (packages + single purchases)
4. Admin dashboard (assign requests, view queue)
5. Expert advice submission interface
6. User dashboard (view advice, track credits)

### Phase 2: Polish
1. Drag-and-drop upload UI
2. Audio advice upload/playback
3. Email notifications
4. Package expiration automation
5. Refund workflow

### Phase 3: Growth
1. Google Ads integration
2. Analytics dashboard
3. Expert performance metrics
4. Referral program

## Open Questions / Decisions Needed

- [ ] Exact fantasy season end date for package expiration (typically late December)
- [ ] Email service provider (Supabase has basic email, may need SendGrid/Postmark for volume)
- [ ] Audio hosting strategy (Supabase Storage vs dedicated audio CDN)
- [ ] Notification preferences (email only, or add SMS/push later)
- [ ] Expert onboarding process (how do Rat/Badger/Monkey access the system initially)
