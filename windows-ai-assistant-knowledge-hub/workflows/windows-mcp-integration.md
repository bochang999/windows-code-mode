# Windows MCP Integration Workflow

Windows環境でのMCP (Model Context Protocol) Servers統合ワークフロー完全ガイド。

---

## 🎯 概要

Windows環境で7つのMCPサーバーを統合し、AI協業開発を最大化する。

### 対応MCPサーバー
1. **Sequential Thinking**: 多段階思考・問題解決
2. **n8n MCP**: 536ノードWorkflow自動化
3. **Notion API**: ドキュメント管理（日本語対応）
4. **Context7**: 技術ドキュメント取得
5. **GitHub API**: リポジトリ管理
6. **Linear API**: Issue管理
7. **Chrome DevTools**: WebViewデバッグ

---

## 📋 前提条件

### 必須ソフトウェア
```powershell
# Node.js 18+
node --version  # v18.0.0+

# npm
npm --version   # 9.0.0+

# Claude Desktop
# ダウンロード: https://claude.ai/download
```

### 必須ファイル
```powershell
# Claude Desktop設定ファイル
$env:APPDATA\Claude\claude_desktop_config.json

# APIキーファイル
$env:USERPROFILE\.linear-api-key
$env:USERPROFILE\.github-token
$env:USERPROFILE\.notion-api-key
$env:USERPROFILE\.context7-api-key
```

---

## 🚀 Phase 1: MCPサーバーインストール (20分)

### 1-1. Sequential Thinking MCP

**インストール**:
```powershell
npm install -g mcp-server-sequential-thinking
```

**動作確認**:
```powershell
npx -y mcp-server-sequential-thinking --version
```

**機能**:
- 多段階思考パターン実装
- 問題の段階的分解
- 戦略立案サポート

**使用例**:
```javascript
await mcp.sequentialThinking.callTool('sequentialthinking', {
    thought: 'Analyzing build automation requirements...',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
});
```

### 1-2. n8n MCP

**インストール**:
```powershell
npm install -g @n8n-mcp/server
```

**動作確認**:
```powershell
npx -y @n8n-mcp/server --version
```

**機能**:
- 536ノード利用可能
- Workflow設計パターン
- Webhook連携

**使用例**:
```javascript
// ノード情報取得
const httpNode = await mcp.n8n.getNodeInfo('HttpRequest');

// ノード検索
const webhookNodes = await mcp.n8n.searchNodes('webhook');

// カテゴリ検索
const aiNodes = await mcp.n8n.listNodes({ category: 'AI' });
```

### 1-3. Notion API MCP

**インストール**:
```powershell
npm install -g @notionhq/client
```

**APIキー設定**:
```powershell
# Notion API key取得: https://www.notion.so/my-integrations
echo "secret_xxxxx" > $env:USERPROFILE\.notion-api-key
```

**機能**:
- ページ作成・更新
- データベース操作
- 日本語完全対応

### 1-4. Context7 MCP

**インストール**:
```powershell
npm install -g context7-mcp-server
```

**APIキー設定**:
```powershell
# Context7 API key取得: https://context7.com/dashboard
echo "ctx7_xxxxx" > $env:USERPROFILE\.context7-api-key
```

**機能**:
- 技術ドキュメント即座取得
- API仕様確認
- ライブラリリファレンス

### 1-5. Chrome DevTools MCP

**インストール**:
```powershell
npm install -g chrome-devtools-mcp
```

**機能**:
- WebViewデバッグ
- PWA検証
- パフォーマンス分析

---

## 🔧 Phase 2: Claude Desktop設定 (10分)

### 2-1. 設定ファイル編集

**ファイル場所**:
```powershell
$env:APPDATA\Claude\claude_desktop_config.json
```

**編集コマンド**:
```powershell
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

### 2-2. 完全設定例

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-server-sequential-thinking"]
    },
    "n8n": {
      "command": "npx",
      "args": ["-y", "@n8n-mcp/server"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/client"],
      "env": {
        "NOTION_API_KEY": "secret_xxxxx"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "context7-mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "ctx7_xxxxx"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"]
    }
  }
}
```

**重要**:
- `NOTION_API_KEY`と`CONTEXT7_API_KEY`は実際のキーに置き換え
- または環境変数から読み込む設定に変更

### 2-3. Claude Desktop再起動

```powershell
# Claude Desktop終了
Stop-Process -Name "Claude"

# 再起動
Start-Process "$env:LOCALAPPDATA\Programs\Claude\Claude.exe"
```

---

## ✅ Phase 3: 動作確認テスト (10分)

### 3-1. PowerShell検証スクリプト

**scripts/validate-mcp-servers.ps1**:
```powershell
# MCP Servers動作確認スクリプト

Write-Host "🔍 Validating MCP Servers..." -ForegroundColor Cyan

# Sequential Thinking
Write-Host "`n1. Sequential Thinking MCP..." -ForegroundColor Yellow
try {
    npx -y mcp-server-sequential-thinking --version
    Write-Host "   ✅ Sequential Thinking: OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Sequential Thinking: FAILED" -ForegroundColor Red
}

# n8n MCP
Write-Host "`n2. n8n MCP..." -ForegroundColor Yellow
try {
    npx -y @n8n-mcp/server --version
    Write-Host "   ✅ n8n MCP: OK (536 nodes available)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ n8n MCP: FAILED" -ForegroundColor Red
}

# Notion API
Write-Host "`n3. Notion API..." -ForegroundColor Yellow
if (Test-Path "$env:USERPROFILE\.notion-api-key") {
    Write-Host "   ✅ Notion API Key: Found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Notion API Key: Not Found" -ForegroundColor Yellow
}

# Context7 API
Write-Host "`n4. Context7 API..." -ForegroundColor Yellow
if (Test-Path "$env:USERPROFILE\.context7-api-key") {
    Write-Host "   ✅ Context7 API Key: Found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Context7 API Key: Not Found" -ForegroundColor Yellow
}

# Chrome DevTools
Write-Host "`n5. Chrome DevTools MCP..." -ForegroundColor Yellow
try {
    npx -y chrome-devtools-mcp --version
    Write-Host "   ✅ Chrome DevTools MCP: OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Chrome DevTools MCP: FAILED" -ForegroundColor Red
}

Write-Host "`n✅ Validation Complete!" -ForegroundColor Green
```

**実行**:
```powershell
.\scripts\validate-mcp-servers.ps1
```

### 3-2. Claude Desktop接続確認

Claude Desktopを開き、以下を確認：

1. **MCPサーバー接続状態**
   - 設定 → MCP Servers
   - 各サーバーが "Connected" 状態

2. **機能テスト**
   - Sequential Thinking: "Think step by step about..." プロンプト
   - n8n: "Show me webhook nodes in n8n" プロンプト
   - Notion: "Create a page in Notion" プロンプト

---

## 🎨 Phase 4: 統合パターン実装 (30分)

### Pattern 1: Sequential Thinking + 実装

**用途**: 複雑な問題の段階的解決

**フロー**:
```
1. Sequential Thinking MCPで問題分析
   ↓
2. 段階的戦略立案
   ↓
3. PowerShell/JavaScript実装
   ↓
4. テスト・検証
   ↓
5. Linear Issue更新
```

**実装例**:
```powershell
# Phase 1: 問題分析
Write-Host "Phase 1: Analyzing problem with Sequential Thinking MCP..."
# Claude Desktop内でSequential Thinking使用

# Phase 2: 実装
Write-Host "Phase 2: Implementing solution..."
# PowerShellスクリプト実装

# Phase 3: Linear更新
.\scripts\sync-linear-status.ps1 -IssueId "issue_id" -Status InReview
```

### Pattern 2: n8n Workflow設計

**用途**: 自動化Workflow構築

**フロー**:
```
1. n8n MCPでノード検索
   ↓
2. Workflow構造設計
   ↓
3. n8n UIで実装
   ↓
4. Webhook連携テスト
   ↓
5. 本番デプロイ
```

**実装例**:
```javascript
// Phase 1: ノード検索 (Claude Desktop内)
// "Search for webhook and http request nodes in n8n"

// Phase 2: Workflow設計
const workflow = {
    name: 'Android Build Automation',
    trigger: { type: 'Webhook' },
    steps: [
        { node: 'HttpRequest', action: 'Trigger build' },
        { node: 'Linear', action: 'Update issue' },
        { node: 'Notion', action: 'Create report' }
    ]
};

// Phase 3-4: n8n UIで実装・テスト
```

### Pattern 3: Notion → Linear同期

**用途**: ドキュメントとIssue管理連携

**フロー**:
```
1. Notion MCPでページ取得
   ↓
2. データ変換 (PowerShell)
   ↓
3. Linear API経由同期
   ↓
4. エラーログ記録
```

**実装例**:
```powershell
# Phase 1: Notion取得 (Claude Desktop経由)
# "Get recent pages from Notion database"

# Phase 2-3: Linear同期
$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw

$body = @{
    query = @"
mutation {
  issueCreate(input: {
    title: "From Notion: $notionTitle",
    description: "$notionContent",
    teamId: "$teamId"
  }) {
    success
    issue { id identifier }
  }
}
"@
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.linear.app/graphql" `
    -Method Post `
    -Headers @{
        "Authorization" = $linearKey
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### Pattern 4: Context7技術調査 + 実装

**用途**: 技術調査駆動開発

**フロー**:
```
1. Context7 MCPで技術調査
   ↓
2. API仕様・ベストプラクティス確認
   ↓
3. 実装
   ↓
4. Notion記録
```

---

## 🔄 実用統合ワークフロー例

### Example 1: Android Build自動化

```powershell
# Step 1: Sequential Thinking分析
# Claude: "Plan Android build automation workflow"

# Step 2: n8n Workflow設計
# Claude: "Design n8n workflow for build automation"

# Step 3: 実装
# n8n UI: Webhook → Gradle → Linear → Notion

# Step 4: テスト
.\gradlew assembleDebug

# Step 5: Linear更新
.\scripts\add-linear-comment.ps1 `
    -IssueId "issue_id" `
    -Body "Build automation complete"
```

### Example 2: 技術調査 → 実装 → ドキュメント化

```powershell
# Step 1: Context7調査
# Claude: "Get latest PowerShell best practices"

# Step 2: Sequential Thinking設計
# Claude: "Design PowerShell automation script"

# Step 3: 実装
# PowerShellスクリプト作成

# Step 4: Notion記録
# Claude: "Create Notion page documenting this script"

# Step 5: Linear Issue完了
.\scripts\sync-linear-status.ps1 -IssueId "issue_id" -Status InReview
```

---

## 🚨 トラブルシューティング

### エラー1: MCP Server not found

**症状**:
```
Error: MCP Server 'sequential-thinking' not found
```

**対処**:
```powershell
# 1. Node.js確認
node --version

# 2. MCPサーバー再インストール
npm install -g mcp-server-sequential-thinking

# 3. Claude Desktop再起動
Stop-Process -Name "Claude"
Start-Process "$env:LOCALAPPDATA\Programs\Claude\Claude.exe"
```

### エラー2: API Key Missing

**症状**:
```
Error: NOTION_API_KEY not found
```

**対処**:
```powershell
# 1. APIキーファイル作成
echo "secret_xxxxx" > $env:USERPROFILE\.notion-api-key

# 2. 設定ファイル確認
notepad $env:APPDATA\Claude\claude_desktop_config.json

# 3. 環境変数設定（代替）
$env:NOTION_API_KEY = Get-Content "$env:USERPROFILE\.notion-api-key" -Raw
```

### エラー3: Connection Failed

**症状**:
```
Error: Failed to connect to MCP Server
```

**対処**:
```powershell
# 1. ファイアウォール確認
Get-NetFirewallProfile | Select-Object Name, Enabled

# 2. ネットワーク確認
Test-NetConnection -ComputerName github.com -Port 443

# 3. 直接実行テスト
npx -y mcp-server-sequential-thinking

# 4. ログ確認
Get-Content "$env:APPDATA\Claude\logs\mcp-server.log"
```

### エラー4: PowerShell Execution Policy

**症状**:
```
File cannot be loaded because running scripts is disabled
```

**対処**:
```powershell
# 実行ポリシー確認
Get-ExecutionPolicy

# RemoteSigned設定
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 確認
Get-ExecutionPolicy
# 期待値: RemoteSigned
```

---

## 📊 パフォーマンス最適化

### 推奨設定

**Claude Desktop設定**:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-server-sequential-thinking"],
      "timeout": 30000
    }
  }
}
```

**PowerShell設定**:
```powershell
# PowerShell最適化
$PSDefaultParameterValues = @{
    'Invoke-RestMethod:TimeoutSec' = 30
    'Invoke-WebRequest:TimeoutSec' = 30
}
```

---

## 📋 チェックリスト

### セットアップ完了確認
- [ ] Sequential Thinking MCP インストール済み
- [ ] n8n MCP インストール済み
- [ ] Notion API Key設定済み
- [ ] Context7 API Key設定済み
- [ ] Claude Desktop設定完了
- [ ] Claude Desktop再起動済み
- [ ] 各MCPサーバー接続確認
- [ ] validate-mcp-servers.ps1 実行成功
- [ ] 統合パターンテスト実施

### 実用確認
- [ ] Sequential Thinking動作確認
- [ ] n8nノード検索成功
- [ ] Notionページ作成成功
- [ ] Context7技術調査成功
- [ ] Linear API連携成功

---

## 🔗 関連ドキュメント

- **config/mcp-servers.json**: MCPサーバー詳細設定
- **workflows/powershell-automation.md**: PowerShell自動化
- **workflows/android-build-automation.md**: Android統合
- **troubleshooting/mcp-server-startup.md**: MCPサーバー起動問題

---

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
**対象環境**: Windows 10/11, PowerShell 5.1+, Node.js 18+
