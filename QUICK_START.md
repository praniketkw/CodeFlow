# Quick Start

Get CodeFlow running in 5 minutes.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/CodeFlow.git
cd CodeFlow/codeflow-analyzer
npm install
cp .env.example .env
```

Edit `.env`:
```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
GITHUB_TOKEN=your_github_token_here
```

**Get API Keys:**
- Anthropic: https://console.anthropic.com/
- GitHub: https://github.com/settings/tokens (needs `repo` scope)

## Test It

```bash
npm run test        # Single-repo demo
npm run cross-repo  # Multi-repo analysis
npm run dashboard   # Web UI at localhost:3000
```

## Configure Repos

Edit `config/repos.json`:

```json
{
  "repositories": [
    {
      "name": "auth-service",
      "url": "https://github.com/YOUR_ORG/auth-service.git",
      "type": "provider",
      "apis": [{"endpoint": "/verify", "method": "GET"}]
    },
    {
      "name": "user-service",
      "url": "https://github.com/YOUR_ORG/user-service.git", 
      "type": "consumer",
      "dependencies": [{"service": "auth-service", "endpoint": "/verify"}]
    }
  ]
}
```

## Commands

```bash
npm run test        # Demo analysis
npm run cross-repo  # Analyze all repos
npm run dashboard   # Launch web UI
npm run setup       # Interactive config
npm run auto-fix    # Create PR in current repo
```

## Troubleshooting

**"API key not found"**: Check `.env` file exists and has correct keys
**"Repository not found"**: Verify GitHub token has `repo` scope
**"Could not parse fix"**: Check generated report, apply manually if needed

That's it. Ready to demo.
