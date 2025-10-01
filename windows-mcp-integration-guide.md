# Windows MCP Integration Guide

## 🚀 導入済みMCPサーバー（Windows環境）

### 1. Sequential Thinking MCP ✅
**機能**: マルチステップ思考・問題解決パターン実装
**インストール**: Windows環境で動作確認済み

**起動方法**:
```powershell
# MCP Server起動
npx mcp-server-sequential-thinking
```

**統合方法（Claude Desktop）**:
```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-server-sequential-thinking"]
    }
  }
}
```

**使用例**:
```javascript
// sandbox.js内での呼び出し
const result = await mcp.sequentialThinking.callTool('sequentialthinking', {
  thought: 'Analyzing the problem step by step...',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
});
```

---

### 2. n8n-mcp ✅ 【新規導入】
**機能**: n8nワークフロー自動化ノード統合（536ノード対応）
**カバレッジ**:
- 99% ノードプロパティ
- 63.6% ノード操作
- 90% ドキュメント
- 263 AI対応ノード

**Repository**: https://github.com/czlonkowski/n8n-mcp

**インストール方法**:

#### Option 1: npx（推奨 - インストール不要）
```powershell
npx @n8n-mcp/server
```

#### Option 2: ローカルインストール
```powershell
npm install -g @n8n-mcp/server
n8n-mcp-server
```

#### Option 3: Docker
```powershell
docker run -p 3000:3000 czlonkowski/n8n-mcp
```

**Claude Desktop統合**:
```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n-mcp/server"]
    }
  }
}
```

**主要機能**:
```javascript
// n8n ノード情報取得
const nodeInfo = await mcp.n8n.getNodeInfo('HttpRequest');

// n8n ワークフロー操作
const nodes = await mcp.n8n.listNodes({ category: 'AI' });

// n8n ノード検索
const results = await mcp.n8n.searchNodes({ query: 'webhook' });
```

---

## 🔧 Sandbox統合アーキテクチャ

### 既存MCPサーバー（Termuxから移植）

```
sandbox.js
├── Notion API          # 日本語入力対応
├── Context7 API        # 技術ドキュメント
├── GitHub API          # リポジトリ操作
├── Linear API          # Issue管理（enhanced）
├── Chrome DevTools API # WebViewデバッグ
└── Sequential Thinking # 思考パターン（既存）
```

### 新規追加（Windows専用）

```
sandbox.js (拡張版)
├── n8n MCP             # ワークフロー自動化 【新規】
└── Future MCPs...      # 拡張予定
```

---

## 📝 sandbox.js 統合コード

### n8n MCP API Wrapper

```javascript
// n8n MCP API
const n8nApi = {
    getNodeInfo: async (nodeName) => {
        console.log(`[Sandbox] Getting n8n node info: ${nodeName}`);
        const response = await fetch('http://localhost:3000/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Math.random().toString(36).substring(2, 15),
                method: 'tools/call',
                params: {
                    name: 'get_node_info',
                    arguments: { nodeName }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`n8n MCP error: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    },

    listNodes: async (filters = {}) => {
        console.log(`[Sandbox] Listing n8n nodes with filters:`, filters);
        const response = await fetch('http://localhost:3000/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Math.random().toString(36).substring(2, 15),
                method: 'tools/call',
                params: {
                    name: 'list_nodes',
                    arguments: filters
                }
            })
        });

        if (!response.ok) {
            throw new Error(`n8n MCP error: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    },

    searchNodes: async (query) => {
        console.log(`[Sandbox] Searching n8n nodes: ${query}`);
        const response = await fetch('http://localhost:3000/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Math.random().toString(36).substring(2, 15),
                method: 'tools/call',
                params: {
                    name: 'search_nodes',
                    arguments: { query }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`n8n MCP error: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    }
};
```

### Sandbox Context更新

```javascript
const sandboxContext = {
    mcp: {
        ...devToolsApi,
        notion: notionApi,
        context7: context7Api,
        sequentialThinking: sequentialThinkingApi,
        github: githubApi,
        linear: linearApi,
        n8n: n8nApi, // ← 新規追加
    },
    console: { ...console },
    setTimeout,
    fetch,
};
```

---

## 🎯 実用例

### Example 1: n8nノード情報取得

```javascript
// examples/n8n-node-info.js
(async () => {
    // HTTPリクエストノードの情報取得
    const httpNode = await mcp.n8n.getNodeInfo('HttpRequest');
    console.log('HTTP Node Properties:', httpNode.properties);
    console.log('HTTP Node Operations:', httpNode.operations);

    // Webhookノード検索
    const webhookNodes = await mcp.n8n.searchNodes('webhook');
    console.log('Webhook Nodes:', webhookNodes);

    // AI対応ノード一覧
    const aiNodes = await mcp.n8n.listNodes({ category: 'AI' });
    console.log('AI Nodes:', aiNodes);
})();
```

### Example 2: Sequential Thinking + n8n統合

```javascript
// examples/workflow-design-thinking.js
(async () => {
    // Step 1: 問題分析
    await mcp.sequentialThinking.callTool('sequentialthinking', {
        thought: 'Analyzing workflow automation requirements...',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true
    });

    // Step 2: n8nノード検索
    const relevantNodes = await mcp.n8n.searchNodes('webhook http database');

    // Step 3: 設計検証
    await mcp.sequentialThinking.callTool('sequentialthinking', {
        thought: `Found ${relevantNodes.length} relevant nodes. Designing workflow structure...`,
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true
    });

    // Step 4: Linear Issue更新
    await mcp.linear.addComment('BOC-120', `Workflow design complete: ${relevantNodes.length} nodes identified`);
})();
```

### Example 3: Android開発自動化ワークフロー

```javascript
// examples/android-build-workflow.js
(async () => {
    // n8n Webhookノードでビルドトリガー受信設計
    const webhookNode = await mcp.n8n.getNodeInfo('Webhook');

    // Gradle + n8n統合
    const workflow = {
        trigger: webhookNode,
        actions: [
            'Build APK',
            'Run Tests',
            'Update Linear Issue',
            'Send Notion Notification'
        ]
    };

    console.log('Automated Android Build Workflow:', workflow);
})();
```

---

## 🔗 Windows環境セットアップ手順

### 1. MCP Servers起動確認

```powershell
# Sequential Thinking MCP
Start-Process powershell -ArgumentList "npx -y mcp-server-sequential-thinking"

# n8n MCP
Start-Process powershell -ArgumentList "npx -y @n8n-mcp/server"
```

### 2. Claude Desktop設定

```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-server-sequential-thinking"]
    },
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n-mcp/server"]
    }
  }
}
```

### 3. Sandbox統合テスト

```powershell
cd C:\Users\kirok\windows-code-mode
node sandbox.js examples/test-n8n-integration.js
```

---

## 📊 導入効果

### Sequential Thinking MCP
✅ 複雑な問題解決の構造化
✅ 段階的思考パターン実装
✅ デバッグプロセス最適化

### n8n MCP
✅ 536ノードへの即座アクセス
✅ ワークフロー自動化設計支援
✅ Android開発CI/CD統合
✅ Linear/Notion自動連携強化

---

## 🚧 次のステップ

- [ ] n8n MCP API Wrapper実装（sandbox.js更新）
- [ ] Windows環境動作テスト
- [ ] 実用例スクリプト作成
- [ ] Linear Issue BOC-116更新

---

**作成日**: 2025-10-02
**対象環境**: Windows + Claude Code
**関連Issue**: BOC-116（Windows Code Mode Sandbox）
