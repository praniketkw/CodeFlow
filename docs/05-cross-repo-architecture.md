# Cross-Repo Architecture

## Overview

CodeFlow has evolved from a single-repo demo to a multi-repository dependency manager. This document explains the architecture and design decisions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CodeFlow Platform                            │
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │  MultiRepoManager  │         │ CrossRepoAnalyzer  │          │
│  │                    │         │                    │          │
│  │ • Clone repos      │────────▶│ • Detect changes   │          │
│  │ • Build graph      │         │ • Find affected    │          │
│  │ • Scan code        │         │ • Generate fixes   │          │
│  └────────────────────┘         └────────────────────┘          │
│           │                              │                       │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │   Config System    │         │   GitHub Manager   │          │
│  │                    │         │                    │          │
│  │ • repos.json       │         │ • Create branches  │          │
│  │ • Scan patterns    │         │ • Apply fixes      │          │
│  │ • Dependencies     │         │ • Create PRs       │          │
│  └────────────────────┘         └────────────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │              Dashboard (Express)                  │           │
│  │                                                   │           │
│  │  • REST API                                       │           │
│  │  • Web UI                                         │           │
│  │  • Real-time monitoring                          │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Manages
                           ▼
        ┌──────────────────────────────────────┐
        │      .codeflow-workspace/            │
        │                                       │
        │  ├── auth-service/                   │
        │  ├── user-service/                   │
        │  ├── order-service/                  │
        │  └── payment-service/                │
        └──────────────────────────────────────┘
                           │
                           │ Creates PRs in
                           ▼
        ┌──────────────────────────────────────┐
        │         GitHub Repositories           │
        │                                       │
        │  • github.com/org/auth-service       │
        │  • github.com/org/user-service       │
        │  • github.com/org/order-service      │
        └──────────────────────────────────────┘
```

## Component Breakdown

### 1. MultiRepoManager

**Purpose**: Manages multiple repositories and their relationships

**Responsibilities**:
- Clone and sync repositories from GitHub
- Build dependency graph from configuration
- Scan repositories for API calls
- Maintain local workspace

**Key Methods**:
```javascript
syncRepositories()           // Clone/update all repos
buildDependencyGraph()       // Create dependency map
findDependentsOfEndpoint()   // Find who uses an API
scanRepoForApiCalls()        // Search for endpoint usage
```

### 2. CrossRepoAnalyzer

**Purpose**: Orchestrates the entire analysis workflow

**Responsibilities**:
- Detect breaking changes using AI
- Find all affected repositories
- Generate fixes for each affected repo
- Coordinate PR creation
- Generate reports

**Key Methods**:
```javascript
analyzeBreakingChange()      // Main workflow
createFixPRs()               // Batch PR creation
generateReport()             // Create summary
```

### 3. Config System

**Purpose**: Declarative repository configuration

**Structure**:
```json
{
  "repositories": [
    {
      "name": "service-name",
      "url": "git-url",
      "type": "provider|consumer",
      "apis": [...],
      "dependencies": [...]
    }
  ],
  "scanPatterns": {
    "apiCalls": ["regex patterns"],
    "fileExtensions": [".js", ".ts"]
  }
}
```

### 4. Dashboard

**Purpose**: Web interface for monitoring and control

**Features**:
- View all configured repositories
- Visualize dependency graph
- Trigger repository sync
- View analysis history
- Monitor system health

**Tech Stack**:
- Express.js backend
- Vanilla JS frontend
- REST API

## Data Flow

### Breaking Change Detection Flow

```
1. Developer changes auth-service API
   └─▶ Old code vs New code

2. CrossRepoAnalyzer.analyzeBreakingChange()
   ├─▶ Sync all repos (MultiRepoManager)
   ├─▶ Analyze change (Claude AI)
   ├─▶ Build dependency graph
   └─▶ Find affected repos

3. For each affected repo:
   ├─▶ Scan for API calls
   ├─▶ Generate fix (Claude AI)
   └─▶ Store fix

4. Create PRs (optional)
   ├─▶ Create branch
   ├─▶ Apply fix
   ├─▶ Commit changes
   └─▶ Open PR

5. Generate report
   └─▶ Save to JSON
```

### Dependency Graph Structure

```javascript
{
  providers: {
    'auth-service': {
      apis: [
        { endpoint: '/verify', method: 'GET', description: '...' }
      ],
      dependents: [
        { service: 'user-service', endpoint: '/verify' },
        { service: 'order-service', endpoint: '/verify' }
      ]
    }
  },
  consumers: {
    'user-service': {
      dependencies: [
        { service: 'auth-service', endpoint: '/verify' }
      ]
    }
  },
  edges: [
    { from: 'auth-service', to: 'user-service', endpoint: '/verify' }
  ]
}
```

## Design Decisions

### Why Local Workspace?

**Decision**: Clone repos to `.codeflow-workspace/` instead of analyzing remotely

**Reasoning**:
- Faster analysis (local file access)
- Can work offline after initial clone
- Easier to test fixes locally
- No API rate limits
- Can use standard git tools

**Trade-off**: Requires disk space, but manageable for most projects

### Why Config-Based?

**Decision**: Use `repos.json` instead of auto-discovery

**Reasoning**:
- Explicit is better than implicit
- Easier to understand and debug
- Can add metadata (descriptions, owners)
- No need for complex discovery logic
- Easy to version control

**Future**: Could add auto-discovery as an option

### Why Simple String Replacement?

**Decision**: Use string replacement for fixes instead of AST manipulation

**Reasoning**:
- Works for 80% of cases
- Much simpler to implement
- Easier to understand and debug
- Can upgrade to AST later if needed

**Trade-off**: May miss edge cases, but good enough for MVP

### Why Express Dashboard?

**Decision**: Simple Express server instead of React/Vue

**Reasoning**:
- No build step required
- Faster to develop
- Easier to deploy
- Good enough for demo purposes
- Can upgrade later if needed

## Scalability Considerations

### Current Limitations

1. **Sequential Processing**: Analyzes repos one at a time
2. **In-Memory State**: No persistent database
3. **Single Instance**: Can't run multiple instances
4. **No Caching**: Re-analyzes everything each time

### How to Scale (Future)

1. **Parallel Processing**:
   ```javascript
   await Promise.all(repos.map(repo => analyzeRepo(repo)));
   ```

2. **Add Database**:
   - PostgreSQL for repos, dependencies, analyses
   - Redis for job queue and caching

3. **Job Queue**:
   - Bull/BullMQ for async processing
   - Handle long-running analyses

4. **Webhook Integration**:
   - Listen to GitHub push events
   - Automatic analysis on every commit

5. **Microservices**:
   - Separate analyzer, PR creator, dashboard
   - Scale each independently

## Enterprise Readiness

### What's Already Enterprise-Like

✅ **Modular Architecture**: Clear separation of concerns
✅ **Error Handling**: Try-catch blocks throughout
✅ **Logging**: Console logs for debugging
✅ **Configuration**: Externalized config
✅ **API Design**: RESTful endpoints
✅ **Documentation**: Comprehensive guides

### What Would Be Needed for Production

🔲 **Authentication**: Secure API endpoints
🔲 **Database**: Persistent storage
🔲 **Monitoring**: Metrics, alerts, logging
🔲 **Testing**: Unit, integration, e2e tests
🔲 **CI/CD**: Automated deployment
🔲 **Rate Limiting**: Protect against abuse
🔲 **Webhooks**: Real-time integration
🔲 **Multi-tenancy**: Support multiple orgs

## Comparison: Before vs After

### Before (Single Repo)

```
CodeFlow/
├── mock-services/
│   ├── auth-service/
│   └── user-service/
└── codeflow-analyzer/
    └── src/
        ├── analyzer.js
        └── github-integration.js
```

**Capabilities**:
- Analyze changes in one repo
- Find dependents in same repo
- Create one PR

### After (Multi Repo)

```
CodeFlow/
├── mock-services/          # Examples
├── codeflow-analyzer/
│   ├── config/
│   │   └── repos.json      # Multi-repo config
│   ├── src/
│   │   ├── multi-repo-manager.js
│   │   ├── cross-repo-analyzer.js
│   │   └── dashboard/
│   │       ├── server.js
│   │       └── public/
└── .codeflow-workspace/    # Cloned repos
    ├── auth-service/
    ├── user-service/
    └── order-service/
```

**Capabilities**:
- Analyze changes across multiple repos
- Build dependency graph
- Find dependents in any repo
- Create multiple PRs
- Visual dashboard
- Batch operations

## Key Takeaways

1. **Scalable Foundation**: Architecture supports growth
2. **Practical Approach**: Solves real problems without overengineering
3. **Enterprise Thinking**: Demonstrates production-ready mindset
4. **Extensible Design**: Easy to add features
5. **Clear Documentation**: Easy for others to understand

---

This architecture demonstrates enterprise-level thinking while remaining buildable and practical.
