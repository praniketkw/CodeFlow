# CodeFlow 🚀

**AI-Powered Autonomous Dependency Management for Microservices**

CodeFlow automatically detects breaking changes in microservices, finds all affected services, generates fixes using AI, and creates Pull Requests - all without human intervention.

## 🎯 The Problem

In enterprises with 100+ microservices:
- One service changes its API → 50 dependent services break
- Nobody knows what will break until production goes down
- Hours wasted debugging cascading failures
- Days coordinating fixes across teams

## ✨ The Solution

CodeFlow uses AI to:
1. **Detect breaking changes** semantically (not just version bumps)
2. **Find all dependent services** automatically
3. **Generate exact fixes** using Claude AI
4. **Create PRs automatically** with full analysis and fixes
5. **Coordinate deployments** safely

## 🎬 Live Demo

We built a real example:
1. **auth-service** changed its API response structure
2. **user-service** broke (couldn't find `userId` anymore)
3. **CodeFlow detected it**, analyzed the change, generated the fix
4. **Auto-created PR** with the solution
5. **Merged and fixed** - services working again!

Check out [PR #1](https://github.com/praniketkw/CodeFlow/pull/1) to see it in action!

## 🏗️ Project Structure

```
CodeFlow/
├── mock-services/          # Example microservices
│   ├── auth-service/       # Authentication service (port 3001)
│   └── user-service/       # User management (port 3002)
├── codeflow-analyzer/      # The AI-powered analyzer
│   ├── src/
│   │   ├── analyzer.js           # AI code analysis
│   │   ├── github-integration.js # PR automation
│   │   └── auto-fix-demo.js      # Complete workflow
│   └── GITHUB_SETUP.md     # Setup instructions
└── docs/                   # Learning materials
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key
- GitHub Personal Access Token

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/praniketkw/CodeFlow.git
cd CodeFlow
```

2. **Install dependencies**
```bash
cd codeflow-analyzer
npm install
```

3. **Configure API keys**
```bash
cp .env.example .env
# Add your keys to .env:
# ANTHROPIC_API_KEY=your_key
# GITHUB_TOKEN=your_token
```

4. **Run the analyzer**
```bash
npm run test        # Test analysis only
npm run auto-fix    # Full workflow with PR creation
```

## 🎓 How It Works

### Step 1: Detect Breaking Changes
```javascript
// AI analyzes code changes
const analysis = await analyzeCodeChange(oldCode, newCode, 'auth-service');
// Returns: "Breaking change detected - userId moved to user.id"
```

### Step 2: Find Dependent Services
```javascript
// Scans all services for dependencies
const dependents = findDependentServices('/verify', './mock-services');
// Returns: ['user-service', 'order-service', ...]
```

### Step 3: Generate Fixes
```javascript
// AI generates exact code changes
const fix = await generateFix(serviceCode, analysis, 'user-service');
// Returns: "Change response.data.userId to response.data.user.id"
```

### Step 4: Create PR
```javascript
// Automatically creates PR with fixes
await autoFixWorkflow(serviceName, filePath, oldCode, newCode, analysis, fix);
// Creates branch, commits, pushes, opens PR
```

## 🧪 Testing It Yourself

1. **Start the services**
```bash
cd mock-services/auth-service && npm install && npm start &
cd mock-services/user-service && npm install && npm start &
```

2. **Test the working system**
```bash
curl http://localhost:3002/profile -H "Authorization: token123"
```

3. **Make a breaking change** in auth-service

4. **Run CodeFlow**
```bash
cd codeflow-analyzer
npm run auto-fix
```

5. **Check your GitHub repo** for the auto-generated PR!

## 🛠️ Tech Stack

- **AI**: Anthropic Claude (Haiku) for code analysis
- **GitHub**: Octokit for PR automation
- **Git**: simple-git for version control
- **Node.js**: Express for microservices
- **JavaScript**: ES modules

## 📊 What We Built

✅ Mock microservices with real dependencies  
✅ AI-powered semantic change detection  
✅ Automatic dependent service discovery  
✅ AI-generated code fixes  
✅ GitHub PR automation  
✅ Complete end-to-end workflow  

## 🎯 Future Enhancements

- [ ] Webhook automation (auto-run on commits)
- [ ] Dependency graph visualization
- [ ] Multi-repo support (separate repositories)
- [ ] Testing integration (auto-test fixes)
- [ ] Web dashboard
- [ ] Deployment orchestration
- [ ] Rollback automation

## 📚 Learning Resources

Check out the `docs/` folder for detailed explanations:
- `01-microservices-basics.md` - Understanding microservices
- `02-how-auth-service-works.md` - Deep dive into auth service
- `03-service-dependencies.md` - How services depend on each other
- `04-the-breaking-change.md` - The problem CodeFlow solves

## 🤝 Contributing

This is a learning project! Feel free to:
- Add more mock services
- Improve the AI prompts
- Add new features
- Create issues and PRs

## 📝 License

MIT License - feel free to use this for learning!

## 🙏 Acknowledgments

Built as a learning project to understand:
- Microservice architecture
- AI-powered developer tools
- GitHub automation
- Dependency management at scale

---

**Built with ❤️ using Claude AI and lots of coffee ☕**
