# Quick Start Guide

Get CodeFlow running in 5 minutes.

## Prerequisites

- Node.js 18+
- Git
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- GitHub token ([Get one here](https://github.com/settings/tokens))

## Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/CodeFlow.git
cd CodeFlow/codeflow-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env`:
```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
GITHUB_TOKEN=your_github_token_here
```

## Test Basic Functionality

```bash
# Run single-repo analysis
npm run test
```

You should see:
- ✅ AI analyzing code changes
- ✅ Finding dependent services
- ✅ Generating fixes

## Set Up Cross-Repo

### Option 1: Interactive Setup

```bash
npm run setup
```

Follow the prompts to add your repositories.

### Option 2: Manual Configuration

Edit `config/repos.json`:

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

## Run Cross-Repo Analysis

```bash
npm run cross-repo
```

This will:
1. Clone/sync all configured repos
2. Analyze the breaking change
3. Find affected services
4. Generate fixes
5. Save a report

## Launch Dashboard

```bash
npm run dashboard
```

Open http://localhost:3000 in your browser.

## Create PRs

After running analysis, you can create PRs programmatically:

```javascript
import { CrossRepoAnalyzer } from './src/cross-repo-analyzer.js';

const analyzer = new CrossRepoAnalyzer();
const results = await analyzer.analyzeBreakingChange(...);
const prs = await analyzer.createFixPRs(results);
```

## Project Structure

```
CodeFlow/
├── codeflow-analyzer/          # Main tool
│   ├── config/
│   │   └── repos.json          # Repository configuration
│   ├── src/
│   │   ├── analyzer.js         # AI analysis
│   │   ├── multi-repo-manager.js
│   │   ├── cross-repo-analyzer.js
│   │   ├── github-integration.js
│   │   └── dashboard/          # Web UI
│   └── package.json
├── mock-services/              # Example services
│   ├── auth-service/
│   └── user-service/
└── docs/                       # Documentation
```

## Common Commands

```bash
# Single-repo analysis (demo)
npm run test

# Cross-repo analysis
npm run cross-repo

# Launch dashboard
npm run dashboard

# Interactive setup
npm run setup

# Create PR (single repo)
npm run auto-fix
```

## Troubleshooting

### "API key not found"
- Check `.env` file exists
- Verify `ANTHROPIC_API_KEY` is set
- No quotes needed around the key

### "Repository not found"
- Check GitHub token has `repo` scope
- Verify repository URL in `config/repos.json`
- Make sure you have access to the repo

### "Could not parse fix"
- This is normal sometimes
- Check the generated report for the fix
- You can apply it manually

### Dashboard won't start
- Check port 3000 is available
- Try a different port: `PORT=3001 npm run dashboard`

## Next Steps

1. **Read the docs**: Check out `CROSS_REPO_GUIDE.md`
2. **Understand architecture**: See `docs/05-cross-repo-architecture.md`
3. **Prepare demo**: Use `DEMO_SCRIPT.md`
4. **Customize**: Add your own repositories

## Getting Help

- Check the documentation in `docs/`
- Read `CROSS_REPO_GUIDE.md` for detailed info
- Review example code in `mock-services/`

## Tips

- Start with 2-3 repos to test
- Use the dashboard to visualize dependencies
- Review generated fixes before creating PRs
- Keep your repos.json in version control
- Add more repos gradually

---

Ready to impress employers? Check out `EMPLOYER_PITCH.md` for talking points!
