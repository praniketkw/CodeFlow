# GitHub Integration Setup

To enable CodeFlow to create Pull Requests automatically, you need a GitHub Personal Access Token.

## Step 1: Create a GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `CodeFlow`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

## Step 2: Add Token to .env

Open `codeflow-analyzer/.env` and add:

```
GITHUB_TOKEN=ghp_your_token_here
```

## Step 3: Test It

Run the auto-fix demo:

```bash
cd codeflow-analyzer
npm run auto-fix
```

This will:
1. Analyze the breaking change
2. Find dependent services
3. Generate fixes
4. Create a new branch
5. Apply the fixes
6. Push to GitHub
7. Create a Pull Request

## What You'll See

CodeFlow will create a PR in your repo with:
- Clear description of the breaking change
- The exact fix applied
- Instructions for reviewing and merging

## Security Note

- Never commit your `.env` file (it's in `.gitignore`)
- Keep your token secure
- You can revoke it anytime at: https://github.com/settings/tokens
