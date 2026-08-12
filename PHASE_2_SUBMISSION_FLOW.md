# Phase 2: Core Submission Flow - Implementation Complete

## What Was Built

### 1. Main Submission Page (`/submit`)
- **Location:** `app/submit/page.tsx`
- **Features:**
  - League profile creation/selection (Step 1)
  - Trade details form for accept/decline service (Step 2)
  - File upload with drag-and-drop (Step 3)
  - Additional context textarea (Step 4)
  - Credit consumption with error handling

### 2. Success Confirmation Page (`/submit/success`)
- **Location:** `app/submit/success/page.tsx`
- **Features:**
  - Displays submission confirmation
  - Shows submission details (ID, status, tier, timestamp)
  - Explains next steps
  - Links back to dashboard and submit page

### 3. Pricing Page (`/pricing`)
- **Location:** `app/pricing/page.tsx`
- **Purpose:** Placeholder for when users need to purchase credits
- **Note:** Stripe integration to be built in Phase 6

## Database Schema (Already Applied via Migrations)

The following tables are used by this flow:

### `league_profiles`
- Stores user's league information
- Fields: league_name, platform, scoring_format, num_teams, league_type
- RLS: Users can CRUD their own profiles

### `submissions`
- Stores trade evaluation requests
- Fields: service_type, offer_direction, rate_tier, status, receive_players, give_players, etc.
- Status flow: `draft` → `submitted` → `claimed` → `in_progress` → `completed`
- RLS: Users can view/create/update their own submissions (draft only)

### `submission_files`
- Stores uploaded screenshots
- Fields: file_url, file_type, label, is_own_roster
- RLS: Users can upload to their own draft submissions

### `free_evaluations`
- Tracks free evaluation usage
- Automatically created on user signup via trigger
- RLS: Users can view their own status

### `bundles`
- Tracks purchased credit bundles
- Fields: bundle_type, credits_remaining, expires_at
- RLS: Users can view their own bundles

## Credit Consumption Flow

The submission flow implements a 3-step process to handle credit consumption safely:

1. **Create Draft Submission**
   - Insert into `submissions` with `status = 'draft'`
   - This does NOT consume a credit yet

2. **Upload Files**
   - Upload each file to Supabase Storage bucket `trade-screenshots`
   - Insert records into `submission_files` table
   - All uploads must succeed before proceeding

3. **Submit (Trigger Credit Consumption)**
   - Update submission `status` to `'submitted'`
   - This triggers the `consume_credit_on_submission()` function
   - Function checks for free evaluation, then bundle credits
   - If no credits available, throws error: `'No available credits for this submission'`

### Error Handling
- The UI catches the specific error message from the trigger
- Displays user-friendly message with link to `/pricing`
- User is NOT charged if submission fails
- Draft submission remains in database (can be cleaned up later)

## Supabase Storage Setup Required

### Create Storage Bucket
You need to create a storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Create new bucket named: `trade-screenshots`
3. Settings:
   - **Public:** No (private bucket)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `image/*`

### Storage RLS Policies
Apply these RLS policies to the `trade-screenshots` bucket:

```sql
-- Users can upload to their own folders
CREATE POLICY "Users can upload to their own folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trade-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trade-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Experts can view files for submissions they're assigned to
CREATE POLICY "Experts can view submission files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trade-screenshots' AND
  EXISTS (
    SELECT 1 FROM submissions
    WHERE expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
    AND (storage.foldername(name))[2]::uuid = submissions.id
  )
);

-- Admins can view all files
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trade-screenshots' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### Storage Path Structure
Files are uploaded to:
```
/trade-screenshots/{user_id}/{submission_id}/{timestamp}-{index}.{ext}
```

Example:
```
/trade-screenshots/550e8400-e29b-41d4-a716-446655440000/7c9e6679-7425-40de-944b-e07fc1f90ae7/1702345678000-0.png
```

## Testing the Flow

### 1. Test with Free Evaluation
1. Sign up a new user
2. Navigate to `/submit`
3. Create a league profile (or select existing)
4. Fill out trade details
5. Upload 1-2 screenshots
6. Submit
7. Should succeed and redirect to `/submit/success`

### 2. Test Credit Exhaustion
1. Use the same user's free evaluation
2. Try to submit another evaluation
3. Should fail with "No available credits" error
4. Error message should show link to `/pricing`

### 3. Test with Bundle Credits (Once Implemented)
1. Manually insert a bundle for a user:
```sql
INSERT INTO bundles (user_id, bundle_type, credits_remaining, expires_at)
VALUES (
  '{user_id}',
  'standard_3_pack',
  3,
  '2026-01-01'::timestamptz
);
```
2. Submit evaluation
3. Should consume 1 credit from bundle
4. Check that `credits_remaining` decreased

## What's NOT Built (Out of Phase 2 Scope)

❌ Counter-offer service type  
❌ Bundle service type  
❌ Trade Finder service type  
❌ Stripe payment integration  
❌ Expert dashboard (claiming submissions)  
❌ Admin dashboard  
❌ Email/SMS notifications  
❌ Audio file upload  
❌ Player name autocomplete  

## Next Steps

### Immediate (Required for MVP)
1. **Set up Supabase Storage bucket** (instructions above)
2. **Test the submission flow** end-to-end
3. **Build Expert Dashboard** (Phase 3) - experts need to claim and respond to submissions
4. **Build Admin Dashboard** (Phase 4) - assign submissions if experts don't auto-claim

### Future (Phase 6+)
- Integrate Stripe for bundle purchases
- Add email notifications
- Build remaining service types
- Add audio response capability

## File Structure
```
app/
├── submit/
│   ├── page.tsx              # Main submission form
│   └── success/
│       └── page.tsx          # Success confirmation
├── pricing/
│   └── page.tsx              # Pricing page (placeholder)
└── dashboard/
    └── submit/
        └── page.tsx          # OLD - should be removed or redirected
```

## Known Issues / Limitations

1. **No bundle purchases yet** - Users can only use their free evaluation until Stripe is integrated
2. **No file preview** - Files are listed by name but not previewed (could add thumbnails)
3. **No draft saving** - If user navigates away mid-form, data is lost (could add auto-save)
4. **No file size validation client-side** - Supabase will reject >10MB but no UI feedback before upload
5. **League profile creation inline** - Works but could be improved with a dedicated modal/flow

## Environment Variables Required

Make sure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Routes Added
- `GET /submit` - Main submission form
- `GET /submit/success?id={submission_id}` - Success confirmation
- `GET /pricing` - Pricing page

## Styling
- Follows existing Wyoming aesthetic (dark background, gold accents)
- Uses same fonts: Playfair Display (headings), DM Sans (body)
- Consistent with existing landing/auth pages
- Fully inline styles (no Tailwind classes used)
