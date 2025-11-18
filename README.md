# CodeFlow

**AI-Powered Cross-Repo Dependency Manager**

Ever changed one service and watched 50 others break in production? CodeFlow catches breaking changes before they happen, figures out what needs fixing, and creates the PRs for you.

This project demonstrates how AI can automate the tedious work of managing dependencies across microservices. It uses Claude to understand code semantically, not just pattern matching, and generates actual fixes that work.

## The Problem

In microservice architectures, a single API change can cascade into hours of manual work. When you modify how one service returns data, every service that depends on it needs updating. Engineers spend time tracking down affected services, writing similar fixes across multiple repositories, and coordinating deployments across teams. This gets exponentially worse as organizations scale to dozens or hundreds of services.

I built this because I kept seeing production incidents from simple API changes that could have been caught and fixed automatically.

## What CodeFlow Does

The workflow is straightforward:

1. Detects API changes in your services
2. Uses Claude AI to understand what actually changed semantically, not just version numbers
3. Scans all repositories to find every service that depends on the changed API
4. Generates the specific code fixes needed for each affected service
5. Creates pull requests with detailed explanations
6. You review and merge when ready

The AI understands context. If you move a field from `userId` to `user.id`, it knows that's a breaking change and generates fixes that update all the references correctly.

## Real Example

The project includes two working services that demonstrate the problem:

**auth-service** handles authentication and returns user tokens
**user-service** depends on auth-service to verify users

I changed auth-service's response format, moving `userId` to `user.id`. This broke user-service immediately. CodeFlow detected the change, analyzed the impact, generated the fix, and opened [PR #1](https://github.com/praniketkw/CodeFlow/pull/1) automatically. The PR includes the full AI analysis and the exact code changes needed.

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

[Quick Start Guide](QUICK_START.md) for getting running in 5 minutes

[Cross-Repo Guide](codeflow-analyzer/CROSS_REPO_GUIDE.md) for multi-repo setup and configuration

[Architecture Documentation](docs/05-cross-repo-architecture.md) for technical deep dive

[Demo Script](codeflow-analyzer/DEMO_SCRIPT.md) for presentations and interviews

[Full Documentation Index](DOCUMENTATION_INDEX.md) for all available guides

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

Claude AI (Haiku) for semantic code analysis and fix generation

Octokit for GitHub API integration and PR automation

Express for the web dashboard and REST API

Node.js with ES modules for the core application

simple-git for repository management and operations

## What's Built

### Core Features

Two working microservices demonstrating real dependency relationships

AI-powered semantic code analysis using Claude

Automatic scanning across repositories to find affected services

Fix generation that writes actual, working code

GitHub integration for automated branch creation and PR submission

Complete end-to-end workflow from detection to fix

### Cross-Repo Capabilities

Multi-repository management with configuration-based setup

Dependency graph builder that visualizes relationships across services

Batch analysis that detects breaking changes across all configured repos

Automated PR creation in multiple repositories simultaneously

Web dashboard for real-time monitoring and control

REST API for programmatic access and integration

### Enterprise Scalability

The current implementation handles 2 to 10 repositories efficiently. The architecture is designed to scale to enterprise needs with straightforward enhancements:

**Parallel Processing**: The sequential analysis can be converted to parallel execution using worker pools, reducing analysis time from minutes to seconds even with hundreds of repositories.

**Database Integration**: Adding PostgreSQL would enable persistent storage of analysis history, dependency graphs, and fix patterns. This allows the system to learn from past fixes and improve accuracy over time.

**Job Queue System**: Implementing Redis with Bull or BullMQ enables asynchronous processing, allowing the system to handle analysis requests without blocking and scale horizontally across multiple instances.

**Webhook Integration**: GitHub webhooks can trigger automatic analysis on every commit, catching breaking changes immediately rather than requiring manual runs.

**Caching Layer**: Redis caching of dependency graphs and analysis results eliminates redundant work and speeds up repeated analyses.

**Microservice Architecture**: The current monolithic design can be split into separate services (analyzer, PR creator, dashboard) that scale independently based on load.

These enhancements don't require architectural changes, just additions to the existing modular design. The foundation supports enterprise scale without major refactoring.

See [CROSS_REPO_GUIDE.md](codeflow-analyzer/CROSS_REPO_GUIDE.md) for implementation details.

## Future Enhancements

Webhook integration for automatic analysis on every commit

Automated test execution to validate fixes before creating PRs

Smart deployment ordering based on dependency graphs

AST-based code transformation for complex refactoring scenarios

Confidence scoring using machine learning to enable auto-merge for high-confidence fixes

## Additional Documentation

The docs folder contains detailed explanations:

How microservices communicate and depend on each other

Why dependencies break and the real-world impact

How the AI analysis works under the hood

Complete breaking change scenario with step-by-step walkthrough

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

**Currently Working**: Single-repo analysis, multi-repo management, dependency graphs, PR automation, web dashboard

**In Development**: Webhook integration, automated testing, deployment coordination

**Documentation**: Comprehensive guides covering setup, usage, architecture, and scaling strategies

---

Built to solve a real problem I kept running into with microservices.
