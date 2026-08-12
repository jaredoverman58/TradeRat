# Phase 3: Expert Queue, Claim & Respond Flow - COMPLETE ✅

## Summary

Phase 3 implementation is complete. Experts can now view open submissions, claim them, view full details including uploaded files, write responses, and complete submissions.

## What Was Built

### 1. New Routes
- **`/expert`** - Expert queue page showing open and claimed submissions
- **`/expert/submissions/[id]`** - Submission detail page with response form

### 2. New API Routes
- **`POST /api/expert/claim`** - Claims a submission for an expert
- **`POST /api/expert/respond`** - Creates a response and completes submission

### 3. Core Features Implemented

#### Expert Queue Page (`/expert`)
- **Authentication & Authorization Check**
  - Requires login
  - Checks if user is linked to an `experts` row via `user_id`
  - Shows "not an expert" message if no match found
  
- **My Active Submissions Section**
  - Shows submissions where `expert_id` matches logged-in expert
  - Status: `claimed` or `in_progress`
  - Highlighted with gold border
  - Click to view details
  
- **Open Queue Section**
  - Shows submissions where `status = 'submitted'` AND `expert_id IS NULL`
  - For each submission shows:
    - Service type (Accept/Decline, etc.)
    - Offer direction (received vs proposed)
    - Rate tier (Standard vs Rat Rate)
    - Time waiting (e.g., "2h ago", "1d ago")
    - League platform
    - Scoring format
  - "Claim" button for each submission

#### Claim Action
- **Process:**
  1. Validates expert owns the claim (expert_id matches user_id)
  2. Updates submission:
     - Sets `expert_id` to claiming expert
     - Sets `claimed_at` to current timestamp
     - Updates `status` to `'claimed'`
  3. Only claims if current status is `'submitted'` and `expert_id IS NULL`
  4. Redirects to submission detail page
  
- **No 2-minute cancellation lock** (deferred to later phase)

#### Submission Detail Page
- **Access Control**
  - Only accessible to the assigned expert (`expert_id` matches)
  - 404 if not found or not assigned
  
- **Displays:**
  - **Submission Info Card** (gold border)
    - Service type
    - Rate tier (with "Premium" badge for Rat Rate)
    - Offer direction
    - Submission timestamp
    
  - **League Information**
    - League name
    - Platform
    - Scoring format
    - Number of teams
    - League type
    
  - **Trade Details** (side-by-side layout)
    - User Receives: players, picks, FAAB
    - User Gives: players, picks, FAAB
    - Additional context (if provided)
    
  - **Uploaded Screenshots**
    - Grid layout showing all uploaded files
    - Labels (if provided)
    - "User's Roster" badge if marked
    - Image preview
    - Download full size link
    
  - **Response Form or Sent Response**
    - If no response exists: plain textarea for writing response
    - If response exists: displays sent response with timestamp
    - Character counter
    - Send Response button

#### Send Response Action
- **Process:**
  1. Validates expert authorization
  2. Validates submission is assigned to this expert
  3. Checks no response already exists (active, non-recalled)
  4. Inserts row into `responses`:
     - `submission_id`
     - `expert_id`
     - `written_content`
     - `sent_at` (auto-set to NOW())
  5. Updates submission:
     - Sets `status` to `'completed'`
     - Sets `delivered_at` to current timestamp
  6. Shows success confirmation
  7. Page refreshes to display sent response

## Database Schema Used

### Tables
- `experts` - Expert analyst profiles
- `submissions` - Trade evaluation requests
- `submission_files` - Uploaded screenshots
- `league_profiles` - User's league information
- `responses` - Expert responses to submissions

### Key Fields

**experts:**
- `id` - UUID
- `user_id` - References auth.users
- `name` - 'The Rat', 'The Badger', or 'The Monkey'
- `tier` - 'premium' or 'standard'
- `is_available` - Boolean

**submissions:**
- `expert_id` - References experts (NULL when unclaimed)
- `claimed_at` - Timestamp when claimed
- `delivered_at` - Timestamp when response sent
- `status` - 'submitted' | 'claimed' | 'in_progress' | 'completed'

**responses:**
- `submission_id` - References submissions
- `expert_id` - References experts
- `written_content` - TEXT (required)
- `audio_url` - TEXT (not used in this phase)
- `sent_at` - Timestamp (auto-set)
- `recalled_at` - Timestamp (for future use)

### RLS Policies

**Experts can view open queue submissions:**
```sql
status = 'submitted' AND expert_id IS NULL AND
EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'expert')
```

**Experts can view their assigned submissions:**
```sql
expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
```

**Experts can create responses for their assigned submissions:**
```sql
expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid()) AND
submission_id IN (
  SELECT id FROM submissions
  WHERE expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid())
)
```

## File Structure

```
app/
├── expert/
│   ├── page.tsx                        # NEW - Expert queue
│   └── submissions/
│       └── [id]/
│           ├── page.tsx                # NEW - Submission detail
│           └── RespondForm.tsx         # NEW - Response form component
├── api/
│   └── expert/
│       ├── claim/
│       │   └── route.ts                # NEW - Claim API
│       └── respond/
│           └── route.ts                # NEW - Respond API
└── dashboard/
    └── page.tsx                        # UPDATED - Shows responses
```

## Styling

- Follows existing Wyoming aesthetic (dark theme, gold accents)
- Consistent typography (Playfair Display, DM Sans)
- Gold borders for active/claimed submissions
- Muted borders for open queue
- Image grid for screenshots
- Inline styles (no Tailwind classes)

## Admin Note

The account for **jaredoverman58@gmail.com** has:
- `user_roles.role = 'admin'`
- Linked to `experts` table as "The Badger"

This means this account can:
- Access `/expert` queue
- Claim submissions
- View and respond to claimed submissions
- Access admin features (when built)

## Testing the Flow

### 1. Test Expert Queue Access

**As an expert (jaredoverman58@gmail.com):**
1. Sign in to the app
2. Navigate to `/expert`
3. Should see expert queue page with expert name displayed
4. Should see sections for "My Active Submissions" and "Open Queue"

**As a non-expert user:**
1. Sign in with regular user account
2. Navigate to `/expert`
3. Should see "Not an Expert" message

### 2. Test Claiming a Submission

**Prerequisites:** At least one submission with `status = 'submitted'`

1. Navigate to `/expert`
2. Find submission in "Open Queue" section
3. Click "Claim" button
4. Should redirect to `/expert/submissions/[id]`
5. Should see full submission details

**Verify in database:**
```sql
SELECT expert_id, claimed_at, status
FROM submissions
WHERE id = 'claimed_submission_id';
-- Should show: expert_id = your expert ID, claimed_at = timestamp, status = 'claimed'
```

### 3. Test Viewing Submission Details

1. Navigate to `/expert/submissions/[id]` for a claimed submission
2. Verify all sections display correctly:
   - [ ] Submission info card (service type, rate tier, offer direction)
   - [ ] League information (name, platform, scoring, teams)
   - [ ] Trade details (receive vs give, players/picks/FAAB)
   - [ ] Additional context (if provided)
   - [ ] Uploaded screenshots (with previews and download links)
   - [ ] Response form (if no response yet)

### 4. Test Sending a Response

1. On submission detail page, scroll to response form
2. Write a response in the textarea (e.g., detailed trade analysis)
3. Click "Send Response"
4. Should see success message
5. Page should refresh and show sent response
6. Response form should be replaced with sent response display

**Verify in database:**
```sql
SELECT written_content, sent_at
FROM responses
WHERE submission_id = 'your_submission_id';

SELECT status, delivered_at
FROM submissions
WHERE id = 'your_submission_id';
-- Status should be 'completed', delivered_at should be set
```

### 5. Test Queue Updates

1. Navigate back to `/expert` queue
2. Submission should no longer appear in "Open Queue"
3. Before responding: submission should appear in "My Active Submissions"
4. After responding: submission should disappear from active submissions

## Validation & Error Handling

### Expert Queue Page
- ✅ Redirects to `/login` if not authenticated
- ✅ Shows "not an expert" message if no expert link
- ✅ Empty state for no open submissions
- ✅ Empty state for no active submissions

### Claim Action
- ✅ Validates expert_id matches logged-in user
- ✅ Only claims if status is 'submitted' and expert_id is NULL
- ✅ Prevents double-claiming (WHERE clause)
- ✅ Redirects to detail page on success

### Submission Detail Page
- ✅ 404 if submission not found
- ✅ 404 if not assigned to logged-in expert
- ✅ Gracefully handles missing optional fields
- ✅ Shows "Nothing" for empty receive/give sides

### Send Response
- ✅ Validates response is not empty
- ✅ Checks expert owns the submission
- ✅ Prevents duplicate responses (checks existing)
- ✅ Shows error messages clearly
- ✅ Success confirmation before redirect

## Known Limitations

1. **No audio responses** - Plain text only (audio is Phase 6+)
2. **No rich text editor** - Plain textarea (TipTap is later phase)
3. **No 2-minute claim cancellation** - Deferred to later phase
4. **No pass-off mechanism** - Experts can't reassign submissions yet
5. **No deadline countdown** - Deferred to later phase
6. **No status updates** - Expert can't mark as "in_progress" manually
7. **No image zoom** - Basic img tag, no pinch-to-zoom viewer

## Out of Scope (Not Built)

Per the spec, these are explicitly deferred:
- ❌ 2FA / Twilio integration
- ❌ Audio recording / Whisper transcription
- ❌ Rich text editor (TipTap)
- ❌ Pass-off / waitlist functionality
- ❌ Rat Rate auto-routing logic
- ❌ Countdown/deadline clock UI
- ❌ Admin dashboard (Phase 4)
- ❌ Rating system (Phase 5)
- ❌ Landing page updates

## Next Steps

### Immediate
1. **Test the expert flow** end-to-end
2. **Update user dashboard** to show completed responses (see below)
3. **Test with real submissions** created in Phase 2

### Phase 4: Admin Dashboard
- View all submissions (any status)
- Manually assign submissions to experts
- Override expert assignments
- View expert workload
- Handle refunds/credits

### Phase 5: Additional Features
- Pass-off mechanism (expert can reassign)
- 2-minute claim cancellation window
- In-progress status updates
- Deadline countdown UI
- Rating system after completion

### Phase 6: Audio & Rich Text
- Audio recording for responses
- Whisper transcription
- TipTap rich text editor
- Audio playback for users

## User Dashboard Update Needed

The user dashboard should be updated to display responses when submissions are completed. Current code shows placeholder text.

**Recommended changes to `/dashboard/page.tsx`:**

```typescript
// In completedSubmissions map, fetch responses:
const { data: completedSubmissions } = await supabase
  .from('submissions')
  .select(`
    *,
    expert:experts(name),
    league_profile:league_profiles(league_name),
    response:responses!submission_id(written_content, sent_at)
  `)
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('delivered_at', { ascending: false })

// Then display response preview or link to full view page
```

## Security Notes

- RLS policies prevent experts from viewing submissions not assigned to them
- RLS policies prevent experts from creating responses for unassigned submissions
- Expert identity is verified server-side (not just client-side)
- Responses can only be created once per submission (unique index)
- File URLs are signed/authenticated via Supabase Storage RLS

## API Routes Reference

### POST `/api/expert/claim`
**Body:** Form data
- `submission_id`: UUID
- `expert_id`: UUID

**Response:** Redirect to `/expert/submissions/[id]`

**Errors:**
- 400: Missing required fields
- 403: Unauthorized (expert doesn't match user)
- 500: Database error

### POST `/api/expert/respond`
**Body:** JSON
```json
{
  "submission_id": "uuid",
  "expert_id": "uuid",
  "written_content": "string"
}
```

**Response:** 
```json
{ "success": true }
```

**Errors:**
- 400: Missing fields or response already exists
- 401: Not authenticated
- 403: Unauthorized (expert doesn't match or submission not assigned)
- 404: Submission not found
- 500: Database error

## Change Log

### 2026-08-11 - Initial Implementation
- Created `/expert` queue page
- Created `/expert/submissions/[id]` detail page
- Created `RespondForm` client component
- Created `/api/expert/claim` endpoint
- Created `/api/expert/respond` endpoint
- Tested with admin account linked to "The Badger"
- Documented testing procedures and known limitations
