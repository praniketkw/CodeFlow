# CodeFlow

**AI-Powered Microservice Dependency Manager**

Ever changed one service and watched 50 others break in production? CodeFlow catches breaking changes before they happen, figures out what needs fixing, and creates the PRs for you.

## The Problem

Working with lots of microservices is painful:
- Change one API, break everything downstream
- Spend hours tracking down which services are affected
- Manually fix the same issue across dozens of repos
- Coordinate deployments across multiple teams

I built this because I was tired of seeing production go down from simple API changes.

## What CodeFlow Does

It's pretty straightforward:
1. Watches for API changes in your services
2. Uses AI to understand what actually changed (not just version numbers)
3. Finds every service that depends on the changed API
4. Writes the fix and opens a PR
5. You review and merge when ready

## See It Work

I set up a real example with two services:
- **auth-service** returns user tokens
- **user-service** depends on auth-service to verify users

Then I changed auth-service's response format (moved `userId` to `user.id`). User-service broke immediately.

CodeFlow caught it, wrote the fix, and opened [PR #1](https://github.com/praniketkw/CodeFlow/pull/1) automatically. Check it out to see the full analysis and fix.

## Project Structure

```
CodeFlow/
├── mock-services/          # Two example services to test with
│   ├── auth-service/       # Handles authentication
│   └── user-service/       # Manages users, depends on auth
├── codeflow-analyzer/      # The main tool
│   ├── src/
│   │   ├── analyzer.js           # Detects changes with AI
│   │   ├── github-integration.js # Creates PRs
│   │   └── auto-fix-demo.js      # Runs the full workflow
│   └── GITHUB_SETUP.md     # How to set up GitHub access
└── docs/                   # Explains how everything works
```

## Getting Started

You'll need:
- Node.js (version 18 or higher)
- An Anthropic API key (for the AI analysis)
- A GitHub token (to create PRs)

### Setup

Clone and install:
```bash
git clone https://github.com/praniketkw/CodeFlow.git
cd CodeFlow/codeflow-analyzer
npm install
```

Add your API keys:
```bash
cp .env.example .env
# Edit .env and add:
# ANTHROPIC_API_KEY=your_key
# GITHUB_TOKEN=your_token
```

Run it:
```bash
npm run test        # Just analyze changes
npm run auto-fix    # Full workflow with PR
```

## How It Works

**Step 1: Detect the change**
```javascript
const analysis = await analyzeCodeChange(oldCode, newCode, 'auth-service');
// AI figures out: "userId moved to user.id"
```

**Step 2: Find affected services**
```javascript
const dependents = findDependentServices('/verify', './mock-services');
// Scans code to find who calls this API
```

**Step 3: Generate the fix**
```javascript
const fix = await generateFix(serviceCode, analysis, 'user-service');
// AI writes: "Change response.data.userId to response.data.user.id"
```

**Step 4: Create the PR**
```javascript
await autoFixWorkflow(serviceName, filePath, oldCode, newCode, analysis, fix);
// Makes a branch, commits the fix, opens a PR
```

## Try It Out

Start both services:
```bash
cd mock-services/auth-service && npm install && npm start &
cd mock-services/user-service && npm install && npm start &
```

Make sure they work:
```bash
curl http://localhost:3002/profile -H "Authorization: token123"
```

Change something in auth-service that breaks the API, then run:
```bash
cd codeflow-analyzer
npm run auto-fix
```

CodeFlow will detect the issue, write a fix, and open a PR in your repo.

## Tech Stack

- Claude AI (Haiku) for understanding code changes
- Octokit for GitHub integration
- Express for the mock services
- Node.js with ES modules

## What's Built

- Two working microservices with real dependencies
- AI that understands code changes semantically
- Automatic scanning to find affected services
- Fix generation that writes actual code
- GitHub integration that creates PRs
- End-to-end workflow from detection to fix

## What's Next

Some ideas I'm thinking about:
- Run automatically on every commit (webhooks)
- Visual dependency graph
- Support for multiple separate repos
- Auto-test the fixes before creating PRs
- Web UI to see everything
- Smart deployment ordering

## More Info

The `docs/` folder has detailed write-ups if you want to understand how everything works:
- How microservices communicate
- Why dependencies break
- How the AI analysis works
- The full breaking change scenario

## Contributing

This started as a learning project, but if you want to add features or fix bugs, go for it. PRs welcome.

## License

MIT - do whatever you want with it.

---

Built to solve a real problem I kept running into with microservices.
