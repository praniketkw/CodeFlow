# Cross-Repo Analysis Guide

CodeFlow now supports analyzing breaking changes across multiple repositories. This guide shows you how to set it up and use it.

## What's New

### Multi-Repository Support
- Configure multiple repos in a single JSON file
- Automatically clone and sync repositories
- Build dependency graphs across repos
- Detect which repos are affected by breaking changes
- Generate fixes and create PRs in multiple repos simultaneously

### Visual Dashboard
- Web-based dashboard to monitor all repositories
- Real-time dependency graph visualization
- One-click repository syncing
- Analysis history tracking

## Setup

### 1. Configure Your Repositories

Edit `config/repos.json` to add your repositories:

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "https://github.com/YOUR_ORG/auth-service.git",
      "type": "provider",
      "apis": [
        {
          "endpoint": "/verify",
          "method": "GET",
          "description": "Verify authentication token"
        }
      ]
    },
    {
      "name": "user-service",
      "url": "https://github.com/YOUR_ORG/user-service.git",
      "type": "consumer",
      "dependencies": [
        {
          "service": "auth-service",
          "endpoint": "/verify"
        }
      ]
    }
  ]
}
```

**Repository Types:**
- `provider`: Services that expose APIs (e.g., auth-service)
- `consumer`: Services that depend on other APIs (e.g., user-service)

### 2. Set Up GitHub Access

Make sure your `.env` file has:
```bash
ANTHROPIC_API_KEY=your_anthropic_key
GITHUB_TOKEN=your_github_token
```

The GitHub token needs `repo` scope to create PRs across multiple repositories.

### 3. Test with Local Repos First

For testing, you can use local repositories:

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "file:///absolute/path/to/mock-services/auth-service",
      "type": "provider",
      ...
    }
  ]
}
```

## Usage

### Run Cross-Repo Analysis

```bash
npm run cross-repo
```

This will:
1. Clone/sync all configured repositories
2. Analyze the breaking change
3. Build a dependency graph
4. Find all affected repositories
5. Generate fixes for each affected repo
6. Save a detailed report

### Launch the Dashboard

```bash
npm run dashboard
```

Then open http://localhost:3000 in your browser.

The dashboard shows:
- All configured repositories
- System health status
- Dependency graph visualization
- One-click sync button

### Programmatic Usage

```javascript
import { CrossRepoAnalyzer } from './src/cross-repo-analyzer.js';

const analyzer = new CrossRepoAnalyzer();

// Analyze breaking change
const results = await analyzer.analyzeBreakingChange(
  'auth-service',
  '/verify',
  oldCode,
  newCode
);

// Create PRs for all affected repos
const prs = await analyzer.createFixPRs(results);

// Generate report
const report = analyzer.generateReport(results);
```

## How It Works

### 1. Repository Syncing

CodeFlow clones all configured repositories into `.codeflow-workspace/`:

```
.codeflow-workspace/
├── auth-service/
├── user-service/
└── order-service/
```

This workspace is gitignored and managed automatically.

### 2. Dependency Graph

CodeFlow builds a graph of dependencies:

```
auth-service (Provider)
  └─ GET /verify
     Consumed by:
     ├─ user-service → /verify
     └─ order-service → /verify
```

### 3. Breaking Change Detection

When you analyze a change:
1. AI compares old vs new code
2. Identifies what changed in the API contract
3. Determines if it's a breaking change

### 4. Impact Analysis

CodeFlow scans all consumer repos:
1. Searches for calls to the changed endpoint
2. Identifies affected files and line numbers
3. Determines which repos need fixes

### 5. Fix Generation

For each affected repo:
1. AI analyzes the consumer's code
2. Generates the specific fix needed
3. Creates a branch and commits the fix
4. Opens a PR with detailed explanation

## Real-World Example

Let's say you change auth-service's `/verify` response:

**Before:**
```json
{ "valid": true, "userId": 1, "username": "john" }
```

**After:**
```json
{ "valid": true, "user": { "id": 1, "name": "john" } }
```

### What CodeFlow Does:

1. **Detects the change**: "userId moved to user.id"
2. **Finds affected repos**: user-service, order-service, payment-service
3. **Scans each repo**: Finds all files calling `/verify`
4. **Generates fixes**: Updates `response.data.userId` to `response.data.user.id`
5. **Creates PRs**: Opens 3 PRs with the fixes

### Result:

Instead of manually fixing 3+ repos, you get:
- ✅ Automatic detection
- ✅ Automatic fixes
- ✅ PRs ready for review
- ✅ Detailed analysis in each PR

## Configuration Options

### Scan Patterns

Customize what CodeFlow looks for:

```json
{
  "scanPatterns": {
    "apiCalls": [
      "axios.get",
      "axios.post",
      "fetch\\(",
      "http.get"
    ],
    "fileExtensions": [".js", ".ts", ".jsx", ".tsx"]
  }
}
```

### Adding More Repos

Just add to the `repositories` array:

```json
{
  "name": "payment-service",
  "url": "https://github.com/YOUR_ORG/payment-service.git",
  "type": "consumer",
  "dependencies": [
    {
      "service": "auth-service",
      "endpoint": "/verify"
    }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│           CodeFlow Platform                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  MultiRepoManager                                │
│  ├─ Clone/sync repos                            │
│  ├─ Build dependency graph                      │
│  └─ Scan for API calls                          │
│                                                  │
│  CrossRepoAnalyzer                               │
│  ├─ Detect breaking changes (AI)                │
│  ├─ Find affected repos                         │
│  ├─ Generate fixes (AI)                         │
│  └─ Create PRs                                   │
│                                                  │
│  Dashboard                                       │
│  ├─ Web UI                                       │
│  ├─ REST API                                     │
│  └─ Real-time monitoring                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Limitations & Future Work

### Current Limitations:
- Simple string replacement for fixes (works for most cases)
- Requires manual repo configuration
- No automatic webhook integration yet
- Single-threaded analysis

### Planned Features:
- AST-based code transformation
- Automatic repo discovery
- GitHub webhook integration
- Parallel analysis
- Deployment coordination
- Rollback automation

## Troubleshooting

### "Repository not found"
- Check the URL in `repos.json`
- Ensure your GitHub token has access to the repo

### "Could not parse fix"
- The AI might have used a different format
- Check the generated fix in the report
- You can manually apply it

### "No affected repos found"
- Verify the endpoint name matches exactly
- Check that dependencies are configured correctly
- Ensure repos are synced

## Tips for Employers

When demonstrating this to employers, highlight:

1. **Scalability**: "This handles 2 repos now, but the architecture scales to 100+"
2. **AI Integration**: "Uses Claude to understand code semantically, not just regex"
3. **Real Problem**: "Solves actual pain points in microservice architectures"
4. **Production-Ready Thinking**: "Includes error handling, logging, and reporting"
5. **Extensibility**: "Easy to add webhooks, deployment coordination, etc."

## Next Steps

1. Configure your actual repositories
2. Run a test analysis
3. Review the generated report
4. Try creating PRs
5. Show the dashboard to your team

---

Built to demonstrate enterprise-level thinking with practical implementation.
