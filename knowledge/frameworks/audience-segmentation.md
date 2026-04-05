# ICP Definition Framework

How to go from "anyone could use this" to "I know exactly who to talk to."

## The Elimination Method

Most founders start too broad. "Our product is for developers." That's 30 million people. You can't write a tweet that speaks to 30 million people. You can write one that speaks to 500.

The elimination method starts broad and narrows relentlessly until you have one person.

### Step 1: Start with Everyone

Write down every category of person who could theoretically use your product. Be generous. Include stretches.

Example for an API documentation tool:
- Backend developers
- Frontend developers
- DevOps engineers
- Technical writers
- Engineering managers
- Developer advocates
- QA engineers
- Product managers (technical)
- CTOs
- Freelance developers

### Step 2: Eliminate by Pain Intensity

For each category, ask: "How painful is the problem I solve for this person, on a scale of 1-10?"

Not "could they benefit" but "does this problem make their week worse?"

Eliminate everyone below a 7. If nobody scores above 7, your product might be a vitamin (nice to have) instead of a painkiller (must have). That's worth knowing now.

Example (continuing):
- Backend developers: 8 (they write the APIs and maintain the docs)
- Frontend developers: 4 (they consume docs but don't maintain them)
- ~~DevOps engineers: 2 (not their problem)~~
- Technical writers: 9 (this is literally their job)
- Engineering managers: 6 (they feel the pain secondarily)
- ~~Developer advocates: 3 (they write docs differently)~~
- ~~QA engineers: 2 (not their domain)~~
- ~~Product managers: 3 (too far removed)~~
- ~~CTOs: 4 (strategic, not tactical)~~
- ~~Freelance developers: 3 (smaller APIs, less pain)~~

Remaining: Backend developers, Technical writers

### Step 3: Eliminate by Reachability

For the remaining categories, ask: "Can I actually reach this person with the channels available to me?"

- Can I find them on X/Twitter, LinkedIn, Reddit?
- Do they have communities, newsletters, or conferences?
- Can I identify 10 of them by name right now?

Example:
- Backend developers: Reachable via X, Reddit (r/programming, r/webdev), HN, Dev.to. Many active communities. Can name 10.
- Technical writers: Smaller community. Write the Docs conference. Some on X. Harder to reach at scale. Can name 3-4.

Winner: Backend developers (higher reachability)

### Step 4: Narrow Within the Winner

"Backend developers" is still too broad. Narrow further:

- Backend developers at what size company? (Startup, mid-market, enterprise)
- Using what tech stack? (Node, Python, Go, Java, Rust)
- Working on what kind of product? (SaaS, API-first, internal tools)
- At what stage? (Early-stage building v1, growth-stage scaling, mature maintaining)

Each narrowing makes the ICP more specific and the marketing more effective. Go until you feel uncomfortable about how small the group is. That's usually the right size.

Example: "Backend engineers at Series A SaaS startups (20-100 employees) who maintain public-facing REST APIs with 50+ endpoints and whose docs are out of date."

### Step 5: Make It a Person

Give your ICP a name and a life. Not because it's a marketing exercise but because you'll use this person as a filter for every piece of content you create.

Example: "Marcus, senior backend engineer at a 40-person fintech startup. He owns the API layer. He knows the docs are out of date but hasn't had time to fix them since the last fundraise. His PM keeps asking about API docs for the integration partners. He maintains a Swagger spec but it drifts within a week of any endpoint change."

## The 5 Persona Questions

Once you have your person, answer these five questions. If you can't answer all five, you don't know your ICP well enough yet.

### Q1: What's their title?

Not their demographic. Their professional identity. The thing on their LinkedIn.

"Senior Backend Engineer" not "male, 28-35, urban."

Why it matters: The title tells you where to find them, what language they use, and what content formats they prefer. A CTO reads different content than a junior developer.

### Q2: What gets them promoted?

What does this person's manager measure them on? What would make them look good in their next performance review?

Example: "Marcus gets promoted by shipping reliable API integrations on time. API uptime, partner satisfaction, and time-to-integrate are his metrics."

Why it matters: Your product needs to help them with this. If your product makes their life easier but doesn't connect to what gets them promoted, adoption will be slow because it's a nice-to-have, not a career-advancing tool.

### Q3: What's their nightmare?

What scenario keeps them up at night? What's the thing that would make them update their resume?

Example: "A major integration partner discovers a breaking API change that wasn't documented. The partner's CEO emails Marcus's CEO. Marcus spends the weekend fixing it and explaining why the docs were wrong."

Why it matters: Pain sells. If you can name the nightmare and position your product as the thing that prevents it, you have a message that cuts through noise.

### Q4: What are they using RIGHT NOW?

Nobody has a greenfield problem. Your ICP is already solving this problem somehow, even if badly. What's the current solution?

Example: "Marcus maintains a Swagger/OpenAPI spec manually. He has a Notion page with API changelog notes. When partners ask questions, he answers in Slack. Some endpoints have no documentation at all."

Why it matters: You're not competing against "nothing." You're competing against the cobbled-together status quo. Your messaging needs to acknowledge what they're doing now and explain why your product is better than their current approach (not better than having no solution).

### Q5: What's the trigger event?

What happens that makes this person actively search for a solution? They've been living with the problem for months. What changes?

Example: "They close a partnership deal that requires complete API documentation within 30 days. Or a new engineer joins and can't onboard because the docs are wrong. Or they get burned by a production incident caused by undocumented behavior."

Why it matters: Trigger events tell you when to appear. Your content should show up right when the trigger happens. If the trigger is "new partnership deal," you should be present in the searches they'll do immediately after that meeting.

## Validation Methods

Your ICP definition is a hypothesis until validated. Here's how to test it.

### The "Can You Find 10?" Test

Can you find 10 specific, real people who match your ICP definition? Not 10 companies. 10 people with names.

- Search LinkedIn with the title and company size
- Look at who engages with competitor content on X
- Check Reddit and HN for people describing the exact problem
- Ask in relevant Slack/Discord communities

If you can find 10 in under an hour, your ICP is real and reachable. If you can't find 10, the ICP is either too narrow (adjust) or doesn't exist (bigger problem).

### The "Would They Pay?" Test

Would this person (not their company, not their manager, not their budget) advocate for paying for your product? Would they go through a procurement process for this?

If they'd use a free tool but never pay, you might have users but not customers. That matters for your business model even if it doesn't affect the marketing yet.

### The Conversation Test

Can you have a 30-minute conversation with this person about their problem without mentioning your product, and have them say "I need a solution for this"?

If yes, the problem is real. If the conversation naturally leads to your product category, the ICP-problem fit is strong.

### The Language Test

Read 10 posts, comments, or forum threads by people who match your ICP. Write down the exact words they use to describe the problem.

Now compare to the words you use. If there's a gap, your marketing is using your language instead of theirs. Fix it. Use their words, not yours.

## Common Mistakes

### "Everyone is our customer"

No. Everyone is your addressable market. Your customer is one specific person. Start with one. Expand later. If your marketing speaks to everyone, it resonates with no one.

### Demographic-first thinking

"Males 25-34 in tech" is a media buyer's segment, not an ICP. Nobody wakes up thinking "as a male aged 28, I need better API docs." They wake up thinking "the docs are wrong again and the partner demo is Thursday."

### Confusing users with buyers

The person who uses your product and the person who pays for it might be different people. Your ICP should be the person with the problem (the user), but your messaging might need to reach the person with the budget (the buyer). Know who both are.

### Changing ICP every week

Pick one. Commit for at least 4 weeks. If you change your ICP every time a different type of person shows interest, you'll never build enough content depth to resonate with anyone. Breadth comes after depth.
