import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes code changes to detect breaking changes in APIs
 */
export async function analyzeCodeChange(oldCode, newCode, serviceName) {
  console.log(`\n🔍 Analyzing changes in ${serviceName}...`);

  const prompt = `You are a senior software engineer analyzing API changes in a microservice architecture.

SERVICE: ${serviceName}

OLD CODE:
\`\`\`javascript
${oldCode}
\`\`\`

NEW CODE:
\`\`\`javascript
${newCode}
\`\`\`

Analyze the changes and provide:
1. Is this a breaking change? (Yes/No)
2. What exactly changed?
3. What fields/structure changed in the API response?
4. How would this affect services that depend on this API?
5. What code changes would dependent services need to make?

Be specific and technical. Focus on API contract changes.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

/**
 * Finds all services that depend on a specific API endpoint
 */
export function findDependentServices(endpoint, servicesDir) {
  console.log(`\n🔎 Scanning for services that call ${endpoint}...`);
  
  const services = [];
  const servicesDirPath = path.resolve(servicesDir);
  
  // Read all service directories
  const serviceFolders = fs.readdirSync(servicesDirPath);
  
  for (const folder of serviceFolders) {
    const servicePath = path.join(servicesDirPath, folder);
    const serverFile = path.join(servicePath, 'server.js');
    
    if (fs.existsSync(serverFile)) {
      const code = fs.readFileSync(serverFile, 'utf-8');
      
      // Check if this service calls the endpoint
      if (code.includes(endpoint)) {
        services.push({
          name: folder,
          path: servicePath,
          code: code
        });
      }
    }
  }
  
  return services;
}

/**
 * Generates a fix for a dependent service using AI
 */
export async function generateFix(serviceCode, breakingChange, serviceName) {
  console.log(`\n🔧 Generating fix for ${serviceName}...`);

  const prompt = `You are a senior software engineer fixing a breaking change in a microservice.

SERVICE: ${serviceName}

CURRENT CODE:
\`\`\`javascript
${serviceCode}
\`\`\`

BREAKING CHANGE DETECTED:
${breakingChange}

Generate the EXACT code changes needed to fix this service. Show only the specific lines that need to change, in a before/after format.

Format:
BEFORE:
[exact code to replace]

AFTER:
[new code]

Be precise and only show the minimal changes needed.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 CodeFlow Analyzer Starting...\n');
  console.log('This will analyze the breaking change we just made.\n');
}
