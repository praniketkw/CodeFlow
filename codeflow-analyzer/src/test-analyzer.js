import { analyzeCodeChange, findDependentServices, generateFix } from './analyzer.js';
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

async function runAnalysis() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CodeFlow AI Analyzer - Breaking Change Detection');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Analyze the breaking change
    console.log('📊 STEP 1: Analyzing Code Change\n');
    const analysis = await analyzeCodeChange(oldAuthCode, newAuthCode, 'auth-service');
    console.log('\n✅ Analysis Complete:\n');
    console.log(analysis);
    console.log('\n' + '─'.repeat(60) + '\n');

    // Step 2: Find dependent services
    console.log('📊 STEP 2: Finding Dependent Services\n');
    const servicesDir = path.resolve('../mock-services');
    const dependentServices = findDependentServices('/verify', servicesDir);
    
    console.log(`\n✅ Found ${dependentServices.length} dependent service(s):`);
    dependentServices.forEach(service => {
      console.log(`   - ${service.name}`);
    });
    console.log('\n' + '─'.repeat(60) + '\n');

    // Step 3: Generate fixes for each dependent service
    if (dependentServices.length > 0) {
      console.log('📊 STEP 3: Generating Fixes\n');
      
      for (const service of dependentServices) {
        if (service.name === 'auth-service') {
          console.log(`⏭️  Skipping ${service.name} (this is the source of the change)\n`);
          continue;
        }

        const fix = await generateFix(service.code, analysis, service.name);
        console.log(`\n✅ Fix for ${service.name}:\n`);
        console.log(fix);
        console.log('\n' + '─'.repeat(60) + '\n');
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('  Analysis Complete! 🎉');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure you have set ANTHROPIC_API_KEY in .env file');
    }
  }
}

runAnalysis();
