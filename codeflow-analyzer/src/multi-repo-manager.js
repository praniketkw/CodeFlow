import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Manages multiple repositories for cross-repo analysis
 */
export class MultiRepoManager {
  constructor(configPath = '../config/repos.json') {
    const fullPath = path.resolve(__dirname, configPath);
    this.config = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    this.workspaceDir = path.resolve(__dirname, '../../.codeflow-workspace');
    
    // Create workspace directory if it doesn't exist
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
  }

  /**
   * Clone or update all configured repositories
   */
  async syncRepositories() {
    console.log('🔄 Syncing repositories...\n');
    const results = [];

    for (const repo of this.config.repositories) {
      try {
        const repoPath = path.join(this.workspaceDir, repo.name);
        
        if (fs.existsSync(repoPath)) {
          console.log(`📦 Updating ${repo.name}...`);
          const git = simpleGit(repoPath);
          await git.pull();
          results.push({ name: repo.name, status: 'updated', path: repoPath });
        } else {
          console.log(`📥 Cloning ${repo.name}...`);
          await simpleGit().clone(repo.url, repoPath);
          results.push({ name: repo.name, status: 'cloned', path: repoPath });
        }
      } catch (error) {
        console.error(`❌ Failed to sync ${repo.name}:`, error.message);
        results.push({ name: repo.name, status: 'failed', error: error.message });
      }
    }

    console.log(`\n✅ Synced ${results.filter(r => r.status !== 'failed').length}/${results.length} repositories\n`);
    return results;
  }

  /**
   * Build dependency graph across all repos
   */
  buildDependencyGraph() {
    console.log('🕸️  Building dependency graph...\n');
    
    const graph = {
      providers: {},
      consumers: {},
      edges: []
    };

    // Map providers (services that expose APIs)
    this.config.repositories
      .filter(r => r.type === 'provider')
      .forEach(repo => {
        graph.providers[repo.name] = {
          apis: repo.apis || [],
          dependents: []
        };
      });

    // Map consumers and create edges
    this.config.repositories
      .filter(r => r.type === 'consumer')
      .forEach(repo => {
        graph.consumers[repo.name] = {
          dependencies: repo.dependencies || []
        };

        // Create edges
        repo.dependencies?.forEach(dep => {
          graph.edges.push({
            from: dep.service,
            to: repo.name,
            endpoint: dep.endpoint
          });

          // Add to provider's dependents list
          if (graph.providers[dep.service]) {
            graph.providers[dep.service].dependents.push({
              service: repo.name,
              endpoint: dep.endpoint
            });
          }
        });
      });

    return graph;
  }

  /**
   * Find all services that depend on a specific API endpoint
   */
  findDependentsOfEndpoint(serviceName, endpoint) {
    const graph = this.buildDependencyGraph();
    const provider = graph.providers[serviceName];
    
    if (!provider) {
      return [];
    }

    return provider.dependents.filter(dep => dep.endpoint === endpoint);
  }

  /**
   * Scan a repository for API calls to a specific endpoint
   */
  scanRepoForApiCalls(repoName, targetEndpoint) {
    const repoPath = path.join(this.workspaceDir, repoName);
    
    if (!fs.existsSync(repoPath)) {
      console.warn(`⚠️  Repository ${repoName} not found in workspace`);
      return [];
    }

    const findings = [];
    const extensions = this.config.scanPatterns.fileExtensions;

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip node_modules and .git
        if (file === 'node_modules' || file === '.git') {
          continue;
        }

        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check if this file calls the target endpoint
          if (content.includes(targetEndpoint)) {
            const lines = content.split('\n');
            const matches = [];

            lines.forEach((line, index) => {
              if (line.includes(targetEndpoint)) {
                matches.push({
                  line: index + 1,
                  code: line.trim()
                });
              }
            });

            if (matches.length > 0) {
              findings.push({
                file: path.relative(repoPath, filePath),
                matches: matches,
                fullPath: filePath
              });
            }
          }
        }
      }
    };

    scanDirectory(repoPath);
    return findings;
  }

  /**
   * Get all repositories
   */
  getAllRepos() {
    return this.config.repositories;
  }

  /**
   * Get repository by name
   */
  getRepo(name) {
    return this.config.repositories.find(r => r.name === name);
  }

  /**
   * Get local path for a repository
   */
  getRepoPath(name) {
    return path.join(this.workspaceDir, name);
  }
}
