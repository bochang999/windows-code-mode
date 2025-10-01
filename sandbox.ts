
const fs = require('fs');
const vm = require('vm');
const ts = require('typescript');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// --- API Implementation ---
// Mock DevTools
const ChromeDevToolsProxy = require(path.resolve(__dirname, '.chrome-devtools-proxy.js'));
const proxyLogic = new ChromeDevToolsProxy();
const devToolsApi = {
  devTools: (method: string, params: any): Promise<any> => {
    console.log(`[Sandbox] Calling devTools method: ${method}`);
    try {
      const result = proxyLogic.mockDevToolsResponse(method, params);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

// Notion API
const notionApi = {
  search: async (query: string): Promise<any> => {
    console.log(`[Sandbox] Calling Notion search with query: ${query}`);
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ query }),
    });
    console.log(`[Sandbox Debug] Notion API Response Status: ${response.status} ${response.statusText}`);
    console.log(`[Sandbox Debug] Notion API Response Headers:`, response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sandbox Debug] Notion API Raw Error Response:', errorText);
      throw new Error(`Notion API error: ${response.status} ${errorText}`);
    }
    const successText = await response.text();
    console.log('[Sandbox Debug] Notion API Raw Success Response:', successText);
    return JSON.parse(successText); // Manually parse after logging raw text
  }
};

const context7Api = {
  callTool: async (toolName: string, args: any): Promise<any> => {
    console.log(`[Sandbox] Calling Context7 tool: ${toolName} with args:`, args);
    const response = await fetch('https://mcp.context7.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'CONTEXT7_API_KEY': process.env.CONTEXT7_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Math.random().toString(36).substring(2, 15), // Unique ID for the request
        method: toolName,
        params: args,
      }),
    });
    console.log(`[Sandbox Debug] Context7 API Response Status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sandbox Debug] Context7 API Raw Error Response:', errorText);
      throw new Error(`Context7 API error: ${response.status} ${errorText}`);
    }
    const successText = await response.text();
    console.log('[Sandbox Debug] Context7 API Raw Success Response:', successText);
    // Parse SSE format: find the 'data:' line and extract JSON
    const dataLineMatch = successText.match(/data: ({.*})/);
    if (dataLineMatch && dataLineMatch[1]) {
      const jsonResponse = JSON.parse(dataLineMatch[1]);
      if (jsonResponse.error && jsonResponse.error.message === "Method not found") {
        throw new Error(`Context7 API error: Method '${toolName}' not found on server.`);
      }
      return jsonResponse;
    } else {
      throw new Error(`Context7 API: Unexpected response format: ${successText}`);
    }
  }
};

// Sequential Thinking API - Enhanced with Local Integration
let localSequentialThinking = null;
try {
  console.error('[DEBUG] Attempting to load local Sequential Thinking...');
  const { LocalSequentialThinking } = require(path.resolve(__dirname, 'local-sequential-thinking.js'));
  localSequentialThinking = new LocalSequentialThinking();
  console.error('[DEBUG] Local Sequential Thinking loaded successfully');
} catch (loadError) {
  console.error('[DEBUG] Failed to load local Sequential Thinking:', loadError.message);
  console.error('[DEBUG] Error stack:', loadError.stack);
  console.error('[DEBUG] Will use network-only fallback');
}

const sequentialThinkingApi = {
  callTool: async (toolName: string, args: any): Promise<any> => {
    console.log(`[Sandbox] Calling Sequential Thinking tool: ${toolName} with args:`, args);

    // Try local Sequential Thinking first (if available)
    if (localSequentialThinking) {
      try {
        console.log(`[Sandbox] Using local Sequential Thinking integration`);
        const result = await localSequentialThinking.callTool(toolName, args);
        console.log(`[Sandbox Debug] Local Sequential Thinking success`);
        return result;
      } catch (localError) {
        console.warn(`[Sandbox] Local Sequential Thinking failed: ${localError.message}`);
        // Continue to network fallback below
      }
    } else {
      console.log(`[Sandbox] Local Sequential Thinking not available`);
    }

    // Network fallback
    console.log(`[Sandbox] Using network Sequential Thinking server fallback...`);
    try {
      const response = await fetch('http://localhost:3001/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: Math.random().toString(36).substring(2, 15), method: toolName, params: args }),
      });

      console.log(`[Sandbox Debug] Network Sequential Thinking Response Status: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Sandbox Debug] Network Sequential Thinking Raw Error Response:', errorText);
        throw new Error(`Network Sequential Thinking API error: ${response.status} ${errorText}`);
      }

      const successText = await response.text();
      console.log('[Sandbox Debug] Network Sequential Thinking Raw Success Response:', successText);

      // Parse SSE format: find the 'data:' line and extract JSON
      const dataLineMatch = successText.match(/data: ({.*})/);
      if (dataLineMatch && dataLineMatch[1]) {
        const jsonResponse = JSON.parse(dataLineMatch[1]);
        if (jsonResponse.error) {
          throw new Error(`Network Sequential Thinking API error: ${jsonResponse.error.message}`);
        }
        return jsonResponse;
      } else {
        throw new Error(`Network Sequential Thinking API: Unexpected response format: ${successText}`);
      }

    } catch (networkError) {
      console.error(`[Sandbox] Sequential Thinking completely unavailable`);
      console.error(`[Sandbox] Network error: ${networkError.message}`);
      throw new Error(`Sequential Thinking unavailable: ${networkError.message}`);
    }
  }
};

// GitHub API
// fs already required at top
const githubApi = {
  // Repository operations
  getRepository: async (owner: string, repo: string): Promise<any> => {
    console.log(`[Sandbox] Fetching GitHub repository: ${owner}/${repo}`);
    const token = fs.readFileSync(process.env.HOME + '/.github-token', 'utf8').trim();
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Code-Mode-Sandbox'
      }
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // File operations
  getFile: async (owner: string, repo: string, path: string): Promise<any> => {
    console.log(`[Sandbox] Fetching GitHub file: ${owner}/${repo}/${path}`);
    const token = fs.readFileSync(process.env.HOME + '/.github-token', 'utf8').trim();
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Code-Mode-Sandbox'
      }
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Decode base64 content if it's a file
    if (data.content && data.encoding === 'base64') {
      data.decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
    }
    return data;
  },

  // Issues operations
  createIssue: async (owner: string, repo: string, title: string, body: string): Promise<any> => {
    console.log(`[Sandbox] Creating GitHub issue: ${owner}/${repo} - ${title}`);
    const token = fs.readFileSync(process.env.HOME + '/.github-token', 'utf8').trim();
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Code-Mode-Sandbox'
      },
      body: JSON.stringify({ title, body })
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Search operations
  searchRepositories: async (query: string): Promise<any> => {
    console.log(`[Sandbox] Searching GitHub repositories: ${query}`);
    const token = fs.readFileSync(process.env.HOME + '/.github-token', 'utf8').trim();
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Code-Mode-Sandbox'
      }
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
};

// Enhanced Linear API with intelligent search
const { EnhancedLinearApi } = require('./enhanced-linear-api.ts');
const enhancedLinearInstance = new EnhancedLinearApi();

const linearApi = {
  // Enhanced issues operations with identifier resolution
  getIssue: async (issueIdOrIdentifier: string): Promise<any> => {
    console.log(`[Sandbox] Fetching Linear issue: ${issueIdOrIdentifier}`);
    return await enhancedLinearInstance.getIssue(issueIdOrIdentifier);
  },

  // Search issue by identifier with progressive strategy
  findByIdentifier: async (identifier: string): Promise<any> => {
    console.log(`[Sandbox] Searching for Linear issue: ${identifier}`);
    const result = await enhancedLinearInstance.findIssueByIdentifier(identifier);

    if (result.found) {
      console.log(`[Sandbox] ✅ Found ${identifier} using ${result.searchMethod} search (searched ${result.totalSearched} issues)`);
      return { data: { issue: result.issue } };
    } else {
      console.log(`[Sandbox] ❌ Issue ${identifier} not found after comprehensive search`);
      throw new Error(`Issue ${identifier} not found`);
    }
  },

  // Get active issues (unchanged)
  getActiveIssues: async (): Promise<any> => {
    return await enhancedLinearInstance.getActiveIssues();
  },

  // Create issue
  createIssue: async (title: string, description: string): Promise<any> => {
    console.log(`[Sandbox] Creating Linear issue: ${title}`);
    const token = fs.readFileSync(process.env.HOME + '/.linear-api-key', 'utf8').trim();
    const teamId = fs.readFileSync(process.env.HOME + '/.linear-team-id', 'utf8').trim();
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `mutation { issueCreate(input: { title: "${title}", description: "${description}", teamId: "${teamId}" }) { success issue { id identifier title } } }`
      })
    });
    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Add comment
  addComment: async (issueId: string, body: string): Promise<any> => {
    return await enhancedLinearInstance.addComment(issueId, body);
  },

  // Update issue status
  updateIssueStatus: async (issueId: string, stateId: string): Promise<any> => {
    return await enhancedLinearInstance.updateIssueStatus(issueId, stateId);
  },

  // Cache statistics for debugging
  getCacheStats: (): any => {
    const stats = enhancedLinearInstance.getCacheStats();
    console.log(`[Sandbox] Linear cache stats: ${stats.totalIssues} issues, ${stats.totalIdentifiers} identifiers`);
    return stats;
  }
};


// --- Sandbox Execution ---
async function runSandbox(sourceFile: string) {
  console.log(`[Runner] Starting sandbox for ${sourceFile}...`);

  if (!fs.existsSync(sourceFile)) {
    console.error(`[Runner] Error: File not found: ${sourceFile}`);
    process.exit(1);
  }

  // 1. Read and Transpile TypeScript code
  const tsCode = fs.readFileSync(sourceFile, 'utf-8');
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;

  // 2. Setup Sandbox Context
  const sandboxContext = {
    mcp: {
        ...devToolsApi,
        notion: notionApi,
        context7: context7Api,
        sequentialThinking: sequentialThinkingApi, // Add Sequential Thinking API here
        github: githubApi, // Add GitHub API here
        linear: linearApi, // Add Linear API here
    },
    console: {
        ...console,
        log: (...args: any[]) => {
            // Redirect sandbox logs
            console.log('[Sandbox Log]', ...args);
        }
    },
    setTimeout,
    fetch, // Make fetch available in sandbox
  };
  
  const context = vm.createContext(sandboxContext);

  console.log('[Runner Debug] sandboxContext.mcp:', sandboxContext.mcp);
  console.log('[Runner Debug] sandboxContext.mcp.notion:', sandboxContext.mcp.notion);
  console.log('[Runner Debug] notionApi:', notionApi);
  console.log('[Runner Debug] sandboxContext.mcp.context7:', sandboxContext.mcp.context7);
  console.log('[Runner Debug] context7Api:', context7Api);
  console.log('[Runner Debug] sandboxContext.mcp.sequentialThinking:', sandboxContext.mcp.sequentialThinking);
  console.log('[Runner Debug] sequentialThinkingApi:', sequentialThinkingApi);
  console.log('[Runner Debug] sandboxContext.mcp.github:', sandboxContext.mcp.github);
  console.log('[Runner Debug] githubApi:', githubApi);
  console.log('[Runner Debug] sandboxContext.mcp.linear:', sandboxContext.mcp.linear);
  console.log('[Runner Debug] linearApi:', linearApi);

  // 3. Execute in Sandbox
  console.log('[Runner] Executing code in sandbox...');
  try {
    const script = new vm.Script(jsCode);
    const result = script.runInContext(context);

    // Handle async results
    if (result && typeof result.then === 'function') {
      await result;
    }
    console.log('[Runner] Sandbox execution finished.');
  } catch (error) {
    console.error('[Runner] Error during sandbox execution:', error);
  }
}

// --- Main ---
if (require.main === module) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('Usage: node sandbox.js <file-to-run.js>');
    process.exit(1);
  }
  (async () => {
    await runSandbox(path.resolve(targetFile));
  })();
}
