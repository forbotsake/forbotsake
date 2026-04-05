# Content Quality Standards

What makes content worth reading, sharing, and acting on.

## What Makes Content "Good"

Good content passes four tests. If it fails any one, it's noise.

### 1. Specific

Bad: "AI is changing how we build software."
Good: "We replaced our 3-hour weekly code review meeting with an AI tool that flags issues in PRs before the reviewer sees them. Review time dropped from 45 minutes to 12 minutes per PR."

Specificity means numbers, names, timelines, and examples. Generalities make readers nod. Specifics make them screenshot and share.

**The test:** Remove all adjectives and adverbs. Does the sentence still convey useful information? If not, the original was padding.

### 2. Evidence-Based

Bad: "Our product is 10x faster."
Good: "We benchmarked against the default approach: 47 seconds to generate docs for a 200-endpoint API. The manual process took our team 3 days."

Every claim needs a receipt. Benchmarks, screenshots, user quotes, before/after comparisons, git commit timestamps. If you can't prove it, don't claim it.

**The test:** Could a skeptical reader verify this claim independently? If not, either add evidence or soften the claim to an opinion.

### 3. Opinionated

Bad: "There are many approaches to API documentation."
Good: "Most API docs are written once and abandoned. If your docs are more than 2 weeks old, they're lying to your users. Auto-generation from code is the only approach that stays honest."

Opinions create engagement. Balanced, hedge-everything content creates nothing. Take a position. Some people will disagree. That's the point. Disagreement drives replies, which drives reach.

**The test:** Would someone reply with "I disagree because..."? If your content is so safe that nobody would push back, it's too safe to share.

### 4. Actionable

Bad: "You should invest in developer experience."
Good: "Add this 3-line pre-commit hook to your repo. It runs the test suite before every commit. Your team will stop breaking main by Friday."

Tell the reader exactly what to do. Not "consider," not "invest in," not "think about." Do this. Here's how. Here's what happens when you do.

**The test:** Can the reader do the thing you described in the next 60 minutes? If it requires "further research" or "depending on your situation," it's not actionable enough.

## The Scroll-Stop Test

Before publishing any piece of content, ask: "Would my ICP stop scrolling to read this?"

The scroll-stop test is about the first 1-2 sentences, not the whole piece. If the hook doesn't grab them, the rest doesn't matter.

### What Stops a Scroll

- **A specific number:** "We cut our deploy time from 45 minutes to 90 seconds"
- **A contrarian claim:** "Unit tests are a waste of time for most startups"
- **A relatable pain:** "Another Monday morning, another Slack message: 'Hey, the API docs are wrong again'"
- **A specific result:** "This one change to our onboarding email increased trial-to-paid by 34%"
- **A pattern break:** Something that doesn't look like everything else in the feed

### What Doesn't Stop a Scroll

- "Excited to announce..."
- "We're thrilled to share..."
- "After months of hard work..."
- "In today's fast-paced world..."
- Anything that starts with "I'm humbled..."
- Any sentence that could be the opening of 10,000 other posts

## Channel-Specific Format Guides

### X/Twitter Thread Structure

A thread is a micro-article. Each tweet is a paragraph.

**Tweet 1 (The Hook)**
- This is the only tweet most people will see
- Lead with the most surprising, specific, or contrarian claim
- No preamble, no context-setting, no "A thread on..."
- Must work as a standalone statement
- Under 280 characters (leave room for engagement — shorter tweets get more replies)

**Tweets 2-5 (The Setup)**
- Build the context that makes the hook make sense
- One idea per tweet
- Use the first sentence of each tweet as a mini-hook (most people scan, not read)
- Short paragraphs. White space matters on mobile.

**Tweets 6-N (The Substance)**
- This is where the real value lives
- Each tweet should teach something or prove something
- Screenshots, code snippets, and data go here
- Number your tweets (1/, 2/, 3/) so readers know where they are

**Final Tweet (The CTA)**
- What should the reader do now?
- Options: follow for more, reply with their experience, check out the product, retweet to share
- Pick ONE CTA, not three
- If you include a link, note that X deprioritizes tweets with links — put the link in a reply to the final tweet, or ask readers to check your bio

**Thread length:** 5-12 tweets is the sweet spot. Under 5 feels thin. Over 12 loses people. If your thread is 20+ tweets, it's a blog post — publish it as one.

**Timing:** Post between 8-10am and 12-2pm in your ICP's primary timezone. Tuesday through Thursday typically outperform Monday and Friday.

### Blog Post Structure

**Headline**
- Specific > clever. "How We Cut API Response Time by 73%" beats "Our Journey to Faster APIs"
- Include a number when possible
- Front-load the benefit

**Introduction (2-3 paragraphs)**
- Start with the problem, not the solution
- Make the reader feel the pain before offering the cure
- End the intro with a clear promise: "Here's exactly how we did it."

**Body (H2 sections)**
- One concept per section
- Short paragraphs (2-4 sentences max)
- Bold key phrases so scanners get the gist
- Include code blocks, screenshots, or diagrams where they add clarity
- Subheadings should work as a standalone outline (someone should get value from just reading the H2s)

**Conclusion**
- Summarize the key takeaway in 1-2 sentences
- End with a specific CTA (try the tool, read the next post, reply with your experience)
- Don't introduce new ideas in the conclusion

**SEO checklist:**
- Title tag under 60 characters
- Meta description under 155 characters, includes the primary keyword
- URL slug is short and keyword-rich
- H2s include secondary keywords naturally (don't stuff)
- Internal links to related content
- At least one external link to a credible source
- Alt text on all images

**Target length:** 800-1500 words for most posts. Long enough to be thorough, short enough to finish. Guides and tutorials can go longer (2000-3000) if every section earns its length.

### Email Sequence Structure

**Welcome Email (sent immediately)**
- Subject: Confirm the value exchange. "Here's your [thing they signed up for]" or "Welcome — here's what to expect"
- Body: Deliver the promised value first. Then set expectations for future emails (frequency, topics). One sentence about who you are and why you're credible on this topic.
- CTA: The simplest possible next step. "Reply and tell me what you're working on" works well.

**Email 2 (day 2-3): The Education Email**
- Subject: Teach something related to the problem your product solves
- Body: Share a specific insight, technique, or framework. Be generous. The best sales tool is genuine helpfulness.
- CTA: Soft — "If you want to try this yourself, [product] makes it easy. Here's a link."

**Email 3 (day 5-7): The Proof Email**
- Subject: Show results from a real user or your own experience
- Body: Case study format — situation, problem, solution, result. Specific numbers.
- CTA: Medium — "See how [product] can do this for you."

**Email 4 (day 10-14): The Decision Email**
- Subject: Address the main objection your ICP has
- Body: Name the objection honestly. Then address it with evidence. This is not a hard sell. It's removing the last barrier.
- CTA: Direct — "Start your trial" or "See pricing."

**General email rules:**
- Subject lines under 50 characters get higher open rates
- Preview text (the first line of the email) matters as much as the subject
- One CTA per email. Not two. Not three. One.
- Write like a person, not a brand. Use "I" not "we" if you're a solo founder.
- Every email must provide value even if the reader never buys. If they feel sold to without getting value, they unsubscribe.

### LinkedIn Post Structure

**Hook Line (first 1-2 lines)**
- This is what shows before "...see more"
- Must be compelling enough to click "see more"
- Pattern: specific result, surprising insight, or bold statement

**Body**
- Short paragraphs (1-2 sentences each)
- Line break between every paragraph
- Tell a story with a specific lesson
- Include numbers and results when possible

**Closer**
- End with a question to drive comments (LinkedIn algorithm rewards comments heavily)
- Or end with a clear takeaway the reader can apply today

**Hashtags:** 3-5 relevant hashtags at the bottom. Not in the body.

**What works on LinkedIn:** Personal stories with business lessons. Specific results with context. Hot takes on industry practices. "I changed X and here's what happened." Behind-the-scenes of building a product.

**What doesn't work:** Corporate speak. Product announcements without a human angle. Anything that reads like a press release. Posts that are just a link with no commentary.

## Content Quality Checklist

Before publishing anything, run through this:

- [ ] **Specific:** Contains at least one concrete number, name, or example
- [ ] **Evidence-based:** Every claim has a receipt (data, screenshot, quote, or personal experience)
- [ ] **Opinionated:** Takes a clear position that someone could disagree with
- [ ] **Actionable:** Reader can do something concrete after reading
- [ ] **Scroll-stop hook:** First 1-2 sentences would stop your ICP from scrolling
- [ ] **ICP-targeted:** Written in your ICP's language, not your internal language
- [ ] **One CTA:** Clear single next action for the reader
- [ ] **Platform-native:** Formatted for the specific channel (not just copy-pasted)
