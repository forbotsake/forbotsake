# Publishing Automation Playbook

Platform-specific posting flows for /forbotsake-publish POST mode.
This file is read at runtime by the skill. Update it when platform UIs change.

## General Principles

1. **Never hardcode CSS selectors.** Platform UIs change. Use `read_page` and `find` to locate elements by text content and role.
2. **Always fall back to COPY mode on any failure.** Never retry aggressively. Never leave the user stuck.
3. **Use `computer` tool for all content filling.** Rich text editors and compose areas on social platforms respond best to `computer` (click + type). The `form_input` tool may work for simple form fields but `computer` is more reliable across platforms.
4. **Take screenshots before and after posting** using `screencapture` (Mac native). Never use Chrome screenshot tools.
5. **Wait 3 seconds after clicking Post** before verifying. Platforms need time to process.

## Tier 1: Full POST Mode

### X/Twitter

**Compose URL:** `https://x.com/compose/post`

**Auth check:** Navigate to `x.com/home`. Look for the user's handle/avatar in the page text. If you see a login form instead of the feed, the user is not logged in.

**Single tweet flow:**
1. Navigate to compose URL
2. Click the compose textarea (look for text input area)
3. Type the tweet text using `computer` tool
4. Verify character count is under 280

**Thread flow:**
1. Navigate to compose URL
2. Click the compose textarea
3. Type tweet 1
4. Look for a "+" button or "Add another tweet" element near the bottom of the compose area
5. Click it. A new textarea appears below.
6. Type tweet 2
7. Repeat steps 4-6 for all remaining tweets
8. The "Post all" or "Post" button should appear at the bottom right

**Schedule flow:**
1. After filling content, look for a calendar or clock icon near the Post button
2. Click it to open the date/time picker
3. Set the date and time as specified by the user
4. Click "Schedule" or "Confirm"

**Post button:** Look for a button with text "Post" or "Post all" (for threads) at the bottom right of the compose area.

**Success indicator:** After clicking Post, the URL changes to `x.com/{handle}/status/{id}`. The page shows the published tweet.

**Known quirks:**
- X sometimes shows a confirmation modal for threads. Click "Post" or confirm.
- If the character counter turns red, a tweet is over 280 characters. This should be caught in Phase 3.
- Link tweets may get less reach. The content strategy suggests putting links in replies.
- X may show a "rate limit" or "try again later" message. If so, stop and fall back to COPY.

### LinkedIn

**Feed URL:** `https://linkedin.com/feed`

**Auth check:** Navigate to the feed. Look for the user's name and "Start a post" element. If you see a login form, the user is not logged in.

**Post flow:**
1. Navigate to feed URL
2. Find the "Start a post" button or text input area at the top of the feed
3. Click it to open the compose modal
4. Wait for the modal to fully load (a text editor area should appear)
5. Click the text editor area
6. Type the post content using `computer` tool
7. Add hashtags at the end

**Schedule flow:**
1. After filling content, look for a clock icon near the Post button in the modal
2. Click it to open the scheduling options
3. Set date and time
4. Confirm

**Post button:** Look for a button with text "Post" in the compose modal.

**Success indicator:** The modal closes and the post appears in the feed. The URL may not change immediately.

**Known quirks:**
- LinkedIn sometimes shows a "who can see this" selector. Default is usually fine.
- The compose modal uses a rich text editor. Use `computer` tool for typing.
- LinkedIn may truncate long posts. Content should be under 3000 characters (checked in Phase 3).

## Tier 2: COPY + Deep Link

For these platforms, format the content (Phase 2) and open the compose page in Chrome. The user pastes the content manually.

### Blog Platforms

**Ghost:** Open `{admin-url}/ghost/#/editor/post` in a new tab. User pastes title and content.
**WordPress:** Open `{admin-url}/wp-admin/post-new.php` in a new tab.
**Dev.to:** Open `https://dev.to/new` in a new tab.
**Medium:** Open `https://medium.com/new-story` in a new tab.
**Substack:** Open `https://{publication}.substack.com/publish/post/` in a new tab. Ask the user for their publication name on first use.

For Ghost, WordPress, and Substack, the admin/publication URL is user-specific. Ask the user on first use: "What's your blog admin URL?" (or "What's your Substack publication name?"). Use that for this session.

### Reddit

Open `https://www.reddit.com/r/{subreddit}/submit` in a new tab. Ask the user which subreddit if not specified in the content metadata.

### Hacker News

Open `https://news.ycombinator.com/submit` in a new tab.

### Product Hunt

Open `https://www.producthunt.com/posts/new` in a new tab.

## Tier 3: COPY Only

### Email (ESP-dependent)

Format the content only. ESPs (ConvertKit, Mailchimp, Beehiiv, etc.) have very different UIs and often require complex multi-step flows. COPY mode is the most reliable approach.

### GitHub

Use `gh pr create` via Bash. No browser needed.

## Failure Modes and Recovery

### Compose page not found
**What:** Navigation completed but the compose UI elements are not on the page.
**Why:** Platform may have changed its URL structure or the user may not have the right permissions.
**Fix:** Fall back to COPY mode. Tell the user the compose URL that was tried.

### Login wall
**What:** Platform shows a login form instead of the compose UI.
**Why:** User is not logged into the platform in Chrome, or their session expired.
**Fix:** Fall back to COPY mode. Tell the user: "You're not logged into {platform} in Chrome. Log in and try again, or paste the formatted content manually."

### Rate limit modal
**What:** Platform shows a "try again later" or "rate limit" message.
**Why:** Too many posts in a short time, or automated behavior detected.
**Fix:** Stop immediately. Fall back to COPY for remaining content. Tell the user: "Hit a rate limit on {platform}. Wait a few minutes before posting more."

### Element not found (button, textarea, etc.)
**What:** Could not find the expected UI element to click or type into.
**Why:** Platform UI may have changed, or the page didn't fully load.
**Fix:** Fall back to COPY mode. Log the specific element that was missing for future troubleshooting.

### Content mismatch after posting
**What:** The published content doesn't match the source content.
**Why:** Special characters, emoji, or formatting may have been mangled during typing.
**Fix:** Warn the user to verify the published post. Log the mismatch.

### Partial thread publish
**What:** Thread posting failed after some tweets were already posted.
**Why:** Could not find the "+" button, or an error occurred mid-thread.
**Fix:** Stop immediately. Capture what was posted. Log as PARTIAL. Deliver remaining tweets as copy-paste.

## Anti-Bot Safety

- Use the user's actual Chrome with their real session. This looks like normal user behavior.
- Computer Use interactions happen at natural human speed with built-in delays.
- Post sequentially, never in parallel.
- Maximum 5 posts to the same platform per session.
- If any CAPTCHA, verification, or anti-automation challenge appears: fall back to COPY mode immediately. Do not attempt to solve CAPTCHAs.
