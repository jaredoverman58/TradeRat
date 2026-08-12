# TRADE RAT — PROJECT STATUS + FULL SPEC
(Paste this entire document as the first message in any new conversation about this project)

---

## PART 1: CURRENT STATUS (as of this session)

### Completed phases (all tested and verified working end-to-end)
1. Database schema (migrations 003–009 applied to Supabase)
2. Core submission flow — user creates a trade evaluation, uploads files, submits, credit auto-consumed (/submit or /dashboard)
3. Expert queue, claim & respond (/expert) — expert claims open submission, writes response, status becomes completed
4. Admin dashboard — Overview + Submissions tabs (/admin)
5. Landing page + modular block toggle system (/) — all 8 sections stored in landing_page_sections table, admin can toggle/edit via admin dashboard
6. Stripe (3-pack bundle purchase) + Twilio (response-ready SMS) — IN PROGRESS, not yet fully tested

### Where Phase 6 was left off
Migration 009 added phone_number, but Claude Code's original migration mistakenly targeted an old dead table called users (leftover prototype scaffolding, not connected to real accounts). Corrected to add phone_number to user_roles instead (the real per-user table, one row per account). Just asked Claude Code to update its frontend/backend code to read/write phone_number from user_roles, not users. Need to confirm that fix landed before testing.

### Still to do for Phase 6
- Confirm Claude Code's code fix for user_roles.phone_number actually landed
- Set up Stripe webhook for local testing (Claude Code suggested Stripe CLI's "stripe listen" command — not yet evaluated whether that's the right approach or if there's a simpler alternative for local testing)
- Test: buy 3-pack bundle with Stripe test card 4242 4242 4242 4242, confirm credits appear correctly in bundles table
- Add a real phone number, test that SMS fires when an expert sends a response

### Known quirks in this project (do not be surprised by these)
- There is leftover prototype schema from before the full rebuild: old tables users, packages, trade_advice, trade_requests, expert_availability (this one has 3 real rows: rat/badger/monkey — otherwise mostly empty/test data), and an old trigger handle_new_user. These are NOT part of the live app — ignore them unless something mistakenly references them (migration 009 did this once already).
- Test accounts: jaredoverman1@hotmail.com (regular user, has 1 completed submission), jaredoverman58@gmail.com (linked to The Badger expert row, has role = admin)
- Migrations have repeatedly errored on first attempt due to leftover state from prior partial/interrupted runs. Best practice: check actual live DB state with an inventory query before assuming a fix didn't work or a table doesn't exist. Useful inventory query:

SELECT 'table' as kind, table_name as name FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 'type', typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e'
UNION ALL
SELECT 'function', routine_name FROM information_schema.routines WHERE routine_schema = 'public'
UNION ALL
SELECT 'trigger', trigger_name FROM information_schema.triggers WHERE trigger_schema IN ('public', 'auth')
ORDER BY kind, name;

- Migrations are applied manually by copy/pasting SQL into the Supabase SQL Editor (not via CLI — CLI auth/linking was unreliable in this project). This has worked reliably every time once adopted.
- Supabase runs each pasted SQL Editor query as one transaction — if any part errors, the WHOLE thing rolls back, even parts that appeared to succeed moments before. Don't assume partial success.
- is_admin() is a SECURITY DEFINER helper function (created in migration 003) used throughout RLS policies to avoid infinite-recursion bugs when checking admin role from within policies on user_roles itself. Reuse this pattern for any new admin-only RLS policy rather than writing a raw subquery.
- Project repo: github.com/jaredoverman58/TradeRat. Live site: trade-rat.vercel.app (Vercel, auto-deploys on push to GitHub). Local dev: localhost:3000, started via npm run dev from the TradeRat project folder in VS Code.
- Working style established this project: scope each phase small, write a spec, hand to Claude Code, test end-to-end in the live Supabase database (not just trust the UI), fix real bugs found via actual error messages/screenshots rather than guessing.

### Still to build after Phase 6
7. Polish: FAQ page, rating system, Whisper audio transcription for expert responses, account deletion flow (30-day grace period), 2FA for admin/expert accounts, rich text editor (TipTap) for expert responses, audio recording for responses, waitlist system, pass-off system, countdown/deadline clocks, remaining bundle types and rate tiers, remaining SMS/email notification types, full dedicated pricing page, other admin tabs (Experts, Users, Payments, Analytics, Flags, Support, Alerts, Testimonials, Stats management), CSV export, search functionality, promo codes / referral / commissioner infrastructure (all currently placeholder-only in the mega spec below)

---

## PART 2: FULL MEGA SPEC (long-term vision — pull small slices from this per phase, do not attempt to build all of it at once)

Rebuild the entire Trade Rat application from the ground up using a modular block architecture. Every component, section, feature, and content element must be built as an independent self-contained module with its own on/off toggle in the database, its own content fields editable from the admin dashboard, its own display logic that renders nothing when toggled off with no empty space or layout gaps, and clean separation from every other component so adding or removing any feature never breaks anything else. This modular architecture applies to every landing page section, every dashboard widget, every notification type, every service option, every expert account, every bundle, and every admin tool.

LANDING PAGE

Build a sleek premium mobile-first landing page designed at 390px width baseline that expands beautifully to desktop. Every section is a modular block toggleable from the admin Landing Page Manager. The page has the following sections in this exact order. All sections hidden when empty with no placeholder text shown to public.

Fixed navigation bar: Trade Rat logo in italic Playfair Display gold left aligned. Claim Your Free Analysis button in gold filled right aligned. Contact Us link in navigation. Navigation stays fixed and visible while scrolling. On mobile navigation collapses to logo left and gold button right only.

Section 1 Hero: Large Playfair Display 900 weight headline reading "The trap is already set." Subtext in DM Sans reading "The only place in the world where a one in a billion trading mind analyzes your specific league. No AI. No algorithms. Pure human precision." Two buttons side by side on desktop stacked on mobile. Button 1 gold filled reading "Claim Your Free Analysis." Button 2 ghost outline with gold border reading "Meet The Rat" that smooth scrolls to Section 3 when clicked. Small muted text below buttons reading "First trade evaluation is on us." All buttons minimum 44 pixels tall.

Section 2 Why The Rat: Small gold uppercase DM Mono label reading "WHY THE TRADE RAT." Three lines of text each with a thin gold left border and generous white space between them. Line 1 - Human intelligence, not algorithms. Real expertise from real experts who live and breathe fantasy football. Line 2 - Full league analysis. We comb every roster in your league to find your best possible move — not generic advice based on player rankings. Line 3 - One in a billion instinct. The Rat has spent years finding angles other managers never see coming. Centered large italic gold Playfair Display pull quote below reading "Every trade is a trap. The question is whether you're setting it or falling into it."

Section 3 Meet The Rat: Dark premium card with gold border. Massive italic Playfair Display gold text reading "The Rat." Three short credential lines in muted DM Sans text. Line 1 - Fantasy football's most obsessive trading mind. Line 2 - Years of dissecting rosters, exploiting leverage, and closing deals others thought were impossible. Line 3 - Rat Rate slots are limited. Every submission reviewed personally. This section is the scroll target for the Meet The Rat button.

Section 4 The Rat Stats: Modular block hidden completely when empty. When populated shows a clean row of stat cards in large gold Playfair Display numbers with muted DM Mono labels beneath. Admin can add, edit, toggle, and reorder stats from the admin Stats tab. Maximum 4 stats displayed. No placeholder visible to public when empty.

Section 5 Services: Small gold uppercase DM Mono label reading "WHAT WE DO." Three cards side by side on desktop stacked vertically on mobile each with dark background and subtle gold border on hover. Card 1 - Got a trade offer? We tell you take it or leave it. $4.99. Card 2 - Want to negotiate? We build your counter offer. $5.99. Card 3 - Need a trade? We find your best move in your league. $14.99. Middle call to action below cards with text in large Playfair Display and gold Claim Your Free Analysis button.

Section 6 Testimonials: Modular block hidden completely when no testimonials exist. When populated shows testimonial cards in dark background with subtle gold border. Each card shows quote in italic Playfair Display cream, attribution in DM Mono muted text showing first name only and league type, optional service used label. Admin manages all testimonials from admin Testimonials tab. Section hidden until admin adds and activates at least one testimonial.

Section 7 Pricing Table: Small gold uppercase DM Mono label reading "PRICING." Clean three column table with columns Service, Standard, Rat Rate. Row 1 Accept/Decline $4.99 $5.99. Row 2 Counter Offer $5.99 $6.99. Row 3 Decline plus Counter Offer bundle $8.99 $10.99 labeled Most Popular. Row 4 Full League Trade Finder $14.99 $19.99. Small italic muted text under Rat Rate column reading "The Rat reviews every submission personally." Link below reading "See full pricing and bundle savings" Platform disclaimer below reading "The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform."

Section 8 Final CTA: Large Playfair Display text reading "Your league doesn't know what's coming." One line below in muted DM Sans reading "The first read is free. The wins after that aren't." Gold Claim Your Free Analysis button. Small link below reading "See full pricing and bundle savings"

Footer: Left side reads "The Trade Rat — Fantasy Trade Intelligence." Right side reads "Human logic. Real experience. No bots." Footer links include Contact Us, Terms and Conditions, FAQ, and Privacy.

Design rules for entire site: Background #0C0A07. Gold #C9A84C. Cream text #F2EDE4. Muted text #6b6457. Borders #2a261e. Playfair Display for all headlines and display text. DM Sans for all body text. DM Mono for all labels buttons and data. Generous white space throughout. No emojis no generic icons no bullet symbols anywhere. Premium and sparse. Every element earns its place. Mobile first 390px baseline. Three service cards stack vertically on mobile. Pricing table scrolls horizontally on mobile or collapses to card format. All buttons minimum 44 pixels tall. Bottom tab navigation on mobile showing Home, Submissions, Profile, Contact. Full navigation bar on desktop. TipTap rich text editor for all expert response writing. Custom gold branded audio waveform player for user audio playback with scrub bar download option and play button.

ADMIN LANDING PAGE MANAGER

Build a Landing Page Manager tab in the admin dashboard where admin can see all landing page sections listed with on/off toggle switches, reorder sections by drag and drop, edit all text content within each section including headlines copy stats testimonials without touching any code, preview changes before publishing, and add new modular sections in the future. Every content field on the landing page is editable from this manager. No code changes required for any content update.

FULL PRICING PAGE

Build a dedicated pricing page accessible from all "See full pricing and bundle savings" links. Show all services with full descriptions. Standard Rate versus Rat Rate comparison chart side by side showing exactly what each tier includes. All bundles with savings clearly shown. Most Popular Bundle highlighted. Detailed breakdown of Full League Trade Finder explaining the full process - user uploads every roster in their league, expert personally analyzes all rosters, expert identifies the best available trade opportunity specific to that user's league, delivers full analysis of who to target what to offer and why. Platform disclaimer on page.

SERVICES complete list:

For received trade offers: Accept/Decline Standard $4.99. Accept/Decline Rat Rate $5.99. Counter Offer Standard $5.99 requires mandatory opponent roster upload. Counter Offer Rat Rate $6.99 requires mandatory opponent roster upload. Decline plus Counter Offer bundle Standard $8.99 Most Popular requires mandatory opponent roster upload. Decline plus Counter Offer bundle Rat Rate $10.99 requires mandatory opponent roster upload.

For proposed trade offers: Accept/Decline Standard $4.99. Accept/Decline Rat Rate $5.99. Counter Offer never available for proposed trades and never shown as an option.

Full League Trade Finder: Standard Rate $14.99. Rat Rate $19.99. Requires all league rosters uploaded. Requires user to identify their own roster by clicking to highlight gold. Hard block until own roster identified.

BUNDLES WITH SAVINGS:

Decline plus Counter Offer Standard $8.99 saving $1 Most Popular. Decline plus Counter Offer Rat Rate $10.99 saving $1. Three pack Standard evaluations $12.99 saving $2. Three pack Rat Rate evaluations $14.99 saving $3. Five pack Standard evaluations $19.99 saving $5. Five pack Rat Rate evaluations $24.99 saving $5. Three pack Standard Finder $39.99 saving $5. Three pack Rat Rate Finder $49.99 saving $10. Mixed 3 Standard evaluations plus 1 Standard Finder $24.99 saving $5. Mixed 3 Rat Rate evaluations plus 1 Rat Rate Finder $32.99 saving $6.

ACCOUNT CREATION AND AUTHENTICATION:

Signup page fields: Email address required. Display name or username required. Password minimum 6 characters required. Terms of service checkbox mandatory before account creation completes. Payment method on file required before free evaluation unlocks. Email verification required before free evaluation unlocks.

Login page: Email and password fields. Forgot password link below password field - clicking opens form to enter email and receive password reset link handled by Supabase auth natively.

Two factor authentication via SMS phone verification for admin and expert accounts only. Implemented via Twilio. Admin and experts prompted to enable 2FA on first login. Phone number required for admin and expert accounts. Verification code sent via SMS on each login. Cost approximately $0.01 per verification text.

FREE FIRST EVALUATION:

One free Accept/Decline Standard evaluation per account. Tracked as boolean flag free_evaluation_used on user record. Email verification required before unlocking. Valid payment method on file required before unlocking. One per email address enforced at database level. Creating multiple accounts to claim multiple free evaluations results in termination covered in terms. Clock starts on opening day of NFL season or user signup date whichever is later. Runs 30 days. Expires at end of NFL playoffs if not used. Day 20 automated email reminder - "10 days left on your free evaluation. Don't let it go to waste." Day 28 automated email - "Your free evaluation expires in 2 days." Expiration triggers dashboard message - "Your free evaluation has expired. Purchase a package to get started."

BUNDLE AND SINGLE PURCHASE EXPIRATION:

All bundles and single service purchases expire one year from purchase date. 30 day warning email before expiration for all purchases. Two week warning email before expiration for all purchases. After expiration unused services dissolve with no refund covered in terms.

ONBOARDING three step welcome flow for all new users:

Step 1 - "Welcome to The Trade Rat. Here's how it works." Three sentences maximum explaining the service. Modular video placeholder infrastructure built in for future explainer video - hidden until admin activates.

Step 2 - "Set up your league profiles. Add as many leagues as you desire." Add League button and Skip for now option.

Step 3 - "Your free evaluation is ready. Submit your first trade." Direct gold Claim Your Free Analysis button.

MULTIPLE LEAGUE PROFILES:

Users can create and save unlimited league profiles. Each profile contains league name, league platform, scoring format, number of teams, league type, their roster for that league, trade deadline for that league. When submitting a trade a dropdown appears asking which league this submission is for. Selected profile pre-populates all fields automatically. Option to create new league profile directly within submission flow without leaving. Dashboard shows all saved league profiles as cards with Edit and Delete options. Add New League button always visible.

SUBMISSION FLOW:

Step 1 - User selects Evaluate a Trade or Find Me a Trade.

Step 2a - If Evaluate a Trade: User selects which league from saved profiles or creates new. User selects received this offer or proposed this offer. If received show three service options with prices - Accept/Decline only, Counter Offer only, Decline plus Counter Offer bundle. If proposed show Accept/Decline only - Counter Offer option never appears never shown. User selects Standard Rate or Rat Rate. If Rat Rate is at capacity show waitlist options with full explanation. If Standard Rate is at capacity show waitlist options with full explanation.

Step 2b - If Find Me a Trade: User selects which league from saved profiles or creates new. User selects Standard Rate or Rat Rate. If at capacity show waitlist options with full explanation.

Auto save draft every 30 seconds to database. Duplicate submission detection - if identical submission detected alert user before charging again. Double submission prevention - disable submit button immediately after first click re-enable only if error occurs. Save and finish later button visible on all submission pages. Email me a reminder button on upload pages - opens prompt asking from computer or from phone - sends email immediately with direct draft link taking user straight back to their exact saved draft on any device plus device specific screenshot instructions. "Preferred device" language used not "better device."

Claim button on expert side locked during 2 minute cancellation window. Unlocks automatically after 2 minutes.

At submission time system calculates whether trade deadline entered in league profile allows enough time for guaranteed delivery. If not enough time - show user warning before payment: "Your trade deadline is in X hours. Our guaranteed response time is [X hours based on service]. We will do our best to respond before your deadline but cannot guarantee it for submissions this close to the deadline. Do you want to proceed?" If user proceeds after seeing warning - no full refund obligation if deadline passes before delivery. If user submitted with adequate time and we missed guarantee - full refund or credit option automatically triggered.

REQUIRED FIELDS ALL SUBMISSIONS:

League platform pre-filled from league profile - ESPN, Sleeper, Yahoo, Fantrax, other. Scoring format pre-filled - PPR, Half PPR, Standard. Number of teams pre-filled. Current roster - optional but show persistent gold highlighted suggestion box reading "Adding your roster helps your expert give deeper analysis. Highly recommended." Not a hard block not dismissible.

TRADE DETAILS FIELDS:

League Type dropdown optional - Redraft, Keeper, Dynasty, Other.

You would RECEIVE - large text area required for all evaluation submissions. Placeholder reading "Enter players you would receive. Example: Tee Higgins, 2nd round pick."

You would GIVE UP - large text area required for all evaluation submissions. Placeholder reading "Enter players you would give up. Example: Davante Adams, CeeDee Lamb."

Draft Picks Involved toggle - if yes opens two fields: Picks you would RECEIVE text area and Picks you would GIVE UP text area. Both optional.

FAB Involved toggle with info icon - tooltip reading "FAB (Free Agent Budget) — also known as FAAB. If your trade involves FAB dollars being exchanged, toggle this on." If yes opens two fields: FAB you would RECEIVE with dollar sign field and FAB you would GIVE UP with dollar sign field. Both optional.

OPTIONAL FIELDS ALL SUBMISSIONS:

Trade deadline date - saves to league profile when entered, triggers urgency flag, moves request to top of expert queue automatically.

Additional context open text box - placeholder reading "Share anything that helps our expert understand your situation. For example: league tendencies, league stakes, trade history, roster settings, playoff position, Superflex league, IDP league, or anything else you think is relevant."

COUNTER OFFER REQUIRED FIELD:

Opponent roster mandatory upload for Counter Offer only and Decline plus Counter Offer bundle only. Accepted formats JPG PNG HEIC PDF CSV Excel. Stored securely in Supabase storage.

TRADE FINDER UPLOAD EXPERIENCE:

Instruction line above grid reading "Click on your roster to highlight it." Second instruction reading "Upload a screenshot or export of each team's roster in your league." Screenshot tips showing: Windows - press Windows + Shift + S. Mac - press Command + Shift + 4. iPhone - press side button and volume up together. Android - press power button and volume down together. Third instruction reading "Label each roster however you like — team names, manager names, or simple labels like Team A, Team B, Team C. Labels are optional."

Bulk upload - user selects all files at once. After upload grid appears showing thumbnails two per row on mobile four per row on desktop. Each thumbnail has optional text label field below. User clicks their own roster thumbnail to highlight it gold - hard block cannot submit without identifying own roster. If more files uploaded than number of teams field - soft warning about possible duplicate. If fewer files uploaded than number of teams - soft warning about missing rosters not a hard block.

Progress indicator based on number of teams field showing "3 of 12 rosters uploaded" updating in real time. Turns gold with checkmark when all uploaded showing "All 12 rosters uploaded."

Email me a reminder button - from computer or from phone option - sends email with direct draft link and device specific instructions. Save and finish later button visible.

FILE UPLOAD FORMATS: JPG PNG HEIC PDF CSV Excel. All stored securely in Supabase storage.

LEAGUE PROFILE SYSTEM:

Saved after first submission. Multiple profiles per user supported. Pre-populated on every subsequent submission from selected profile. Roster snapshot updated each submission. Expert sees current and previous roster side by side. Expert familiarity flag shown when same expert has helped same user before with full previous submission history visible. Trade deadline saved per league profile.

DEDICATED USER SUBMISSION PAGE:

Each submission gets unique private URL. Accessible only by that user and their assigned expert.

User sees: Clean timeline view showing submitted timestamp, expert claimed timestamp, response in progress with expected delivery time, response delivered timestamp. Full submission details. Uploaded roster files viewable. Message thread for expert more info requests and user replies. Expert response when delivered showing written response and or audio player. Rating prompt after response received. Cancel button with countdown during 2 minute window reading "Changed your mind? Cancel within [time remaining] for a full refund." After 2 minutes cancel button disappears. Pass off notification and three options if applicable. Full history of all past submissions.

Expert sees when entering user dedicated page: Prominent color coded countdown clock at top of page showing time remaining until guaranteed delivery deadline. Green plenty of time. Yellow under 2 hours. Red under 30 minutes. Flashing red past deadline. Full submission details - service type, received or proposed, trade details. All uploaded rosters and files scrollable with pinch to zoom. Side by side roster comparison mode on mobile for Trade Finder. League profile summary. Previous submissions and responses from all experts. Expert familiarity flag if this expert helped this user before. Full TipTap rich text editor with floating toolbar above keyboard on mobile showing B I U quote bullet numbered list undo redo icons all minimum 44 pixels. Audio recording button works from phone and PC using device microphone. No minimum audio length. No maximum audio length. Audio playback before sending with re-record option. Response can be written only audio only or both - no written portion required if audio provided. Preview mode showing exactly how response looks on user device. Send button. 5 minute recall window after sending - response delivers immediately to user - toast notification appears at bottom of expert screen for 30 seconds reading "Response sent. Recall within 5 minutes if needed" - if recalled user sees message "Your expert is making a final update to your response. You'll receive it shortly." - deadline clock stops the moment original send happens so no late delivery penalty during recall. Request more info button - pauses clock, sends canned message to user, restarts clock when user replies. Flag button - one click flags to admin without requiring response. Pass off button with reason dropdown showing personal emergency, insufficient expertise, conflict of interest, technical issue with files, other - plus optional note to next expert. Claim button large and obvious - locked during 2 minute cancellation window unlocks automatically after.

AUDIO RESPONSE SYSTEM:

Expert records audio from phone or PC microphone. No minimum or maximum length. Playback before sending. Re-record option. User hears audio through custom gold branded waveform player with scrub bar download option and play button. All audio automatically transcribed using OpenAI Whisper at approximately $0.006 per minute. Transcription stored internally in database not shown to user by default. Used for admin quality control keyword search and dispute resolution.

EXPERT QUEUE SYSTEM:

Standard Rate open claim queue visible to all standard experts showing time in queue, urgency flag if trade deadline approaching, service type, color coding - green new, yellow waiting over 4 hours, red approaching deadline. Sort options by urgency by time waiting by service type. First expert to claim gets request - disappears from all other queues. Expert availability toggle built in for future use. Rat Rate auto assigns to the Rat exclusively - never goes to open queue.

Rat Rate waitlist activates at 9th pending Rat Rate request. Standard Rate waitlist activates when combined active claimed requests across all standard experts reaches 8 OR all standard experts toggle unavailable - whichever comes first. Waitlist holds spot for 2 hours after notification. Admin sees all queue counts and waitlist counts at all times.

If Rat Rate is at capacity show user: "The Rat is currently at capacity. Would you like to join the Rat Rate waitlist and submit when notified, or submit now with a standard expert at Standard Rate pricing?" Two buttons - Join Rat Rate Waitlist and Submit with Standard Expert showing adjusted price. Waitlist explanation shown - "Joining the waitlist is free. You will not be charged until you submit your request after your spot opens. Your spot is held for 2 hours once notified."

If Standard Rate is at capacity show user: "Our standard experts are currently at capacity. Join the waitlist and we'll notify you as soon as a spot opens. Standard Rate spots open frequently — most waitlist members hear back within a few hours. Your spot is held for 2 hours once notified. Joining the waitlist is free — you will not be charged until you submit your request after your spot opens."

Admin can manually assign any request to any specific expert from Submissions tab. Admin assignment takes priority over claim queue - assigned request goes directly to that expert and disappears from open queue.

PASS OFF SYSTEM:

Standard Rate experts only - the Rat cannot pass off any request. Pass off button on expert submission page. Reason dropdown - personal emergency, insufficient expertise, conflict of interest, technical issue with files, other. Optional note to next expert. Request returns to open claim queue immediately. Original expert released from deadline responsibility. Admin notified of pass off with reason. New expert inherits original deadline - no fresh clock - urgency flag shows original deadline countdown. Request can only be passed off once - second expert escalates to admin if unable to complete. User moved to front of queue after pass off.

Canned pass off message to user: "Your expert has passed your request to another available analyst. Your original response guarantee remains in effect — we are still committed to delivering your analysis within our promised timeframe. We apologize for any inconvenience."

User given three options after pass off: Wait for next available expert with reset guarantee. Upgrade to Rat Rate for price difference if Rat is available and user was not already Rat Rate. Full refund and cancel request.

RAT RATE REASSIGNMENT PROTOCOL:

Admin alerted immediately when Rat Rate request goes 12 hours without response. Never silent reassignment. User notified immediately with three options - wait for Rat with bonus compensation of 1 free future service added to account, accept standard expert response with partial refund of price difference between Rat Rate and Standard Rate, full refund and cancel. All through pre-written canned message: "We sincerely apologize — the Trade Rat is unavailable to respond to your request within our promised window. We value your trust and have added a bonus to your account. You may wait for the Rat, accept a response from one of our expert analysts, or receive a full refund. We are sorry for the inconvenience and appreciate your patience."

LATE DELIVERY POLICY:

If user submitted with adequate time before trade deadline and we miss guaranteed window - automatically send late delivery canned message and offer user two options: Option 1 full refund to original payment method - submission dissolves entirely - expert stops working - user never receives advice for that submission. Option 2 credit equivalent to purchase added to account - submission also dissolves - expert stops working - user never receives advice for that submission - credit used for future fresh submission. User selects preference. Admin notified. Refund or credit processed automatically.

If user submitted too close to trade deadline after seeing and acknowledging the warning - no full refund obligation if deadline passes. Deliver as fast as possible.

Late delivery canned messages updated to include both refund and credit options clearly.

Accept/Decline late canned message: "We apologize for the delay on your trade evaluation. Your response is taking longer than our promised window. We have automatically added compensation to your account. Please choose: full refund to your original payment method, or a free evaluation credit added to your account for future use. Thank you for your patience."

Counter Offer late canned message: "We apologize for the delay on your counter offer request. Your response is taking longer than our guaranteed window. Please choose: full refund to your original payment method, or a free Counter Offer credit added to your account for future use. Thank you for your patience."

Full League Finder late canned message: "We apologize for the delay on your Trade Finder request. This has exceeded our 48 hour guarantee. Please choose: full refund to your original payment method, or a free Trade Finder credit added to your account for future use. We sincerely apologize for the inconvenience."

RESPONSE TIMES:

Accept/Decline - show users "Most responses in under 2 hours, guaranteed within 24 hours." Internal queue release at 12 hours. Counter Offer - show users "Most responses in under 4 hours, guaranteed within 24 hours." Internal queue release at 18 hours. Full League Finder - show users "Most responses in under 8 hours, guaranteed within 48 hours." Internal queue release at 36 hours. Send expert urgent notification via email and SMS 30 minutes before their deadline. Trade deadline field triggers urgency flag and moves to top of queue automatically.

CANNED APOLOGIES all pre-written automated and modular:

Rat Rate reassignment - detailed above.
Late Accept/Decline with refund or credit option - detailed above.
Late Counter Offer with refund or credit option - detailed above.
Late Full League Finder with refund or credit option - detailed above.
Expert requested more info: "Your expert has reviewed your submission and needs a bit more information to give you the best possible advice. Please see their question below and respond at your earliest convenience. Your clock has been paused until we hear back from you."
Pass off notification - detailed above.
Rat Rate 12 hour admin alert - internal notification only.

EXPERT DASHBOARD full mobile and desktop capability:

Mobile experience: Notification arrives on phone. One tap to open request. One tap to claim after 2 minute window. Scrollable roster view with pinch to zoom. Trade details clearly laid out. League profile summary. Previous submission history collapsible. Full TipTap rich text editor with floating toolbar above mobile keyboard. Audio recording using phone microphone. Bold italic bullet formatting with large 44 pixel tap icons. Double tap word to select then format. Auto-correct and spell check via native phone keyboard. Response saves every 30 seconds. Preview mode. Send button with 5 minute recall toast. Request more info. Flag. Pass off. Side by side roster comparison for Trade Finder.

Desktop experience: All same features. Larger screen shows multiple rosters simultaneously. Full keyboard. Better microphone access.

Expert profiles: Brief bio section on each expert account - modular placeholder built in, easy to populate from admin. Hidden until admin adds content. Users see experts as the Rat, the Monkey, and the Badger.

Expert written style guide: Accessible from expert dashboard. Admin editable from admin dashboard. Guidance on how to structure great responses for each service type. Not enforced rules - helpful framework.

Expert response templates: Pre-written response frameworks for each service type accessible from expert dashboard. Expert customizes before sending. Admin can add edit and manage templates from admin dashboard.

Keyboard shortcuts for experts: C to claim. R to open response editor. P to preview. S to send. F to flag.

ADMIN DASHBOARD tabs:

Overview tab: All pending claimed and completed requests at a glance. Real time queue counts. Rat Rate queue and waitlist count. Standard Rate queue and waitlist count. Seasonal on/off switch - when off closes all submissions and shows users "The Rat is in the offseason. Submissions reopen in [date]." Admin sets return date.

Submissions tab: Full details of every submission. Status - submitted, claimed, in progress, passed off, completed, cancelled. Filter by service type expert status date. Contact user button on every submission. Admin can manually assign any submission to any expert from this tab. Full audit log visible for every submission showing every action with timestamp.

Experts tab: All expert accounts - the Rat, the Monkey, the Badger. Current queue for each. Average response times. Thumbs up and thumbs down ratings with optional written feedback. Expert availability toggle status. Add or remove expert accounts. Expert profile bio management. Expert style guide management. Expert response template management.

Users tab: All user accounts. Display name and email. Submission history. Bundle and single purchase balances and expiration dates. Free evaluation status. League profiles. Contact user button - email or SMS. Manual compensation tool - add free services to any account instantly.

Payments tab: All transactions. Bundle and single purchases. Refunds issued. Chargeback alerts from Stripe. Payment error log.

Analytics tab: Daily submissions by service type. Revenue by service type. Average response time by expert and service type. Busiest days of week. Bundle and single purchase trends. Rating trends by expert.

Flags tab: All flagged submissions. Reason flagged. Admin action options.

Support tab: All incoming contact form messages. Status - New, In Progress, Resolved. Reply field directly from dashboard. Linked to user account showing their history. Filter by status and date. Rate limiting enforced - 3 contact form submissions per 24 hours per email address and 6 per 7 days both enforced simultaneously.

Alerts tab: Rat Rate request 12 hours without response - immediate alert. Payment processing error - immediate alert with user details. Trade deadlines approaching on pending requests. Stripe chargeback notifications. Bundle and single purchase expiration warnings 30 days and 2 weeks before. Free evaluation expiration reminders triggered at day 20 and day 28.

Testimonials tab: Add edit toggle and reorder testimonials by drag and drop. Fields - quote, first name or username only, league type, optional service used. Testimonials appear on landing page only when at least one is active. Hidden completely when empty.

Stats tab: Add edit toggle and reorder Rat stats by drag and drop. Fields - stat number and stat label. Maximum 4 stats displayed on landing page. Hidden completely when empty.

Landing Page Manager tab: All landing page sections listed with on/off toggle switches. Drag and drop reorder. Edit all text content within each section without touching code. Preview before publishing.

Promotions tab: Infrastructure built for future promo code system. Admin can create promo codes with discount type percentage or fixed amount, usage limit, expiration date. Codes not yet active - infrastructure only.

Referral tab: Infrastructure built for future referral program. Not yet active.

Commissioner tab: Infrastructure built for future league commissioner bulk purchase feature. Not yet active.

Onboarding Video tab: Infrastructure built for future explainer video. Admin can upload or link video when ready. Hidden from landing page until activated.

Export functionality: Admin can export to CSV or Excel from Submissions tab - filter by date range service type expert status. From Payments tab - all transactions by date range. From Analytics tab - all rating and response time data. Standard business reporting tool.

Search functionality: Admin can search all submissions by user email, expert name, service type, date range, keyword from Whisper audio transcriptions. Search bar prominent in Submissions tab.

Stripe test mode toggle: Built into admin dashboard. Switches between Stripe test mode and live mode. Test mode uses Stripe test card numbers to simulate all payment scenarios - successful payment, failed payment, refund, chargeback, bundle purchase - without real money. Toggle clearly labeled and color coded to prevent accidentally leaving in test mode.

EXPERT ACCOUNTS:

The Rat - premium tier - all Rat Rate requests route exclusively. Cannot pass off. Full dashboard access.
The Monkey - standard tier - Standard Rate claim queue access. Can pass off once per request.
The Badger - standard tier - Standard Rate claim queue access. Can pass off once per request.
All three have full mobile and desktop expert dashboard access. Phone 2FA required on all expert accounts.

USER FEATURES:

Submission tracker page: Status of every request in timeline format like FedEx tracking. Direct link to each submission page. Active submissions shown with color coded status.

Notification preferences page: Email only. SMS only via Twilio. Both email and SMS.

User settings page: Display name edit. Email edit. Password change. Payment method management. Notification preferences. Account deletion request - initiates 30 day grace period with confirmation email - user can cancel deletion during grace period - after 30 days account and all data permanently deleted automatically - admin notified when deletion completes. No admin approval required for deletion.

Forgot password: Link on login page - enter email - receive Supabase auth password reset link.

Returning user dashboard home screen: Active submissions with color coded status. Credit and bundle balances with expiration dates. Saved league profiles with quick access. Submit New Trade button prominent. Recent notifications. Empty state for new users reads "The trap is ready. Submit your first trade and let the Rat go to work." with gold Submit New Trade button.

USER NOTIFICATIONS email and SMS via Twilio:

Submission confirmed with expected response timeframe based on service type. Expert claimed your request. Expert requested more info with canned message. Response ready - "Your trade advice is ready. Log in to view it now." Late delivery with refund or credit options. Rat Rate reassignment with three options. Pass off notification with three options. Waitlist spot available - 2 hour window to submit. Payment receipt after every purchase itemized. Bundle and single purchase expiration warning 30 days before. Bundle and single purchase expiration warning 2 weeks before. Free evaluation activated on opening day of NFL season or signup date whichever is later. Free evaluation day 20 reminder. Free evaluation day 28 final reminder. Email roster reminder with direct draft link and device specific instructions. Account deletion grace period confirmation with cancel option. Account deletion completed confirmation.

Push notification infrastructure: Build modular notification system architecture to support future native app push notifications. All notification events already defined - structure so push notification channel can be added later without rebuilding notification system.

RATING SYSTEM:

Thumbs up or thumbs down after receiving advice. Optional written feedback text box reading "Want to tell us more? (optional)" - disappears after 48 hours if not filled. All ratings stored by expert in database. Visible in admin Experts tab with written feedback. No automatic threshold - admin reviews manually.

CONTACT US:

Button visible in navigation bar, footer, and user dashboard. Contact form fields - name pre-filled if logged in, email pre-filled if logged in, message open text area with placeholder "Tell us what's on your mind. We typically respond within 24 hours." Rate limiting - 3 submissions per 24 hours per email address and 6 per 7 days both enforced simultaneously. Submit creates support ticket in Support tab and sends to admin email. Logged in user submissions linked to their account automatically.

Admin can contact any user directly from user record in Users tab, any submission page, or Support tab reply field. Options - Send Email from branded Trade Rat address or Send SMS via Twilio. All admin messages logged with timestamp in user profile.

FAQ PAGE:

Accessible from footer and Contact Us page. Modular - admin can add edit and reorder FAQ items from admin dashboard. Questions covering: How long does it take to get a response. What if I disagree with the advice. Can I get a refund. What is the Rat Rate. How does the Trade Finder work. What file formats can I upload. How do bundles work. What happens if my expert is late. What is FAB. What is Superflex. What is IDP. What is a dynasty league. What is a keeper league. What is PPR. What happens if the Rat is unavailable.

USER EXPERIENCE DETAILS:

Progress indicators on all loading and processing states. Never blank screen.

Confirmation screens after every important action - submitting buying cancelling deleting. Never leave users wondering if action went through.

Plain English error messages - no technical codes. Example: "Something went wrong on our end. Your submission was not charged. Please try again or contact us."

Tooltips on all fantasy terms - PPR FAAB Dynasty Keeper Superflex IDP - info icon with plain English explanation on hover or tap.

Loading states with brand voice - "The Rat is in the film room. Your analysis is being prepared."

Smart defaults - pre-fill all fields from user's last submission for same league profile. Only change what is different.

Breadcrumbs on every page. Example: Dashboard, Submissions, Submit New Trade, Trade Details.

Mobile first design - 390px baseline - every component tested at 390px before considered complete. Bottom tab navigation on mobile. Native phone pickers for dropdowns. Full width buttons on mobile. Single column forms on mobile. Pinch to zoom on all uploaded images.

ACCOUNT DELETION:

User requests deletion from settings page. Immediate confirmation email sent. Account enters 30 day grace period. User can cancel deletion during grace period via link in confirmation email. After 30 days account and all associated data permanently deleted automatically. Admin notified when deletion completes. No admin approval required.

TWO FACTOR AUTHENTICATION:

Phone SMS 2FA for admin and expert accounts via Twilio. Required on all admin and expert accounts. Prompted on first login. Verification code sent via SMS on each login. Cost approximately $0.01 per verification text.

LEGAL:

Terms and Conditions page with 15 sections: Service description. Pricing and payments - all purchases expire one year from purchase date. Free first evaluation rules - one per person email verification payment method required. Response time guarantee - exact timeframes by service. Late delivery policy - user chooses full refund or credit equivalent both resulting in submission dissolution. Rat Rate guarantee - three options if reassigned. Cancellation policy - 2 minute window. Refund policy - specific circumstances only. Entertainment disclaimer - for fantasy football entertainment purposes only. User responsibilities. Prohibited use - multiple accounts spam abuse. Account termination. Privacy - data stored securely never sold viewed only by experts for service delivery. Disputes. Changes to terms.

Platform disclaimer: "The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform."

Terms checkbox mandatory on signup. Entertainment disclaimer on every advice response automatically. Last updated date on terms page. By submitting rating and written feedback users consent to anonymized feedback being used as testimonial - covered in terms.

ABUSE PREVENTION:

Email verification required before free evaluation unlocks. Valid payment method on file required before free evaluation unlocks. One free evaluation per email enforced at database level. Creating multiple accounts results in termination covered in terms. Duplicate submission detection - alert user before charging again. Double submission prevention - submit button disabled after first click.

ERROR PROTECTION:

Payment processed but service not granted - log failure immediately, alert admin with user email and payment amount, add service manually via admin compensation tool. Auto save all form data as draft every 30 seconds. Duplicate submission detection. Double submission prevention. Full timestamp audit log on every single action in entire system.

DATABASE:

Generate all necessary Supabase migration SQL files for every new table column trigger and policy. Row level security on all tables. Triggers for - free evaluation flag on signup, response time tracking, late delivery detection and automatic compensation offer, waitlist management, bundle and single purchase expiration tracking, audio transcription storage, audit log entries on every action, account deletion grace period and auto-deletion after 30 days, 2FA enforcement on admin and expert accounts.

STRIPE INTEGRATION:

Full payment processing for all services and bundles. Automatic itemized payment receipt emailed after every purchase. Chargeback alerts in admin Alerts tab. Automatic refund processing for - late delivery user choice, pass off cancellation, Rat Rate reassignment cancellation, 2 minute cancellation window. Payment error logging and immediate admin alert. Stripe test mode toggle in admin dashboard switches between test and live mode.

TWILIO SMS:

Optional phone number field on signup. Required for admin and expert accounts for 2FA. Notification preferences page. SMS for all key notification events. 2FA verification codes for admin and expert logins. Cost approximately $1 per month phone number plus $0.01 per text and $0.01 per 2FA verification.

OPENAI WHISPER:

All expert audio responses automatically transcribed. Stored internally in database. Not shown to user by default. Used for admin quality control keyword search and dispute resolution. Cost approximately $0.006 per minute.

BRAND:

Every page and component matches brand exactly. Background #0C0A07. Gold #C9A84C. Cream text #F2EDE4. Muted text #6b6457. Borders #2a261e. Playfair Display all headlines and display text. DM Sans all body text. DM Mono all labels buttons and data. Generous white space. No emojis no generic icons no bullet symbols. Premium and sparse. Mobile first 390px baseline. TipTap rich text editor. Custom gold branded audio waveform player.

Generate all database migration SQL files. Update all frontend components. Ensure every single feature is modular toggleable and editable from admin dashboard without code changes.