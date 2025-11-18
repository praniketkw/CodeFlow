import express from 'express';
import { MultiRepoManager } from '../multi-repo-manager.js';
import { CrossRepoAnalyzer } from '../cross-repo-analyzer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const repoManager = new MultiRepoManager();
const analyzer = new CrossRepoAnalyzer();

// API Routes

/**
 * Get all configured repositories
 */
app.get('/api/repos', (req, res) => {
  const repos = repoManager.getAllRepos();
  res.json(repos);
});

/**
 * Get dependency graph
 */
app.get('/api/dependency-graph', (req, res) => {
  const graph = repoManager.buildDependencyGraph();
  res.json(graph);
});

/**
 * Sync all repositories
 */
app.post('/api/sync', async (req, res) => {
  try {
    const results = await repoManager.syncRepositories();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Analyze breaking change
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { serviceName, endpoint, oldCode, newCode } = req.body;
    
    if (!serviceName || !endpoint || !oldCode || !newCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const results = await analyzer.analyzeBreakingChange(
      serviceName,
      endpoint,
      oldCode,
      newCode
    );

    const report = analyzer.generateReport(results);
    
    res.json({ success: true, results, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get analysis history
 */
app.get('/api/history', (req, res) => {
  const historyPath = path.join(__dirname, '../../analysis-history.json');
  
  if (fs.existsSync(historyPath)) {
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    res.json(history);
  } else {
    res.json([]);
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CodeFlow Dashboard');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log('\n═══════════════════════════════════════════════════════\n');
});
