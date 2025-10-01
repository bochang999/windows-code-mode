# Windows Development Principles

Windows環境でのAI協業開発における特有の原則とベストプラクティス。

---

## 🪟 Windows開発環境の特徴

### 強み
- ✅ **Native Android Studio**: 最高のAndroidビルド体験
- ✅ **PowerShell自動化**: 強力なスクリプト環境
- ✅ **GUIツール豊富**: VSCode, Claude Desktop, Android Studio
- ✅ **MCP統合容易**: Node.js標準環境
- ✅ **マルチタスク**: 複数プロジェクト並行開発

### 制約と対処
- ⚠️ **パス区切り**: `\` (バックスラッシュ) 使用
  - 対処: PowerShell変数 `$env:USERPROFILE`
- ⚠️ **スペース含むパス**: `C:\Program Files\`
  - 対処: クォート使用 `cd "C:\Program Files\Project"`
- ⚠️ **実行ポリシー**: スクリプト実行制限
  - 対処: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- ⚠️ **改行コード**: CRLF vs LF
  - 対処: Git設定 `core.autocrlf=true`

---

## 💻 PowerShell開発ガイドライン

### 基本原則

**1. 常にPowerShell 5.1+を使用**
```powershell
# バージョン確認
$PSVersionTable.PSVersion

# 期待値: 5.1 以上
```

**2. 環境変数は`$env:`プレフィックス**
```powershell
# 正しい
$env:USERPROFILE
$env:APPDATA
$env:TEMP

# 誤り (Unix形式)
$HOME
~/.config
```

**3. パス結合は`Join-Path`**
```powershell
# 正しい
$path = Join-Path $env:USERPROFILE ".linear-api-key"

# 避ける
$path = "$env:USERPROFILE\.linear-api-key"  # 動くが非推奨
```

### Bash → PowerShell変換パターン

| Bash | PowerShell | 説明 |
|------|------------|------|
| `cat file.txt` | `Get-Content file.txt` | ファイル読み込み |
| `echo "text" > file.txt` | `"text" \| Out-File file.txt` | ファイル書き込み |
| `curl -X POST url` | `Invoke-RestMethod -Uri url -Method Post` | HTTP リクエスト |
| `grep "pattern" file` | `Select-String -Pattern "pattern" file` | テキスト検索 |
| `chmod +x script.sh` | (不要) | PowerShell実行ポリシーで管理 |
| `export VAR=value` | `$env:VAR = "value"` | 環境変数設定 |

### 実用例: Linear API呼び出し

**Bash版**:
```bash
#!/bin/bash
curl -X POST "https://api.linear.app/graphql" \
  -H "Authorization: $(cat ~/.linear-api-key)" \
  -d '{"query":"..."}'
```

**PowerShell版**:
```powershell
$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw

$body = @{
    query = "mutation { ... }"
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

---

## 🔧 MCP Servers統合原則

### 前提条件
- Node.js 18+ インストール必須
- Claude Desktop インストール必須
- `%APPDATA%\Claude\claude_desktop_config.json` 設定必須

### 推奨MCPサーバー構成
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

### MCP活用パターン

**Pattern 1: Sequential Thinking + 実装**
```
Phase 1: Sequential Thinking MCPで戦略立案
Phase 2: 実装 (PowerShell/JavaScript)
Phase 3: テスト
Phase 4: Linear報告
```

**Pattern 2: n8n Workflow設計**
```
1. n8n MCPでノード検索
2. Workflow構造設計
3. n8n UIで実装
4. Webhook連携テスト
```

**Pattern 3: Notion → Linear同期**
```
1. Notion MCPでページ取得
2. データ変換 (PowerShell)
3. Linear API経由で同期
4. エラーハンドリング
```

---

## 🔒 セキュリティ原則

### APIキー管理3原則

**1. 絶対にGitHub上に配置しない**
```powershell
# 正しい: ホームディレクトリ保存
echo "lin_api_xxxxx" > $env:USERPROFILE\.linear-api-key

# 誤り: リポジトリ内
echo "lin_api_xxxxx" > .env  # ❌ .gitignoreでブロックされるが危険
```

**2. .gitignore必須パターン**
```gitignore
# 環境変数
.env
.env.local
.env.*.local

# APIキー
*.key
*-api-key
*-token
*secret*

# 許可: テンプレートのみ
!.env.example
```

**3. Pre-commit hook自動スキャン**
```powershell
# .git\hooks\pre-commit に配置
$files = git diff --cached --name-only

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    if ($content -match "(lin_api_|ghp_|secret_|ntn_)") {
        Write-Error "❌ API key detected in $file"
        exit 1
    }
}
```

### 緊急対応手順

**APIキー漏洩時**:
1. **即座に無効化** (Linear/GitHub設定)
2. **Git履歴削除**:
   ```powershell
   git filter-branch --force --index-filter `
       "git rm --cached --ignore-unmatch leaked-file.md" `
       --prune-empty --tag-name-filter cat -- --all
   git push --force origin main
   ```
3. **新キー生成・再設定**
4. **Linear Issue記録**

---

## 🤖 Android開発統合原則

### Gradle自動化パターン

**基本ビルドコマンド**:
```powershell
# APKビルド
.\gradlew assembleDebug

# リリースビルド (署名付き)
.\gradlew assembleRelease

# クリーンビルド
.\gradlew clean assembleDebug
```

**n8n Webhook連携**:
```powershell
# ビルド完了後にWebhook送信
.\gradlew assembleDebug
if ($LASTEXITCODE -eq 0) {
    $body = @{
        status = "success"
        apk_path = "app\build\outputs\apk\debug\app-debug.apk"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "https://your-n8n-instance.com/webhook/android-build" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
}
```

### Linear自動更新パターン

**ビルド成功時**:
```powershell
# ビルド → Linear Issue更新
$issueId = "cff8f12c-d085-4e18-937a-2c07d402cfe8"
.\gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    # ステータス更新: In Review
    .\scripts\sync-linear-status.ps1 -IssueId $issueId -Status InReview

    # コメント追加
    .\scripts\add-linear-comment.ps1 `
        -IssueId $issueId `
        -Body "✅ APKビルド成功: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
```

---

## 📋 ワークフロー設計原則

### 標準ワークフローパターン

**Pattern A: Issue駆動開発**
```
1. Linear Issue確認
2. Status: "In Progress" 自動更新
3. Sequential Thinking MCPで戦略立案
4. 実装 (コード/PowerShell)
5. テスト (ローカル/CI)
6. Status: "In Review" + コメント追加
```

**Pattern B: 自動化優先開発**
```
1. 手作業タスク特定
2. PowerShellスクリプト化
3. n8n Workflow設計
4. Webhook連携実装
5. Linear自動更新統合
```

**Pattern C: MCP活用最大化**
```
1. Sequential Thinking: 問題分析
2. n8n MCP: Workflow設計
3. Context7: 技術調査
4. Notion: ドキュメント記録
5. Linear: プロジェクト管理
```

---

## 🚨 トラブルシューティング原則

### エラー発生時の対処順序

**1. ログ確認**
```powershell
# PowerShellエラーログ
$Error[0] | Format-List -Force

# Gradle詳細ログ
.\gradlew assembleDebug --stacktrace --info
```

**2. Linear検索**
```
過去Issue検索 → 類似エラー確認 → 解決策適用
```

**3. Context7技術調査**
```
Context7 MCP経由で最新ドキュメント取得
```

**4. Sequential Thinking分析**
```
Sequential Thinking MCPで段階的解決策立案
```

### よくあるWindows特有エラー

**エラー1: `Execution Policy`**
```powershell
# エラー
.\script.ps1 : File cannot be loaded because running scripts is disabled

# 対処
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**エラー2: `Path too long`**
```powershell
# エラー
New-Item : The specified path, file name, or both are too long

# 対処
# Windows 10 1607+でレジストリ変更
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

**エラー3: `Encoding issues`**
```powershell
# エラー
PowerShellスクリプトの日本語が文字化け

# 対処
# UTF-8 BOM付きで保存
$content | Out-File -FilePath script.ps1 -Encoding UTF8
```

---

## 🎯 ベストプラクティスまとめ

### DO (推奨)
- ✅ PowerShell標準コマンドレット使用
- ✅ APIキーはホームディレクトリ保存
- ✅ MCP Servers活用
- ✅ Linear Issue駆動開発
- ✅ 自動化スクリプト作成
- ✅ Git pre-commit hook設定
- ✅ Gradleビルド自動化
- ✅ n8n Workflow統合

### DON'T (非推奨)
- ❌ Unix形式パス混在
- ❌ APIキーリポジトリ配置
- ❌ 手動繰り返し作業
- ❌ エラー無視
- ❌ ドキュメント不足
- ❌ Git commit --no-verify 使用
- ❌ Hard-coded secrets

---

**関連ドキュメント**:
- constitution.md: 基本原則
- workflows/powershell-automation.md: PowerShell実用ガイド
- workflows/windows-mcp-integration.md: MCP統合詳細
- workflows/api-key-security/: セキュリティ完全ガイド

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
