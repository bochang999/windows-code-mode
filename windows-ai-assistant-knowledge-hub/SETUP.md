# Windows AI Assistant Knowledge Hub - Setup Guide

Windows環境でAI協業ナレッジベースシステムをセットアップする詳細ガイド。

---

## 📋 前提条件

### 必須ソフトウェア
- **Windows 10/11** (64-bit)
- **PowerShell 5.1+** (Windows標準搭載)
- **Node.js 18+** (https://nodejs.org/)
- **Git for Windows** (https://git-scm.com/download/win)

### 確認コマンド
```powershell
# PowerShellバージョン確認
$PSVersionTable.PSVersion

# Node.jsバージョン確認
node --version
npm --version

# Git確認
git --version
```

**期待値**:
- PowerShell: 5.1 以上
- Node.js: v18.0.0 以上
- Git: 2.30 以上

---

## 🚀 Phase 1: プロジェクトクローン (5分)

### 1-1. リポジトリクローン
```powershell
# 開発ディレクトリ移動
cd $env:USERPROFILE\dev

# クローン
git clone https://github.com/bochang999/windows-ai-assistant-knowledge-hub.git
cd windows-ai-assistant-knowledge-hub
```

### 1-2. 構造確認
```powershell
# ディレクトリツリー表示
tree /F

# 主要ファイル確認
ls README.md, SETUP.md, workflows\
```

---

## 🔑 Phase 2: APIキー設定 (15分)

### 2-1. テンプレートコピー
```powershell
# .env.example → .env
Copy-Item config\api-keys-template.json .env
```

### 2-2. APIキー取得

**Linear API Key**:
1. https://linear.app/settings/api にアクセス
2. "Create API key" → Personal API key作成
3. フォーマット: `lin_api_xxxxx`

**GitHub Token**:
1. https://github.com/settings/tokens にアクセス
2. "Generate new token (classic)"
3. 権限: `repo`, `read:user`
4. フォーマット: `ghp_xxxxx`

**Notion API Key**:
1. https://www.notion.so/my-integrations にアクセス
2. "New integration" → Internal integration作成
3. フォーマット: `secret_xxxxx`

**Context7 API Key**:
1. https://context7.com/dashboard にアクセス
2. API key取得
3. フォーマット: `ctx7_xxxxx`

### 2-3. APIキー設定（推奨: 別ファイル保存）

**方法A: ホームディレクトリ保存（推奨）**
```powershell
# Linearキー
echo "lin_api_your_key_here" > $env:USERPROFILE\.linear-api-key

# GitHubトークン
echo "ghp_your_token_here" > $env:USERPROFILE\.github-token

# Linear Team ID
echo "your_team_id_here" > $env:USERPROFILE\.linear-team-id

# 確認
cat $env:USERPROFILE\.linear-api-key
```

**方法B: .envファイル（代替）**
```powershell
# .envファイル編集
notepad .env

# 以下の形式で記入:
# LINEAR_API_KEY=lin_api_xxxxx
# GITHUB_TOKEN=ghp_xxxxx
# NOTION_API_KEY=secret_xxxxx
# CONTEXT7_API_KEY=ctx7_xxxxx
```

### 2-4. セキュリティ確認
```powershell
# .gitignore確認（APIキーブロック）
cat .gitignore | Select-String -Pattern ".env|.key|secret"

# 期待値:
# .env
# *.key
# *-token
# *secret*
```

---

## 🔧 Phase 3: MCP Servers設定 (20分)

### 3-1. Sequential Thinking MCPインストール
```powershell
# グローバルインストール
npm install -g mcp-server-sequential-thinking

# 動作確認
npx mcp-server-sequential-thinking --version
```

### 3-2. n8n MCPインストール
```powershell
# グローバルインストール
npm install -g @n8n-mcp/server

# 動作確認
npx @n8n-mcp/server --version
```

### 3-3. Claude Desktop設定

**設定ファイル場所**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**編集コマンド**:
```powershell
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

**設定内容**:
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
      "args": ["-y", "@notionhq/client"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "context7-mcp-server"]
    }
  }
}
```

### 3-4. Claude Desktop再起動
```powershell
# Claude Desktop終了 → 再起動
# MCP Servers接続確認（Claude Desktopインターフェース）
```

---

## ✅ Phase 4: 動作確認テスト (10分)

### 4-1. MCP Servers検証
```powershell
# 検証スクリプト実行
.\scripts\validate-mcp-servers.ps1
```

**期待される出力**:
```
✅ Sequential Thinking MCP: Connected
✅ n8n MCP: Connected (536 nodes available)
✅ Notion API: Connected
✅ Context7 API: Connected
```

### 4-2. Linear API接続テスト
```powershell
# Linear Team ID取得
$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw

$body = @{
    query = "query { viewer { id name email } }"
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

**期待される出力**:
```json
{
  "data": {
    "viewer": {
      "id": "xxxxx",
      "name": "Your Name",
      "email": "your@email.com"
    }
  }
}
```

### 4-3. PowerShell自動化スクリプトテスト
```powershell
# Linear Issue状態更新テスト
.\scripts\sync-linear-status.ps1 `
    -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8" `
    -Status InProgress
```

**期待される出力**:
```
✅ Status updated to InProgress
   Issue: BOC-116
   State: In Progress
```

---

## 🎓 Phase 5: 実用例チャレンジ (15分)

### 5-1. Linear Issue管理ワークフロー実践
```powershell
# 1. Issue開始
.\scripts\sync-linear-status.ps1 -IssueId "your_issue_id" -Status InProgress

# 2. 作業実施（例: コード実装）
# ... your development work ...

# 3. コメント追加 + 完了
.\scripts\add-linear-comment.ps1 `
    -IssueId "your_issue_id" `
    -Body "作業完了: 機能実装・テスト完了"
```

### 5-2. MCP統合開発パターン
参照: `workflows/windows-mcp-integration.md`

### 5-3. Android開発自動化
参照: `workflows/android-build-automation.md`

---

## 🔧 トラブルシューティング

### エラー1: `Cannot find path '\.linear-api-key'`

**原因**: APIキーファイル未作成
**対処**:
```powershell
echo "lin_api_your_key_here" > $env:USERPROFILE\.linear-api-key
cat $env:USERPROFILE\.linear-api-key
```

### エラー2: `Invoke-RestMethod: 401 Unauthorized`

**原因**: APIキー無効
**対処**:
```powershell
# APIキー再取得
# Linear: https://linear.app/settings/api
# GitHub: https://github.com/settings/tokens

# 再保存
echo "lin_api_new_key" > $env:USERPROFILE\.linear-api-key
```

### エラー3: `MCP Server not found`

**原因**: MCPサーバー未インストール
**対処**:
```powershell
# Sequential Thinking
npm install -g mcp-server-sequential-thinking

# n8n
npm install -g @n8n-mcp/server

# Claude Desktop再起動
```

### エラー4: `PowerShell Execution Policy`

**原因**: スクリプト実行ポリシー制限
**対処**:
```powershell
# 実行ポリシー確認
Get-ExecutionPolicy

# Unrestricted設定（管理者権限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### エラー5: `Path contains spaces`

**原因**: パスにスペース含む（PowerShell制約）
**対処**:
```powershell
# クォート使用
cd "C:\Users\User Name\dev\project"

# または短縮パス使用
cd C:\Users\USERNA~1\dev\project
```

---

## 📋 セットアップチェックリスト

### 必須項目
- [ ] PowerShell 5.1+ インストール済み
- [ ] Node.js 18+ インストール済み
- [ ] Git for Windows インストール済み
- [ ] リポジトリクローン完了
- [ ] `~\.linear-api-key` ファイル作成
- [ ] `~\.github-token` ファイル作成
- [ ] Sequential Thinking MCP インストール済み
- [ ] n8n MCP インストール済み
- [ ] Claude Desktop設定完了
- [ ] Linear API接続テスト成功
- [ ] MCP Servers検証完了
- [ ] PowerShellスクリプト動作確認

### 推奨項目
- [ ] Notion API Key設定
- [ ] Context7 API Key設定
- [ ] Pre-commit hook設定
- [ ] ワークフローマニュアル熟読
- [ ] テンプレート確認

---

## 🎯 次のステップ

### 初級（環境構築完了後）
1. **workflows/linear_issue_management.md**: Linear管理ワークフロー実践
2. **workflows/api-key-security/**: セキュリティ管理習得
3. **templates/linear-issue-report.md**: レポート作成

### 中級（MCP統合）
1. **workflows/windows-mcp-integration.md**: MCP活用パターン
2. **workflows/powershell-automation.md**: 自動化スクリプト開発
3. **workflows/mcp-servers/**: 各MCPサーバー詳細ガイド

### 上級（開発自動化）
1. **workflows/android-build-automation.md**: CI/CD構築
2. **templates/workflow-design.md**: カスタムワークフロー設計
3. **workflows/code_quality/**: 品質管理システム構築

---

## 📞 サポート

**ドキュメント**:
- README.md: システム概要
- workflows/troubleshooting/: よくあるエラー集
- GitHub Issues: 問題報告

**Linear連携**:
- BOC-116: Windows Code Mode Sandbox統合

**外部リソース**:
- Sequential Thinking MCP: https://github.com/sequentialthinking/mcp-server
- n8n MCP: https://github.com/czlonkowski/n8n-mcp
- Linear API: https://developers.linear.app/docs

---

**セットアップ完了推定時間**: 75分
**最終更新**: 2025-10-02
**バージョン**: 1.0.0
