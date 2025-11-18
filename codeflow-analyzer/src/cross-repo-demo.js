import { CrossRepoAnalyzer } from './cross-repo-analyzer.js';
import fs from 'fs';

// Example: Breaking change in auth-service
const oldAuthCode = `
app.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = validTokens[token];
  
  if (user) {
    res.json({
      valid: true,
      userId: user.userId,
      username: user.username
    });
  } else {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});
`;

const newAuthCode = `
app.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = validTokens[token];
  
  if (user) {
    // BREAKING CHANGE: New response structure!
    res.json({
      valid: true,
      user: {
        id: user.userId,
        name: user.username,
        email: \`\${user.username}@example.com\`
      }
    });
  } else {
    res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});
`;

async function runCrossRepoAnalysis() {
  const analyzer = new CrossRepoAnalyzer();

  try {
    // Run the analysis
    const results = await analyzer.analyzeBreakingChange(
      'auth-service',
      '/verify',
      oldAuthCode,
      newAuthCode
    );

    // Generate report
    const report = analyzer.generateReport(results);
    
    // Save report
    const reportPath = './cross-repo-analysis-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}\n`);

    // Ask if user wants to create PRs
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Next Steps');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('To create PRs for all affected repositories, run:');
    console.log('  npm run create-prs\n');
    console.log('Or use the API:');
    console.log('  const prs = await analyzer.createFixPRs(results);\n');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

runCrossRepoAnalysis();
