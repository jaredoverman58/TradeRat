# Phase 2 Testing Checklist

## Pre-Testing Setup

### 1. Database Migrations
Ensure all migrations are applied in Supabase:
```bash
cd TradeRat/supabase
# Apply migrations if not already done
supabase db push
```

Migrations required:
- ✅ 003_league_profiles_and_experts.sql
- ✅ 004_submissions_and_files.sql
- ✅ 006_bundles_and_credits.sql
- ✅ 007_audit_log.sql

### 2. Supabase Storage Bucket Setup

Create the `trade-screenshots` bucket in Supabase Dashboard:
1. Go to Storage section
2. Create new bucket named: `trade-screenshots`
3. **Settings:**
   - Public: No (keep private)
   - File size limit: 10MB
   - Allowed MIME types: image/*

Apply these RLS policies to `storage.objects`:

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

### 3. Environment Variables
Verify `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Start Development Server
```bash
cd TradeRat
npm run dev
```

## Test Scenarios

### Scenario 1: New User - Free Evaluation Flow

**Goal:** Test complete happy path for a new user using their free evaluation

1. **Sign Up**
   - [ ] Navigate to http://localhost:3000/signup
   - [ ] Create new account: test1@example.com / password123
   - [ ] Verify redirect to /dashboard
   - [ ] Confirm "Available Credits" shows 1

2. **Create League Profile**
   - [ ] Click "Submit Trade Request" button
   - [ ] Should show league profile form (no existing profiles)
   - [ ] Fill in league info:
     - League Name: "Test League"
     - Platform: Sleeper
     - Scoring: PPR
     - # of Teams: 12
     - Type: Redraft
   - [ ] Click "Save League Profile"
   - [ ] Verify league profile dropdown appears with saved league

3. **Fill Trade Details**
   - [ ] Select "I received this offer" for offer direction
   - [ ] Select "Standard" for rate tier
   - [ ] Fill in players:
     - Receive: Christian McCaffrey
     - Give: Justin Jefferson, Joe Mixon
   - [ ] Leave picks and FAAB empty
   - [ ] Add context: "Worried about CMC's injury history"

4. **Upload Screenshots**
   - [ ] Drag and drop 2 test images
   - [ ] Verify both files appear in list
   - [ ] Label first file: "My Roster"
   - [ ] Check "This is my roster" for first file
   - [ ] Label second file: "Opponent Roster"

5. **Submit**
   - [ ] Click "Submit Trade for Evaluation"
   - [ ] Should redirect to /submit/success
   - [ ] Verify success page shows:
     - Submission ID
     - Status: "In Queue"
     - Expert Tier: "Standard"
     - Timestamp

6. **Verify Database**
   Check Supabase tables:
   - [ ] `free_evaluations`: used = true for this user
   - [ ] `submissions`: one row with status = 'submitted'
   - [ ] `submission_files`: two rows linked to submission
   - [ ] `storage.objects`: two files uploaded

7. **Check Dashboard**
   - [ ] Click "Go to Dashboard"
   - [ ] Verify credits now show 0
   - [ ] Verify submission appears in "Pending Submissions"

### Scenario 2: Credit Exhaustion Error

**Goal:** Test error handling when user has no credits

1. **Attempt Second Submission**
   - [ ] Click "Submit Trade Request" from dashboard
   - [ ] Select existing league profile
   - [ ] Fill in trade details (any data)
   - [ ] Upload 1 screenshot
   - [ ] Click submit

2. **Verify Error**
   - [ ] Should see error message: "No available credits for this submission"
   - [ ] Error should include link to "View Pricing & Purchase Credits"
   - [ ] Click link, verify redirect to /pricing

3. **Check Database**
   - [ ] Submission should exist with status = 'draft' (not consumed credit)
   - [ ] No new rows in submission_files

### Scenario 3: Multiple League Profiles

**Goal:** Test user with multiple league profiles

1. **Create Second League**
   - [ ] Navigate to /submit
   - [ ] Should see dropdown with existing league
   - [ ] Click "Create New League Profile"
   - [ ] Fill in different league info
   - [ ] Click "Save League Profile"
   - [ ] Verify dropdown now has 2 options

2. **Switch Between Leagues**
   - [ ] Select first league from dropdown
   - [ ] Click "Create New League Profile"
   - [ ] Click "Use Existing League Profile"
   - [ ] Verify dropdown reappears

### Scenario 4: Form Validation

**Goal:** Test required fields and validation

1. **Test Empty Submission**
   - [ ] Navigate to /submit
   - [ ] Try to submit without selecting league
   - [ ] Should see error
   - [ ] Try to submit without uploading files
   - [ ] Should see submit button disabled

2. **Test League Form Validation**
   - [ ] Click "Create New League Profile"
   - [ ] Try invalid num_teams (0, 33, -1)
   - [ ] Should block or show error

### Scenario 5: File Upload Edge Cases

**Goal:** Test file upload limitations

1. **Test Large File**
   - [ ] Try uploading file >10MB
   - [ ] Should fail with error from Supabase

2. **Test Multiple Files**
   - [ ] Upload 5+ files
   - [ ] All should appear in list
   - [ ] Each should be labeled individually

3. **Test File Removal**
   - [ ] Upload 3 files
   - [ ] Remove middle file
   - [ ] Verify only 2 remain

### Scenario 6: Navigation & Back Button

**Goal:** Test browser back button behavior

1. **Back from Success Page**
   - [ ] Complete submission successfully
   - [ ] On success page, click browser back button
   - [ ] Should return to /submit with empty form

2. **Back During Form Fill**
   - [ ] Start filling form
   - [ ] Click "Back to Dashboard" link
   - [ ] Return to /submit
   - [ ] Verify form is reset (no saved state)

### Scenario 7: Authentication

**Goal:** Test auth protection

1. **Unauthenticated Access**
   - [ ] Sign out
   - [ ] Try to navigate to /submit directly
   - [ ] Should redirect to /login

2. **Session Persistence**
   - [ ] Sign in
   - [ ] Start filling form
   - [ ] Refresh page
   - [ ] Should still be signed in
   - [ ] Form should be reset

## Database Verification Queries

After completing test scenarios, run these queries in Supabase SQL Editor:

```sql
-- Check free evaluations
SELECT user_id, used, activated_at
FROM free_evaluations
WHERE user_id = 'YOUR_TEST_USER_ID';

-- Check submissions
SELECT id, user_id, status, service_type, rate_tier, created_at
FROM submissions
WHERE user_id = 'YOUR_TEST_USER_ID'
ORDER BY created_at DESC;

-- Check submission files
SELECT sf.id, sf.file_url, sf.label, sf.is_own_roster
FROM submission_files sf
JOIN submissions s ON sf.submission_id = s.id
WHERE s.user_id = 'YOUR_TEST_USER_ID';

-- Check storage objects
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'trade-screenshots'
AND (storage.foldername(name))[1] = 'YOUR_TEST_USER_ID';
```

## Known Issues to Document

Track any issues found during testing:

1. **Issue:** [Description]
   - **Steps to reproduce:**
   - **Expected behavior:**
   - **Actual behavior:**
   - **Severity:** High/Medium/Low

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on:
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

Check:
- [ ] Form inputs are usable
- [ ] File upload works
- [ ] Buttons are tappable
- [ ] Text is readable

## Performance

- [ ] Page load time < 2s on fast connection
- [ ] File upload shows progress (if implemented)
- [ ] No console errors
- [ ] No memory leaks during file upload

## Success Criteria

✅ All test scenarios pass
✅ No critical bugs found
✅ Database records match expected state
✅ File uploads work reliably
✅ Error messages are clear and helpful
✅ Mobile-friendly
✅ No console errors

## Next Steps After Testing

Once Phase 2 testing is complete:

1. **Document any bugs** found and create issues
2. **Update pricing page** with real Stripe integration (Phase 6)
3. **Build Expert Dashboard** (Phase 3) so submissions can be claimed
4. **Build Admin Dashboard** (Phase 4) for manual assignment
5. **Add email notifications** when submission is ready
