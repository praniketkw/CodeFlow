# CodeFlow Demo Script

Use this script when demonstrating CodeFlow to employers or during interviews.

## Setup (Before Demo)

1. Have the dashboard running: `npm run dashboard`
2. Have your browser open to `http://localhost:3000`
3. Have your terminal ready in the `codeflow-analyzer` directory
4. Have `config/repos.json` configured with your repos

## Demo Flow (10 minutes)

### Part 1: The Problem (2 min)

**Say**: "Let me show you a real problem in microservice architectures."

1. Open `docs/03-service-dependencies.md`
2. Scroll to the breaking change example

**Say**: 
> "Imagine you have 50 microservices. The auth team changes their API response structure - moves `userId` to `user.id`. Suddenly, 30 services break in production. Engineers spend days coordinating fixes across teams."

**Say**: "This is what CodeFlow solves."

---

### Part 2: Single Repo Demo (2 min)

**Say**: "Let me show you the basic functionality first."

```bash
npm run test
```

**Point out**:
- ✅ AI analyzes the code change semantically
- ✅ Detects it's a breaking change
- ✅ Finds dependent services
- ✅ Generates the exact fix needed

**Say**: "This works, but it's limited to one repo. In real companies, services are in separate repos."

---

### Part 3: Cross-Repo Capabilities (3 min)

**Say**: "So I built cross-repo support."

1. Open the dashboard in browser
2. Show the repository list
3. Show the dependency graph

**Say**: "Here's what's different:"

**Point out**:
- Multiple repositories configured
- Dependency graph shows relationships
- Can sync all repos with one click

**In terminal**:
```bash
npm run cross-repo
```

**Walk through the output**:
1. "Syncing repositories" - clones/updates all repos
2. "Analyzing breaking change" - AI understands the change
3. "Building dependency graph" - maps all dependencies
4. "Finding affected repositories" - scans all repos
5. "Generating fixes" - creates fixes for each affected repo

**Say**: "Now instead of fixing one service, it finds and fixes ALL affected services."

---

### Part 4: The Architecture (2 min)

**Say**: "Let me show you how it's architected."

Open `docs/05-cross-repo-architecture.md`

**Point out**:
- Modular design
- Clear separation of concerns
- Scalable foundation

**Say**: 
> "I designed this with enterprise scale in mind. Right now it handles a few repos, but the architecture scales to hundreds. Here's what I'd add for production..."

**Point to the "How to Scale" section**:
- Parallel processing
- Database for persistence
- Job queue for async work
- Webhook integration

**Say**: "I kept it practical - no overengineering - but the foundation is solid."

---

### Part 5: The Value (1 min)

**Say**: "Here's the business impact:"

**Scenario**: 
- 50 microservices
- Breaking change affects 20 services
- Manual fix: 2 hours per service = 40 hours
- With CodeFlow: 10 minutes

**Say**: 
> "That's 40 hours saved per breaking change. In a company shipping fast, that's multiple times per week. Plus, you catch issues before production."

---

## Key Points to Emphasize

### Technical Skills
- ✅ AI integration (Claude API)
- ✅ GitHub API and automation
- ✅ Multi-repo management
- ✅ Dependency graph algorithms
- ✅ REST API design
- ✅ Full-stack (Node.js + Express + vanilla JS)

### Engineering Mindset
- ✅ Solves real problems
- ✅ Scalable architecture
- ✅ Production-ready thinking
- ✅ Clear documentation
- ✅ Practical approach (no overengineering)

### Business Understanding
- ✅ Quantifiable value (time saved)
- ✅ Risk reduction (catch issues early)
- ✅ Team coordination (automated PRs)
- ✅ Scalability (handles growth)

## Questions You Might Get

### "How does it handle complex code changes?"

**Answer**: 
> "Right now it uses string replacement which works for 80% of cases. For production, I'd upgrade to AST manipulation using tools like Babel or TypeScript's compiler API. That would handle complex refactoring like renaming across multiple files, changing function signatures, etc."

### "What about testing the fixes?"

**Answer**: 
> "Great question. The next step would be to run the affected service's test suite before creating the PR. If tests fail, the AI could iterate on the fix. I'd integrate with CI/CD to run tests automatically."

### "How would this work with our existing tools?"

**Answer**: 
> "It's designed to integrate. The core is a library you can import. You could trigger it from your CI/CD pipeline, add it to your PR review process, or run it as a scheduled job. The dashboard is optional - you can use the API directly."

### "What about false positives?"

**Answer**: 
> "That's why it creates PRs instead of auto-merging. Engineers review the fix before merging. The AI explains what changed and why the fix is needed. Over time, you could add confidence scores and auto-merge high-confidence fixes."

### "How would you scale this?"

**Answer**: 
> "Three main things: First, parallel processing - analyze multiple repos simultaneously. Second, add a job queue like Bull for async work. Third, add caching - don't re-analyze unchanged code. I'd also add a database to track history and metrics."

## Closing

**Say**: 
> "I built this to learn and to solve a real problem I've seen in microservice architectures. It's not production-ready yet, but it demonstrates how I think about problems - understanding the business value, designing scalable solutions, and building practical implementations."

**Say**: 
> "I'd love to hear your thoughts on how this could fit into your engineering workflow."

---

## Quick Commands Reference

```bash
# Basic analysis
npm run test

# Cross-repo analysis
npm run cross-repo

# Launch dashboard
npm run dashboard

# Setup new repos
npm run setup

# Single-repo auto-fix
npm run auto-fix
```

## Files to Have Open

1. `README.md` - Overview
2. `CROSS_REPO_GUIDE.md` - Cross-repo docs
3. `docs/05-cross-repo-architecture.md` - Architecture
4. Dashboard in browser
5. Terminal ready to run commands

---

**Remember**: Be confident but humble. Show enthusiasm for the problem space. Ask questions about their architecture.
