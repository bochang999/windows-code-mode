# Context7 API MCP Integration Guide

Context7 API MCP統合ガイド。技術ドキュメント高速検索システム。

---

## 🎯 概要

### Context7 APIとは

**ライブラリ・フレームワークのドキュメント検索API**
- 最新公式ドキュメント即座に取得
- npm/PyPI/Maven等のパッケージ対応
- コードスニペット・実例付き
- バージョン指定検索

### ユースケース

1. **Linear/Next.js最新ドキュメント取得**
2. **エラーメッセージ解決策検索**
3. **ライブラリAPI仕様確認**
4. **コードスニペット生成**

---

## 📦 セットアップ

### 1. APIキー取得

Context7公式サイト:
```
https://context7.com → Sign Up → API Keys → Create Key
```

### 2. APIキー保存

```powershell
Set-Content "$env:USERPROFILE\.context7-api-key" -Value "ctx7_YOUR_API_KEY_HERE"
```

### 3. Claude Desktop設定

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

---

## 🔧 基本的な使い方

### ライブラリドキュメント検索

```bash
# Linear GraphQL API
GET https://api.context7.com/v1/docs?library=linear&topic=graphql

# Next.js App Router
GET https://api.context7.com/v1/docs?library=nextjs&topic=app-router&version=14

# React Hooks
GET https://api.context7.com/v1/docs?library=react&topic=hooks
```

### PowerShellから呼び出し

```powershell
$ctx7Key = (Get-Content "$env:USERPROFILE\.context7-api-key" -Raw).Trim()

$response = Invoke-RestMethod `
    -Uri "https://api.context7.com/v1/docs" `
    -Method Get `
    -Headers @{
        "Authorization" = "Bearer $ctx7Key"
    } `
    -Body @{
        library = "linear"
        topic = "issue-update"
    }

Write-Host $response.documentation
```

---

## 📚 対応ライブラリ例

| ライブラリ | ID | 主要トピック |
|-----------|-----|------------|
| Linear API | `linear` | graphql, issues, webhooks |
| Next.js | `nextjs` | app-router, api-routes, deployment |
| React | `react` | hooks, components, context |
| Node.js | `nodejs` | fs, http, streams |
| TypeScript | `typescript` | types, interfaces, generics |

---

## 🎯 実用例

### エラー解決策検索

```powershell
# ESLintエラー "'window' is not defined"
$response = Invoke-RestMethod `
    -Uri "https://api.context7.com/v1/search" `
    -Headers @{ "Authorization" = "Bearer $ctx7Key" } `
    -Body @{
        query = "window is not defined ESLint"
        library = "eslint"
    }
```

### API仕様確認

```powershell
# Linear Issue Update mutation
$docs = Invoke-RestMethod `
    -Uri "https://api.context7.com/v1/docs" `
    -Headers @{ "Authorization" = "Bearer $ctx7Key" } `
    -Body @{
        library = "linear"
        topic = "issueUpdate"
    }

# GraphQL schemaが返される
```

---

## 💡 ベストプラクティス

### DO ✅

1. **バージョン指定**で最新情報取得
2. **キーワード検索**でピンポイント解決
3. **キャッシュ**で API呼び出し削減

### DON'T ❌

1. ❌ 大量連続リクエスト（Rate Limit注意）
2. ❌ APIキーをコードにハードコード

---

**Last Updated**: 2025-10-02
**Maintained By**: Windows AI Assistant Knowledge Hub
