# Windows PC Claude Code向け: Linear日本語記入ガイド

## 📋 重要: BOC-114への作業報告手順

### ✅ 成功する方法（Notion MCP経由）

```bash
# Step 1: Notion MCPで日本語テキスト作成
mcp__notion__API-post-page で新規ページ作成

# Step 2: 作成したページIDを使ってLinearコメント追加
~/.linear-utils.sh comment BOC-114 "作業報告内容"

# Step 3: 必ず検証（マニュアル必須）
~/.linear-utils.sh get BOC-114
```

## 📝 n8n + Sequential Thinking MCP導入手順書のフォーマット

### テンプレート

```markdown
✅ 作業完了: n8n MCP + Sequential Thinking MCP導入

## 実施作業
1. ✅ n8n MCPサーバー導入
   - インストール場所: C:\Users\kirok\n8n-mcp-server\
   - 起動方法: [具体的なコマンド]
   - 認証方法: [API Key/OAuth等]

2. ✅ Sequential Thinking MCPサーバー導入
   - インストール場所: C:\Users\kirok\sequential-thinking-mcp\
   - 起動方法: [具体的なコマンド]
   - ポート: [ポート番号]

## 技術的詳細

### n8n MCP機能
- [主要機能1]
- [主要機能2]
- [主要機能3]

### Sequential Thinking MCP機能
- [主要機能1]
- [主要機能2]

## 接続テスト結果
- n8n MCP: [成功/失敗]
- Sequential Thinking MCP: [成功/失敗]

## 統合例
[実際の使用例コード]

## トラブルシューティング
- 問題1: [解決方法]
- 問題2: [解決方法]

作業時間: [所要時間]
```

## 🚨 重要な注意点

### PowerShell UTF-8設定（必須）

```powershell
# スクリプト先頭に必ず追加
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

### GraphQL文字列エスケープ問題の回避

**❌ 失敗する方法:**
```powershell
# 直接日本語をGraphQLに埋め込む（文字化けする）
$body = "mutation { ... description: \"日本語\" ... }"
```

**✅ 成功する方法（3つ）:**

1. **Notion MCP経由（最推奨）**
   - Notionで日本語テキスト作成
   - MCP経由で取得・転送
   - Claude Codeが自動的にUTF-8処理

2. **Base64エンコード方式**
```powershell
$content = Get-Content "report.txt" -Raw -Encoding UTF8
$base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
# Base64をLinear APIに送信
```

3. **Linear Web UI直接編集**
   - https://linear.app にアクセス
   - BOC-114を開いて直接編集

## 📊 linear_issue_management.md マニュアルルール

### 必須実行項目

1. **作業開始時**: 自動的に "In Progress" に変更
2. **作業完了時**: 内容・コード記録後 "In Review" に変更
3. **コメント追加後**: 必ず `~/.linear-utils.sh get BOC-XX` で検証

### コメント追加の正しいフロー

```bash
# 1. コメント追加
~/.linear-utils.sh comment BOC-114 "作業内容"

# 2. 即座に検証（絶対必須！）
~/.linear-utils.sh get BOC-114

# 3. 最新コメントのcreatedAtを確認
# 追加時刻とズレがあれば自動化システム障害として対応
```

## 🎯 Windows PC Claude Codeへの指示例

```
ai-assistant-knowledge-hubのlinear_issue_management.mdマニュアルに従って
BOC-114に作業報告書を追記して。

昨日導入したn8n MCPとSequential Thinking MCPの手順を以下の形式で記録：

1. インストール場所と起動方法
2. 認証設定
3. 主要機能一覧
4. 接続テスト結果
5. 実際の使用例

Notion MCP経由で日本語記入すること。
```

## 🔧 トラブルシューティング

### 問題: "そんなの知らない、何それ"と言われる

**原因**: Windows PC Claude Codeは別セッション（記憶なし）

**解決策**:
1. このガイドファイルを渡す
2. BOC-114の最新コメント（日本語記入ガイド）を読ませる
3. linear_issue_management.mdの場所を明示

```bash
# Windows PC Claude Codeに指示
"まず以下を読んで：
1. /data/data/com.termux/files/home/ai-assistant-knowledge-hub/workflows/linear_issue_management.md
2. BOC-114の最新コメント（日本語記入方法）
3. windows-mcp-guide.md（このファイル）

その後、n8n + Sequential Thinking MCP導入手順をBOC-114に追記して"
```

### 問題: 日本語が文字化けする

**解決策**: Notion MCP経由を使用
```bash
# 1. Notionで手順書作成
mcp__notion__API-post-page で作成

# 2. Linear転送
~/.linear-utils.sh comment BOC-114 "[Notionから取得した内容]"

# 3. 検証
~/.linear-utils.sh get BOC-114
```

### 問題: jqが見つからない

```powershell
# PATH更新
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

# 確認
jq --version
```

## 📚 参考リソース

- **BOC-114**: MCP統合環境操作マニュアル（日本語記入ガイド含む）
- **BOC-116**: Windows Code Mode Sandbox プロジェクト計画
- **linear_issue_management.md**: Linearワークフロー必須ルール
- **GitHub**: https://github.com/bochang999/windows-code-mode

---

**作成日**: 2025-10-01
**対象**: Windows PC Claude Code
**目的**: Termux側の知識をWindows側に正確に伝達
