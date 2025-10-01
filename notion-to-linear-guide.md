# Notion MCP → Linear 日本語記入 完全ガイド

## 🎯 目的
PowerShellのエスケープ問題を完全回避して、日本語をLinearに記入する方法

---

## ✅ Step-by-Step 手順

### Step 1: Notionで日本語テキストを作成

```bash
# Notion MCPでページ作成
mcp__notion__API-post-page を使用

# パラメータ例:
{
  "parent": {
    "page_id": "既存のページID（任意）"
  },
  "properties": {
    "title": {
      "title": [
        {
          "text": {
            "content": "n8n + Sequential Thinking MCP導入報告"
          }
        }
      ]
    }
  }
}
```

**または、Notion Web UIで直接作成:**
1. https://notion.so を開く
2. 新規ページ作成
3. 日本語で導入手順を記入
4. ページIDをコピー（URLの最後の部分）

例: `https://notion.so/workspace/ページ名-4ff1705c5fd54f238c41500ab974e489`
→ ページID: `4ff1705c-5fd5-4f23-8c41-500ab974e489`

---

### Step 2: NotionページをMCPで取得

```bash
# Notionページ内容を取得
mcp__notion__API-retrieve-a-page page_id="4ff1705c-5fd5-4f23-8c41-500ab974e489"
```

**取得結果:**
- Notion APIが自動的にUTF-8でテキストを返す
- Claude Codeが内部でエスケープ処理を実行
- 文字化けなし

---

### Step 3: 取得した内容をLinearに投稿

**方法A: ~/.linear-utils.sh を使用（推奨）**

```bash
# NotionからテキストをコピーしてLinearコメント追加
~/.linear-utils.sh comment BOC-114 "
✅ 作業完了: n8n + Sequential Thinking MCP導入

## 実施作業
1. ✅ n8n MCPサーバー導入
   - インストール場所: C:\Users\kirok\n8n-mcp-server\
   - 起動方法: npm start

2. ✅ Sequential Thinking MCPサーバー導入
   - インストール場所: C:\Users\kirok\sequential-thinking-mcp\
   - ポート: 3001

作業時間: 2時間
"

# 必須: 即座に検証
~/.linear-utils.sh get BOC-114
```

**方法B: Linear MCP直接使用**

```bash
# Linear MCPでコメント作成
mcp__notion__API-create-a-comment を使用

# パラメータ:
{
  "parent": {
    "page_id": "4ff1705c-5fd5-4f23-8c41-500ab974e489"
  },
  "rich_text": [
    {
      "text": {
        "content": "[Notionから取得した日本語テキスト]"
      }
    }
  ]
}
```

---

## 🔧 実用例: 完全ワークフロー

### シナリオ: BOC-114にn8n + Sequential Thinking導入報告

```bash
# 1. Notion Web UIで報告書作成
# https://notion.so で新規ページ作成
# タイトル: "BOC-114 n8n + Sequential Thinking MCP導入報告"
# 内容: 詳細な導入手順を日本語で記入

# 2. ページIDを取得（URLから）
# 例: https://notion.so/workspace/BOC-114-abc123def456
# → ページID: abc123def456

# 3. Notion MCPでページ内容取得
mcp__notion__API-retrieve-a-page page_id="abc123def456"

# 4. 取得した内容をLinearに投稿
~/.linear-utils.sh comment BOC-114 "[Notionから取得したテキストをここに貼り付け]"

# 5. 検証（必須）
~/.linear-utils.sh get BOC-114
```

---

## 📝 テンプレート: NotionページにコピペするだけでOK

```markdown
✅ 作業完了: n8n MCP + Sequential Thinking MCP導入

## 実施作業

### 1. n8n MCPサーバー導入
- **インストール場所**: `C:\Users\kirok\n8n-mcp-server\`
- **起動方法**:
  ```bash
  cd C:\Users\kirok\n8n-mcp-server
  npm start
  ```
- **ポート**: 5678
- **認証**: API Key (設定済み)

### 2. Sequential Thinking MCPサーバー導入
- **インストール場所**: `C:\Users\kirok\sequential-thinking-mcp\`
- **起動方法**:
  ```bash
  cd C:\Users\kirok\sequential-thinking-mcp
  node server.js
  ```
- **ポート**: 3001
- **認証**: 不要（ローカル実行）

## 技術的詳細

### n8n MCP主要機能
- ワークフロー自動化
- API統合
- トリガー設定

### Sequential Thinking MCP主要機能
- 思考プロセスの段階的記録
- 複雑な問題解決支援
- 推論チェーン生成

## 接続テスト結果
- ✅ n8n MCP: 正常動作確認
- ✅ Sequential Thinking MCP: 正常動作確認

## 統合使用例
```javascript
// Sequential Thinkingを使った問題解決
const result = await mcp.sequentialThinking.callTool('think', {
  problem: 'Android APKビルドの最適化方法',
  steps: 5
});

// n8nでビルド自動化
await mcp.n8n.triggerWorkflow('android-build-pipeline');
```

## トラブルシューティング
- **ポート競合**: n8nが5678、Sequential Thinkingが3001を使用
- **起動失敗**: 依存関係インストール確認 `npm install`

作業時間: 約2時間
次のアクション: BOC-116 Windows Code Mode統合テスト
```

---

## 🚨 よくある質問

### Q1: "Notion MCPが使えない"と言われた

**A:** Notion統合トークンを確認

```bash
# 環境変数確認
echo $NOTION_API_KEY

# トークン設定（Windows PowerShell）
$env:NOTION_TOKEN = "YOUR_NOTION_API_KEY_HERE"
```

### Q2: "ページIDがわからない"

**A:** Notion URLから取得

```
https://www.notion.so/workspace/ページタイトル-4ff1705c5fd54f238c41500ab974e489
                                              ↑ この32文字がページID ↑
```

ハイフン付きフォーマット: `4ff1705c-5fd5-4f23-8c41-500ab974e489`

### Q3: "~/.linear-utils.sh が動かない"

**A:** Windows環境では別のコマンド

```powershell
# Windows PowerShellでLinear APIを直接呼ぶ
$apiKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
$headers = @{
    'Authorization' = $apiKey.Trim()
    'Content-Type' = 'application/json; charset=utf-8'
}

$body = @{
    query = 'mutation { commentCreate(input: { issueId: "4ff1705c-5fd5-4f23-8c41-500ab974e489", body: "[Notionテキスト]" }) { success } }'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://api.linear.app/graphql' -Method Post -Headers $headers -Body $body
```

---

## 🎯 最短ルート（これをやれば確実）

### Windows PC Claude Codeに伝える手順

```
1. Notion Web UI (https://notion.so) で報告書作成
   - タイトル: "BOC-114 n8n + Sequential Thinking MCP導入"
   - 本文: 上記テンプレートをコピペして編集

2. ページIDをコピー（URLの最後の32文字）

3. Claude Codeに以下を指示:
   "mcp__notion__API-retrieve-a-page でページID [コピーしたID] を取得して、
    その内容をBOC-114 (UUID: 4ff1705c-5fd5-4f23-8c41-500ab974e489) に
    コメントとして追加して"

4. 検証:
   "~/.linear-utils.sh get BOC-114 で最新コメントを確認して"
```

---

## 📚 関連リソース

- **BOC-114 UUID**: `4ff1705c-5fd5-4f23-8c41-500ab974e489`
- **Linear API Key**: Stored in `~/.linear-api-key` (Termux) or `%USERPROFILE%\.linear-api-key` (Windows)
- **Notion Token**: Environment variable `NOTION_API_KEY`
- **linear_issue_management.md**: `/data/data/com.termux/files/home/ai-assistant-knowledge-hub/workflows/linear_issue_management.md`

---

**作成日**: 2025-10-01
**対象**: Windows PC Claude Code
**目的**: PowerShellエスケープ問題の完全回避
