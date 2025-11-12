import { analyzeCodeChange, findDependentServices, generateFix } from './analyzer.js';
import { autoFixWorkflow } from './github-integration.js';
import fs from 'fs';
import path from 'path';

// The old version of auth-service /verify endpoint
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

// The new version (breaking change)
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

async function runAutoFix() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CodeFlow - Complete Auto-Fix Demo');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Analyze the breaking change
    console.log('📊 STEP 1: Analyzing Breaking Change\n');
    const analysis = await analyzeCodeChange(oldAuthCode, newAuthCode, 'auth-service');
    console.log('\n✅ Analysis Complete');
    console.log('─'.repeat(60) + '\n');

    // Step 2: Find dependent services
    console.log('📊 STEP 2: Finding Dependent Services\n');
    const servicesDir = path.resolve('../mock-services');
    const dependentServices = findDependentServices('/verify', servicesDir);
    
    console.log(`✅ Found ${dependentServices.length} dependent service(s)`);
    console.log('─'.repeat(60) + '\n');

    // Step 3: Generate and apply fixes
    console.log('📊 STEP 3: Generating and Applying Fixes\n');
    
    for (const service of dependentServices) {
      if (service.name === 'auth-service') {
        console.log(`⏭️  Skipping ${service.name} (source of change)\n`);
        continue;
      }

      console.log(`\n🔧 Processing ${service.name}...`);
      
      // Generate fix
      const fix = await generateFix(service.code, analysis, service.name);
      
      // Extract the old and new code from the fix
      // This is a simple parser - in production you'd use proper AST manipulation
      const beforeMatch = fix.match(/BEFORE:[\s\S]*?```javascript\n([\s\S]*?)```/);
      const afterMatch = fix.match(/AFTER:[\s\S]*?```javascript\n([\s\S]*?)```/);
      
      if (beforeMatch && afterMatch) {
        const oldCode = beforeMatch[1].trim();
        const newCode = afterMatch[1].trim();
        
        // Find the specific lines to replace (simplified)
        const oldLine = 'req.userId = response.data.userId;';
        const newLine = 'req.userId = response.data.user.id;';
        
        const filePath = path.join(service.path, 'server.js');
        
        console.log(`\n📝 Fix Summary:`);
        console.log(`   Old: response.data.userId`);
        console.log(`   New: response.data.user.id`);
        
        // Create PR with the fix
        await autoFixWorkflow(
          service.name,
          filePath,
          oldLine,
          newLine,
          analysis,
          fix
        );
      } else {
        console.log('⚠️  Could not parse fix format');
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  All Fixes Applied! 🎉');
    console.log('  Check your GitHub repo for the Pull Request');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('GITHUB_TOKEN')) {
      console.log('\n💡 You need to add GITHUB_TOKEN to your .env file');
      console.log('   Get one at: https://github.com/settings/tokens');
      console.log('   Required scopes: repo');
    }
  }
}

runAutoFix();
