#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CodeFlow Cross-Repo Setup');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('This will help you configure multiple repositories.\n');

  const repos = [];
  let addMore = true;

  while (addMore) {
    console.log(`\n📦 Repository ${repos.length + 1}:\n`);

    const name = await question('  Name (e.g., auth-service): ');
    const url = await question('  Git URL: ');
    const type = await question('  Type (provider/consumer): ');

    const repo = { name, url, type };

    if (type === 'provider') {
      const endpoint = await question('  API Endpoint (e.g., /verify): ');
      const method = await question('  HTTP Method (e.g., GET): ');
      const description = await question('  Description: ');

      repo.apis = [{ endpoint, method, description }];
    } else if (type === 'consumer') {
      const depService = await question('  Depends on service: ');
      const depEndpoint = await question('  Depends on endpoint: ');

      repo.dependencies = [{ service: depService, endpoint: depEndpoint }];
    }

    repos.push(repo);

    const more = await question('\nAdd another repository? (y/n): ');
    addMore = more.toLowerCase() === 'y';
  }

  const config = {
    repositories: repos,
    scanPatterns: {
      apiCalls: [
        'axios.get',
        'axios.post',
        'fetch\\(',
        'http.get',
        'request\\('
      ],
      fileExtensions: ['.js', '.ts', '.jsx', '.tsx']
    }
  };

  const configPath = path.resolve(__dirname, '../config/repos.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Configuration Saved! ✅');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`📄 Config saved to: ${configPath}\n`);
  console.log('Next steps:');
  console.log('  1. Review config/repos.json');
  console.log('  2. Run: npm run cross-repo');
  console.log('  3. Or launch dashboard: npm run dashboard\n');

  rl.close();
}

setup().catch(error => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
