# CodeFlow

**AI-Powered Cross-Repo Dependency Manager**

Automatically detects breaking changes across microservices, generates fixes, and creates PRs. Uses Claude AI to understand code semantically and fix dependencies before they break production.

## The Problem

When you change one microservice API, 50 others break. Engineers spend hours tracking affected services, writing similar fixes across repos, and coordinating deployments. This scales poorly.

## What It Does

1. Detects API changes using AI semantic analysis
2. Scans all repositories to find dependent services  
3. Generates specific code fixes for each affected service
4. Creates pull requests automatically
5. You review and merge

## Quick Start

```bash
cd codeflow-analyzer
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY and GITHUB_TOKEN to .env

npm run test        # Single-repo demo
npm run cross-repo  # Multi-repo analysis  
npm run dashboard   # Web UI at localhost:3000
```

**Requirements**: Node.js 18+, Anthropic API key, GitHub token

## Example

**Before**: `{ "userId": 1, "username": "john" }`
**After**: `{ "user": { "id": 1, "name": "john" } }`

CodeFlow detects this change, finds all services using `userId`, generates fixes changing `response.data.userId` to `response.data.user.id`, and creates PRs.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CodeFlow Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐    ┌─────────────────────┐                 │
│  │   MultiRepoManager  │    │  CrossRepoAnalyzer  │                 │
│  │                     │    │                     │                 │
│  │ • Clone/sync repos  │───▶│ • Detect changes    │                 │
│  │ • Build dep graph   │    │ • Find affected     │                 │
│  │ • Scan for calls    │    │ • Generate fixes    │                 │
│  │ • Manage workspace  │    │ • Orchestrate flow  │                 │
│  └─────────────────────┘    └─────────────────────┘                 │
│           │                           │                              │
│           │                           │                              │
│           ▼                           ▼                              │
│  ┌─────────────────────┐    ┌─────────────────────┐                 │
│  │    Config System    │    │   GitHub Manager    │                 │
│  │                     │    │                     │                 │
│  │ • repos.json        │    │ • Create branches   │                 │
│  │ • Scan patterns     │    │ • Apply fixes       │                 │
│  │ • Dependencies      │    │ • Commit changes    │                 │
│  │ • API definitions   │    │ • Create PRs        │                 │
│  └─────────────────────┘    └─────────────────────┘                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    AI Analysis Engine                            │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │ Change Detector │  │  Fix Generator  │  │ Impact Analyzer │ │ │
│  │  │                 │  │                 │  │                 │ │ │
│  │  │ • Claude AI     │  │ • Claude AI     │  │ • Dependency    │ │ │
│  │  │ • Semantic      │  │ • Context-aware │  │   traversal     │ │ │
│  │  │   analysis      │  │ • Code gen      │  │ • Risk assess   │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      Dashboard & API                             │ │
│  │                                                                   │ │
│  │  • Express REST API          • Web UI (Vanilla JS)              │ │
│  │  • Real-time monitoring      • Dependency visualization         │ │
│  │  • Analysis history          • One-click operations             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Manages
                                    ▼
            ┌─────────────────────────────────────────┐
            │         .codeflow-workspace/            │
            │                                         │
            │  ├── auth-service/     (Provider)       │
            │  ├── user-service/     (Consumer)       │
            │  ├── order-service/    (Consumer)       │
            │  └── payment-service/  (Consumer)       │
            └─────────────────────────────────────────┘
                                    │
                                    │ Creates PRs in
                                    ▼
            ┌─────────────────────────────────────────┐
            │           GitHub Repositories           │
            │                                         │
            │  • github.com/org/auth-service         │
            │  • github.com/org/user-service         │
            │  • github.com/org/order-service        │
            │  • github.com/org/payment-service      │
            └─────────────────────────────────────────┘

Data Flow:
1. Developer changes API → 2. AI detects breaking change → 3. Find affected repos
4. Generate fixes → 5. Create branches → 6. Apply fixes → 7. Create PRs
```

**Core Components**:
- `analyzer.js` - Claude AI integration for semantic analysis
- `multi-repo-manager.js` - Repository management and dependency graphs
- `cross-repo-analyzer.js` - Main orchestration workflow
- `github-integration.js` - Automated PR creation
- `dashboard/` - Express web UI

## Configuration

Edit `config/repos.json`:

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "https://github.com/org/auth-service.git",
      "type": "provider",
      "apis": [{"endpoint": "/verify", "method": "GET"}]
    },
    {
      "name": "user-service", 
      "url": "https://github.com/org/user-service.git",
      "type": "consumer",
      "dependencies": [{"service": "auth-service", "endpoint": "/verify"}]
    }
  ]
}
```

## Commands

```bash
npm run test        # Demo with mock services
npm run cross-repo  # Analyze all configured repos
npm run dashboard   # Launch web interface
npm run setup       # Interactive configuration
```

## Tech Stack

- **AI**: Claude (Haiku) for semantic code analysis
- **Backend**: Node.js, Express, simple-git
- **GitHub**: Octokit for PR automation
- **Frontend**: Vanilla JS (no build step)

## Scaling

Current: 2-10 repos, sequential processing
Enterprise: Add parallel processing, PostgreSQL, Redis job queue, webhooks

The modular architecture supports scaling without refactoring.

---

**Status**: Working demo with real PR automation. Built to solve actual microservice coordination problems.
