# CodeFlow

**AI-Powered Cross-Repo Dependency Manager**

Ever changed one service and watched 50 others break in production? CodeFlow catches breaking changes before they happen, figures out what needs fixing, and creates the PRs for you.

```
Breaking Change Detected → Analyze Impact → Generate Fixes → Create PRs
     (AI Analysis)      (Dependency Graph)   (AI Generation)  (Automation)
```

**New**: Now supports multiple repositories with dependency graph visualization and batch PR creation.

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

### Quick Start

See [QUICK_START.md](QUICK_START.md) for a 5-minute setup guide.

**TL;DR:**
```bash
cd codeflow-analyzer
npm install
cp .env.example .env
# Add your API keys to .env
npm run test        # Single-repo demo
npm run cross-repo  # Multi-repo analysis
npm run dashboard   # Launch web UI
```

### Requirements

- Node.js 18+
- Anthropic API key ([Get one](https://console.anthropic.com/))
- GitHub token ([Get one](https://github.com/settings/tokens))

### Documentation

- 📖 [Quick Start Guide](QUICK_START.md) - Get running in 5 minutes
- 🔗 [Cross-Repo Guide](codeflow-analyzer/CROSS_REPO_GUIDE.md) - Multi-repo setup
- 🏗️ [Architecture](docs/05-cross-repo-architecture.md) - How it works
- 🎤 [Demo Script](codeflow-analyzer/DEMO_SCRIPT.md) - For presentations
- 💼 [Employer Pitch](EMPLOYER_PITCH.md) - Talking points
- 📚 [Full Documentation Index](DOCUMENTATION_INDEX.md) - All docs organized

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

### Core Features
- Two working microservices with real dependencies
- AI that understands code changes semantically
- Automatic scanning to find affected services
- Fix generation that writes actual code
- GitHub integration that creates PRs
- End-to-end workflow from detection to fix

### Cross-Repo Capabilities (NEW!)
- **Multi-repository management**: Configure and sync multiple repos
- **Dependency graph builder**: Visualize cross-repo dependencies
- **Batch analysis**: Detect breaking changes across all repos
- **Automated PR creation**: Generate fixes and create PRs in multiple repos
- **Web dashboard**: Monitor repositories and dependencies in real-time
- **Scalable architecture**: Built to handle enterprise-scale deployments

See [CROSS_REPO_GUIDE.md](codeflow-analyzer/CROSS_REPO_GUIDE.md) for details.

## What's Next

Some ideas I'm thinking about:
- Run automatically on every commit (webhooks)
- Auto-test the fixes before creating PRs
- Smart deployment ordering
- AST-based code transformation
- Parallel analysis for faster processing

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

## Quick Reference

| Task | Command | Documentation |
|------|---------|---------------|
| Get started | `npm run test` | [QUICK_START.md](QUICK_START.md) |
| Multi-repo setup | `npm run setup` | [CROSS_REPO_GUIDE.md](codeflow-analyzer/CROSS_REPO_GUIDE.md) |
| Run analysis | `npm run cross-repo` | [CROSS_REPO_GUIDE.md](codeflow-analyzer/CROSS_REPO_GUIDE.md) |
| Launch dashboard | `npm run dashboard` | Open http://localhost:3000 |
| Prepare demo | Read [DEMO_SCRIPT.md](codeflow-analyzer/DEMO_SCRIPT.md) | For presentations |
| Interview prep | Read [EMPLOYER_PITCH.md](EMPLOYER_PITCH.md) | Talking points |

## Project Status

✅ **Working**: Single-repo analysis, multi-repo management, dependency graphs, PR automation, web dashboard
🚧 **Next**: Webhook integration, automated testing, deployment coordination
📚 **Documented**: Comprehensive guides for setup, usage, and architecture

---

Built to solve a real problem I kept running into with microservices.
