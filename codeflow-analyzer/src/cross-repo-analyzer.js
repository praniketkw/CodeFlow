import { MultiRepoManager } from './multi-repo-manager.js';
import { analyzeCodeChange, generateFix } from './analyzer.js';
import { initGitHub, createFixBranch, applyFix, commitAndPush, createPullRequest } from './github-integration.js';
import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

/**
 * Analyzes breaking changes across multiple repositories
 */
export class CrossRepoAnalyzer {
  constructor() {
    this.repoManager = new MultiRepoManager();
  }

  /**
   * Main workflow: Detect breaking change and fix all affected repos
   */
  async analyzeBreakingChange(serviceName, endpoint, oldCode, newCode) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  CodeFlow Cross-Repo Analysis');
    console.log('═══════════════════════════════════════════════════════\n');

    const results = {
      service: serviceName,
      endpoint: endpoint,
      analysis: null,
      affectedRepos: [],
      fixes: [],
      prs: []
    };

    try {
      // Step 1: Sync all repositories
      console.log('📊 STEP 1: Syncing Repositories\n');
      await this.repoManager.syncRepositories();
      console.log('─'.repeat(60) + '\n');

      // Step 2: Analyze the breaking change
      console.log('📊 STEP 2: Analyzing Breaking Change\n');
      results.analysis = await analyzeCodeChange(oldCode, newCode, serviceName);
      console.log('✅ Analysis complete\n');
      console.log('─'.repeat(60) + '\n');

      // Step 3: Build dependency graph
      console.log('📊 STEP 3: Building Dependency Graph\n');
      const graph = this.repoManager.buildDependencyGraph();
      console.log('✅ Dependency graph built\n');
      this.printDependencyGraph(graph);
      console.log('─'.repeat(60) + '\n');

      // Step 4: Find affected repositories
      console.log('📊 STEP 4: Finding Affected Repositories\n');
      const dependents = this.repoManager.findDependentsOfEndpoint(serviceName, endpoint);
      
      for (const dependent of dependents) {
        const findings = this.repoManager.scanRepoForApiCalls(dependent.service, endpoint);
        
        if (findings.length > 0) {
          results.affectedRepos.push({
            name: dependent.service,
            findings: findings
          });
          
          console.log(`✅ ${dependent.service}: ${findings.length} file(s) affected`);
          findings.forEach(f => {
            console.log(`   📄 ${f.file} (${f.matches.length} occurrence(s))`);
          });
        }
      }
      
      console.log(`\n✅ Found ${results.affectedRepos.length} affected repositories\n`);
      console.log('─'.repeat(60) + '\n');

      // Step 5: Generate fixes for each affected repo
      console.log('📊 STEP 5: Generating Fixes\n');
      
      for (const affectedRepo of results.affectedRepos) {
        console.log(`\n🔧 Generating fix for ${affectedRepo.name}...`);
        
        // Read the affected file
        const mainFile = affectedRepo.findings[0];
        const fileContent = fs.readFileSync(mainFile.fullPath, 'utf-8');
        
        // Generate fix using AI
        const fix = await generateFix(fileContent, results.analysis, affectedRepo.name);
        
        results.fixes.push({
          repo: affectedRepo.name,
          fix: fix,
          files: affectedRepo.findings
        });
        
        console.log(`✅ Fix generated for ${affectedRepo.name}`);
      }
      
      console.log('\n─'.repeat(60) + '\n');

      console.log('═══════════════════════════════════════════════════════');
      console.log('  Analysis Complete! 🎉');
      console.log('═══════════════════════════════════════════════════════\n');

      return results;

    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      throw error;
    }
  }

  /**
   * Create PRs for all affected repositories
   */
  async createFixPRs(analysisResults) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Creating Pull Requests');
    console.log('═══════════════════════════════════════════════════════\n');

    const octokit = initGitHub();
    const prs = [];

    for (const fix of analysisResults.fixes) {
      try {
        console.log(`\n🔀 Creating PR for ${fix.repo}...`);
        
        const repoPath = this.repoManager.getRepoPath(fix.repo);
        const git = simpleGit(repoPath);
        
        // Parse the fix to extract old and new code
        const { oldCode, newCode } = this.parseFix(fix.fix);
        
        if (!oldCode || !newCode) {
          console.log(`⚠️  Could not parse fix for ${fix.repo}, skipping...`);
          continue;
        }

        // Create branch
        const branchName = `codeflow/fix-${analysisResults.service}-${Date.now()}`;
        await git.checkoutLocalBranch(branchName);

        // Apply fix to the main affected file
        const mainFile = fix.files[0].fullPath;
        let content = fs.readFileSync(mainFile, 'utf-8');
        
        if (content.includes(oldCode)) {
          content = content.replace(oldCode, newCode);
          fs.writeFileSync(mainFile, content);
          
          // Commit and push
          await git.add('.');
          await git.commit(`[CodeFlow] Fix breaking change from ${analysisResults.service}`);
          await git.push('origin', branchName);

          // Get repo info from git remote
          const remotes = await git.getRemotes(true);
          const origin = remotes.find(r => r.name === 'origin');
          const match = origin.refs.fetch.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
          
          if (match) {
            const repoInfo = { owner: match[1], repo: match[2] };
            
            // Create PR
            const pr = await createPullRequest(
              octokit,
              repoInfo,
              branchName,
              fix.repo,
              analysisResults.analysis,
              fix.fix
            );
            
            prs.push({
              repo: fix.repo,
              pr: pr,
              url: pr.html_url
            });
          }
        } else {
          console.log(`⚠️  Could not find code to replace in ${fix.repo}`);
        }

      } catch (error) {
        console.error(`❌ Failed to create PR for ${fix.repo}:`, error.message);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  Created ${prs.length} Pull Request(s)! 🎉`);
    console.log('═══════════════════════════════════════════════════════\n');

    prs.forEach(pr => {
      console.log(`✅ ${pr.repo}: ${pr.url}`);
    });

    return prs;
  }

  /**
   * Parse fix output to extract old and new code
   */
  parseFix(fixText) {
    const beforeMatch = fixText.match(/BEFORE:[\s\S]*?```(?:javascript)?\n([\s\S]*?)```/);
    const afterMatch = fixText.match(/AFTER:[\s\S]*?```(?:javascript)?\n([\s\S]*?)```/);

    return {
      oldCode: beforeMatch ? beforeMatch[1].trim() : null,
      newCode: afterMatch ? afterMatch[1].trim() : null
    };
  }

  /**
   * Print dependency graph in a readable format
   */
  printDependencyGraph(graph) {
    console.log('📊 Dependency Graph:\n');
    
    for (const [providerName, provider] of Object.entries(graph.providers)) {
      console.log(`🔷 ${providerName} (Provider)`);
      provider.apis.forEach(api => {
        console.log(`   └─ ${api.method} ${api.endpoint}`);
      });
      
      if (provider.dependents.length > 0) {
        console.log(`   Consumed by:`);
        provider.dependents.forEach(dep => {
          console.log(`   └─ ${dep.service} → ${dep.endpoint}`);
        });
      }
      console.log();
    }
  }

  /**
   * Generate a summary report
   */
  generateReport(analysisResults) {
    const report = {
      timestamp: new Date().toISOString(),
      breakingChange: {
        service: analysisResults.service,
        endpoint: analysisResults.endpoint
      },
      impact: {
        totalReposAffected: analysisResults.affectedRepos.length,
        totalFilesAffected: analysisResults.affectedRepos.reduce(
          (sum, repo) => sum + repo.findings.length, 0
        )
      },
      fixes: analysisResults.fixes.map(f => ({
        repo: f.repo,
        filesFixed: f.files.length
      })),
      prs: analysisResults.prs || []
    };

    return report;
  }
}
