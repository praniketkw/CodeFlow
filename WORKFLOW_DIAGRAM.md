# CodeFlow Workflow Diagrams

Visual representations of how CodeFlow works.

## High-Level Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Changes API                     │
│              (auth-service: userId → user.id)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CodeFlow Detects Change                    │
│                    (AI Analysis via Claude)                  │
│                                                              │
│  "Breaking change: userId field moved to user.id"           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Build Dependency Graph                      │
│                                                              │
│     auth-service                                            │
│          ├─→ user-service                                   │
│          ├─→ order-service                                  │
│          └─→ payment-service                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Scan All Dependent Repositories                 │
│                                                              │
│  ✓ user-service: 2 files affected                          │
│  ✓ order-service: 1 file affected                          │
│  ✓ payment-service: 3 files affected                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generate Fixes (AI)                         │
│                                                              │
│  For each affected service:                                 │
│    OLD: response.data.userId                                │
│    NEW: response.data.user.id                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Create Pull Requests                      │
│                                                              │
│  ✓ PR #1: user-service                                      │
│  ✓ PR #2: order-service                                     │
│  ✓ PR #3: payment-service                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Teams Review & Merge                       │
│                                                              │
│  Time saved: 40 hours → 30 minutes                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ npm run cross-repo
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│              CrossRepoAnalyzer                            │
│                                                           │
│  ┌─────────────────┐         ┌──────────────────┐       │
│  │ analyzeBreaking │────────▶│  createFixPRs    │       │
│  │     Change      │         │                  │       │
│  └────────┬────────┘         └────────┬─────────┘       │
│           │                           │                  │
└───────────┼───────────────────────────┼──────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌──────────────────────┐
│  MultiRepoManager     │   │ GitHubIntegration    │
│                       │   │                      │
│  • syncRepositories() │   │  • createBranch()    │
│  • buildGraph()       │   │  • applyFix()        │
│  • scanForCalls()     │   │  • createPR()        │
└───────────┬───────────┘   └──────────┬───────────┘
            │                          │
            ▼                          ▼
┌───────────────────────┐   ┌──────────────────────┐
│  .codeflow-workspace/ │   │  GitHub Repositories │
│                       │   │                      │
│  • auth-service/      │   │  • PRs created       │
│  • user-service/      │   │  • Branches made     │
│  • order-service/     │   │  • Commits pushed    │
└───────────────────────┘   └──────────────────────┘
```

## Data Flow

```
┌─────────────┐
│  Old Code   │
│  New Code   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│      Claude AI Analysis          │
│                                  │
│  Input: Code diff                │
│  Output: Breaking change details │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    Dependency Graph Lookup       │
│                                  │
│  Input: Service + Endpoint       │
│  Output: List of dependents      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      Repository Scanner          │
│                                  │
│  Input: Endpoint pattern         │
│  Output: Affected files          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      Claude AI Fix Gen           │
│                                  │
│  Input: Code + Analysis          │
│  Output: Fix instructions        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      GitHub PR Creation          │
│                                  │
│  Input: Fix + Repo info          │
│  Output: Pull Request URL        │
└──────────────────────────────────┘
```

## Dependency Graph Structure

```
Provider Services (Expose APIs)
┌─────────────────────────────────┐
│       auth-service              │
│                                 │
│  APIs:                          │
│  • GET /verify                  │
│  • POST /login                  │
│  • POST /logout                 │
└────────┬────────────────────────┘
         │
         │ Consumed by
         │
         ├──────────────────┬──────────────────┬──────────────────┐
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ user-service   │  │ order-service  │  │payment-service │  │ admin-service  │
│                │  │                │  │                │  │                │
│ Calls:         │  │ Calls:         │  │ Calls:         │  │ Calls:         │
│ • /verify      │  │ • /verify      │  │ • /verify      │  │ • /verify      │
│                │  │                │  │ • /login       │  │ • /login       │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘

Consumer Services (Depend on APIs)
```

## Time Comparison

### Without CodeFlow
```
Breaking Change Occurs
         │
         ▼
    Deploy to Prod
         │
         ▼
  Services Break (2 hours to discover)
         │
         ▼
  Find All Affected Services (4 hours)
         │
         ▼
  Fix Each Service Manually (2 hours × 20 = 40 hours)
         │
         ▼
  Coordinate Deployments (2 hours)
         │
         ▼
Total: 48 hours + Production Downtime
```

### With CodeFlow
```
Breaking Change Occurs
         │
         ▼
  Run CodeFlow Analysis (5 minutes)
         │
         ▼
  Review Generated Fixes (10 minutes)
         │
         ▼
  Create PRs (5 minutes)
         │
         ▼
  Teams Review & Merge (15 minutes)
         │
         ▼
Total: 35 minutes + No Downtime
```

**Time Saved: 47.5 hours (99% reduction)**

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  Dashboard   │         │     CLI      │             │
│  │   (Web UI)   │         │   Commands   │             │
│  └──────────────┘         └──────────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   API Layer                              │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │         Express REST API                      │      │
│  │  /api/repos  /api/analyze  /api/sync         │      │
│  └──────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Business Logic Layer                     │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │ CrossRepoAnalyzer│      │ MultiRepoManager │        │
│  └──────────────────┘      └──────────────────┘        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Integration Layer                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Claude AI   │  │  GitHub API  │  │  Git (CLI)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Scalability Evolution

### Current (MVP)
```
Single Process
     │
     ├─ Sync Repos (Sequential)
     ├─ Analyze (Sequential)
     └─ Create PRs (Sequential)

Handles: 2-10 repos
Time: ~5 minutes
```

### Next Phase
```
Single Process + Job Queue
     │
     ├─ Sync Repos (Parallel)
     ├─ Analyze (Parallel)
     └─ Create PRs (Parallel)

Handles: 10-50 repos
Time: ~2 minutes
```

### Production Scale
```
Distributed System
     │
     ├─ Worker Pool (Sync)
     ├─ Worker Pool (Analyze)
     ├─ Worker Pool (PRs)
     └─ Database + Cache

Handles: 100+ repos
Time: ~1 minute
```

---

These diagrams help visualize the system for technical discussions.
