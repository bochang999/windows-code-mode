# PowerShell Automation Workflow

Windows環境でのPowerShell自動化ワークフロー完全ガイド。Linear API、GitHub API、Android Build統合。

---

## 🎯 概要

PowerShellスクリプトで以下を自動化：
1. Linear Issue管理（ステータス更新・コメント追加）
2. GitHub操作（commit・push・PR作成）
3. Android Buildトリガー
4. n8n Webhook連携
5. Notion記録自動化

---

## 📋 前提条件

### 必須ソフトウェア
```powershell
# PowerShell 5.1+
$PSVersionTable.PSVersion

# Git for Windows
git --version

# Node.js 18+ (Gradle連携用)
node --version
```

### 必須APIキー
```powershell
# Linear API
$env:USERPROFILE\.linear-api-key

# GitHub Token
$env:USERPROFILE\.github-token

# Linear Team ID
$env:USERPROFILE\.linear-team-id
```

---

## 🔧 Core Script 1: Linear Issue管理

### sync-linear-status.ps1

**用途**: Linear IssueステータスをPowerShellから自動更新

**スクリプト**:
```powershell
# scripts/sync-linear-status.ps1
# Linear Issueステータス自動更新スクリプト

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId,

    [Parameter(Mandatory=$true)]
    [ValidateSet("InProgress", "InReview", "Done", "Todo")]
    [string]$Status
)

# State ID マッピング
$stateIds = @{
    "Todo" = "backlog-state-id"
    "InProgress" = "1cebb56e-524e-4de0-b676-0f574df9012a"
    "InReview" = "33feb1c9-3276-4e13-863a-0b93db032a0f"
    "Done" = "done-state-id"
}

# APIキー読み込み
try {
    $linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw -ErrorAction Stop
    $linearKey = $linearKey.Trim()
} catch {
    Write-Error "❌ Linear API key not found at $env:USERPROFILE\.linear-api-key"
    exit 1
}

# GraphQL mutation
$mutation = @"
mutation {
  issueUpdate(
    id: "$IssueId",
    input: { stateId: "$($stateIds[$Status])" }
  ) {
    success
    issue {
      id
      identifier
      state { name }
    }
  }
}
"@

$body = @{ query = $mutation } | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $body

    if ($response.data.issueUpdate.success) {
        Write-Host "✅ Status updated to $Status" -ForegroundColor Green
        Write-Host "   Issue: $($response.data.issueUpdate.issue.identifier)" -ForegroundColor Cyan
        Write-Host "   State: $($response.data.issueUpdate.issue.state.name)" -ForegroundColor Yellow
    } else {
        Write-Error "❌ Status update failed"
        exit 1
    }
} catch {
    Write-Error "❌ API Error: $_"
    exit 1
}
```

**使用例**:
```powershell
# Issue開始
.\scripts\sync-linear-status.ps1 -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8" -Status InProgress

# Issue完了
.\scripts\sync-linear-status.ps1 -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8" -Status InReview
```

---

## 📝 Core Script 2: Linear コメント追加

### add-linear-comment.ps1

**用途**: Linear Issueにコメント自動追加 + ステータス "In Review" 自動変更

**スクリプト**:
```powershell
# scripts/add-linear-comment.ps1
# Linear Issueコメント追加 + ステータス自動更新

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId,

    [Parameter(Mandatory=$true)]
    [string]$Body
)

# APIキー読み込み
$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
$linearKey = $linearKey.Trim()

# エスケープ処理
$escapedBody = $Body -replace '"', '\"' -replace '\n', '\n' -replace '\r', ''

# GraphQL mutation
$mutation = @"
mutation {
  commentCreate(
    input: {
      issueId: "$IssueId",
      body: "$escapedBody"
    }
  ) {
    success
    comment {
      id
      createdAt
      body
    }
  }
}
"@

$requestBody = @{ query = $mutation } | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $requestBody

    if ($response.data.commentCreate.success) {
        Write-Host "✅ Comment added successfully" -ForegroundColor Green
        Write-Host "   Comment ID: $($response.data.commentCreate.comment.id)" -ForegroundColor Cyan
        Write-Host "   Created At: $($response.data.commentCreate.comment.createdAt)" -ForegroundColor Yellow

        # 自動的にステータスを"In Review"に変更
        Write-Host "`n🔄 Updating status to In Review..." -ForegroundColor Cyan
        & "$PSScriptRoot\sync-linear-status.ps1" -IssueId $IssueId -Status InReview
    } else {
        Write-Error "❌ Failed to add comment"
        exit 1
    }
} catch {
    Write-Error "❌ API Error: $_"
    exit 1
}
```

**使用例**:
```powershell
# 作業完了報告
.\scripts\add-linear-comment.ps1 `
    -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8" `
    -Body "✅ 作業完了: MCP統合実装・テスト完了"

# 複数行コメント
$comment = @"
## 作業完了報告

### 実装内容
- Sequential Thinking MCP統合
- n8n Workflow設計
- PowerShell自動化スクリプト

### テスト結果
✅ すべてのテスト成功
"@

.\scripts\add-linear-comment.ps1 -IssueId "issue_id" -Body $comment
```

---

## 🔍 Core Script 3: Linear Issue取得

### get-linear-issue.ps1

**用途**: Linear Issue詳細取得・検証

**スクリプト**:
```powershell
# scripts/get-linear-issue.ps1
# Linear Issue詳細取得

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId
)

$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
$linearKey = $linearKey.Trim()

$query = @"
query {
  issue(id: "$IssueId") {
    id
    identifier
    title
    description
    state { name }
    assignee { name email }
    createdAt
    updatedAt
    comments(last: 5) {
      nodes {
        id
        createdAt
        body
        user { name }
      }
    }
  }
}
"@

$body = @{ query = $query } | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $body

    $issue = $response.data.issue

    Write-Host "📋 Issue Details:" -ForegroundColor Cyan
    Write-Host "   ID: $($issue.identifier)" -ForegroundColor Yellow
    Write-Host "   Title: $($issue.title)" -ForegroundColor White
    Write-Host "   State: $($issue.state.name)" -ForegroundColor Green
    Write-Host "   Assignee: $($issue.assignee.name)" -ForegroundColor Cyan
    Write-Host "   Updated: $($issue.updatedAt)" -ForegroundColor Gray

    Write-Host "`n💬 Recent Comments:" -ForegroundColor Cyan
    foreach ($comment in $issue.comments.nodes) {
        Write-Host "   - $($comment.user.name) at $($comment.createdAt)" -ForegroundColor Yellow
        Write-Host "     $($comment.body.Substring(0, [Math]::Min(100, $comment.body.Length)))..." -ForegroundColor White
    }

    return $issue
} catch {
    Write-Error "❌ API Error: $_"
    exit 1
}
```

**使用例**:
```powershell
# Issue詳細取得
.\scripts\get-linear-issue.ps1 -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8"

# 変数に格納
$issue = .\scripts\get-linear-issue.ps1 -IssueId "issue_id"
Write-Host "Current state: $($issue.state.name)"
```

---

## 🚀 Core Script 4: GitHub自動操作

### auto-git-commit.ps1

**用途**: Git commit + push自動化

**スクリプト**:
```powershell
# scripts/auto-git-commit.ps1
# Git commit + push自動化

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,

    [Parameter(Mandatory=$false)]
    [string]$IssueId = $null,

    [Parameter(Mandatory=$false)]
    [switch]$Push
)

# Git status確認
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "📝 Staging changes..." -ForegroundColor Cyan
git add .

# Commit message構築
$commitMessage = $Message

if ($IssueId) {
    $commitMessage += "`n`nRelated: $IssueId"
}

$commitMessage += "`n`n🤖 Generated with [Claude Code](https://claude.com/claude-code)`n`nCo-Authored-By: Claude <noreply@anthropic.com>"

Write-Host "💾 Creating commit..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Commit failed"
    exit 1
}

Write-Host "✅ Commit created successfully" -ForegroundColor Green

# Push実行
if ($Push) {
    Write-Host "🚀 Pushing to remote..." -ForegroundColor Cyan
    git push origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green

        # Linear Issue自動更新
        if ($IssueId) {
            Write-Host "🔄 Updating Linear Issue..." -ForegroundColor Cyan
            & "$PSScriptRoot\add-linear-comment.ps1" `
                -IssueId $IssueId `
                -Body "✅ Code committed and pushed to GitHub`n`nCommit message: $Message"
        }
    } else {
        Write-Error "❌ Push failed"
        exit 1
    }
}
```

**使用例**:
```powershell
# Commit only
.\scripts\auto-git-commit.ps1 -Message "feat: Add MCP integration"

# Commit + Push
.\scripts\auto-git-commit.ps1 `
    -Message "feat: Add MCP integration" `
    -Push

# Commit + Push + Linear更新
.\scripts\auto-git-commit.ps1 `
    -Message "feat: Add MCP integration" `
    -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8" `
    -Push
```

---

## 🏗️ Core Script 5: Android Build自動化

### trigger-android-build.ps1

**用途**: Gradle Build + Linear更新 + n8n Webhook

**スクリプト**:
```powershell
# scripts/trigger-android-build.ps1
# Android Build自動化

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Debug", "Release")]
    [string]$BuildType = "Debug",

    [Parameter(Mandatory=$false)]
    [string]$IssueId = $null,

    [Parameter(Mandatory=$false)]
    [string]$WebhookUrl = $null
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "🏗️  Starting Android Build ($BuildType)..." -ForegroundColor Cyan
Write-Host "   Time: $timestamp" -ForegroundColor Gray

# Build実行
$gradleTask = if ($BuildType -eq "Debug") { "assembleDebug" } else { "assembleRelease" }

Write-Host "`n📦 Running: .\gradlew $gradleTask" -ForegroundColor Yellow
.\gradlew $gradleTask --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build succeeded!" -ForegroundColor Green

    # APKパス取得
    $apkPath = "app\build\outputs\apk\$($BuildType.ToLower())\app-$($BuildType.ToLower()).apk"

    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "   APK: $apkPath" -ForegroundColor Cyan
        Write-Host "   Size: $([Math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }

    # Linear Issue更新
    if ($IssueId) {
        Write-Host "`n🔄 Updating Linear Issue..." -ForegroundColor Cyan
        $comment = @"
## ✅ Android Build成功

**Build Type**: $BuildType
**Time**: $timestamp
**APK**: ``$apkPath``
**Size**: $([Math]::Round($apkSize, 2)) MB

Build成功しました。
"@
        & "$PSScriptRoot\add-linear-comment.ps1" -IssueId $IssueId -Body $comment
    }

    # n8n Webhook通知
    if ($WebhookUrl) {
        Write-Host "`n📡 Sending webhook notification..." -ForegroundColor Cyan
        $webhookBody = @{
            status = "success"
            buildType = $BuildType
            apkPath = $apkPath
            apkSize = "$([Math]::Round($apkSize, 2)) MB"
            timestamp = $timestamp
        } | ConvertTo-Json

        Invoke-RestMethod `
            -Uri $WebhookUrl `
            -Method Post `
            -Body $webhookBody `
            -ContentType "application/json"

        Write-Host "✅ Webhook sent successfully" -ForegroundColor Green
    }

    exit 0
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red

    # Linear Issue更新（エラー報告）
    if ($IssueId) {
        $errorComment = @"
## ❌ Android Build失敗

**Build Type**: $BuildType
**Time**: $timestamp

Build失敗。ログ確認が必要です。
"@
        & "$PSScriptRoot\add-linear-comment.ps1" -IssueId $IssueId -Body $errorComment
    }

    exit 1
}
```

**使用例**:
```powershell
# Debug Build
.\scripts\trigger-android-build.ps1 -BuildType Debug

# Release Build + Linear更新
.\scripts\trigger-android-build.ps1 `
    -BuildType Release `
    -IssueId "issue_id"

# 完全自動化（Build + Linear + Webhook）
.\scripts\trigger-android-build.ps1 `
    -BuildType Debug `
    -IssueId "issue_id" `
    -WebhookUrl "https://your-n8n.com/webhook/android-build"
```

---

## 🔄 統合ワークフロー例

### Example 1: Issue駆動開発フルサイクル

```powershell
# Phase 1: Issue開始
$issueId = "cff8f12c-d085-4e18-937a-2c07d402cfe8"
.\scripts\sync-linear-status.ps1 -IssueId $issueId -Status InProgress

# Phase 2: 実装作業
# ... コード実装 ...

# Phase 3: Commit + Push
.\scripts\auto-git-commit.ps1 `
    -Message "feat: Implement MCP integration" `
    -IssueId $issueId `
    -Push

# Phase 4: Build実行
.\scripts\trigger-android-build.ps1 `
    -BuildType Debug `
    -IssueId $issueId

# Phase 5: Issue完了報告
.\scripts\add-linear-comment.ps1 `
    -IssueId $issueId `
    -Body "✅ すべてのフェーズ完了: 実装・コミット・ビルド成功"
```

### Example 2: 夜間自動ビルド

```powershell
# scripts/nightly-build.ps1
# 夜間自動ビルドスクリプト

$timestamp = Get-Date -Format "yyyy-MM-dd"
Write-Host "🌙 Nightly Build: $timestamp" -ForegroundColor Cyan

# Git pull最新版
git pull origin main

# Clean build
.\gradlew clean
.\scripts\trigger-android-build.ps1 `
    -BuildType Release `
    -WebhookUrl "https://your-n8n.com/webhook/nightly-build"

# 成功時にタグ作成
if ($LASTEXITCODE -eq 0) {
    git tag "nightly-$timestamp"
    git push origin "nightly-$timestamp"
}
```

**タスクスケジューラ登録**:
```powershell
# Windows Task Scheduler設定
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-File C:\path\to\scripts\nightly-build.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

Register-ScheduledTask `
    -TaskName "Android Nightly Build" `
    -Action $action `
    -Trigger $trigger
```

---

## 🛠️ 便利なヘルパー関数

### helper-functions.ps1

```powershell
# scripts/helper-functions.ps1
# 共通ヘルパー関数

# Linear API呼び出しヘルパー
function Invoke-LinearAPI {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Query
    )

    $linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
    $linearKey = $linearKey.Trim()

    $body = @{ query = $Query } | ConvertTo-Json

    return Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $body
}

# n8n Webhook送信ヘルパー
function Send-N8nWebhook {
    param(
        [Parameter(Mandatory=$true)]
        [string]$WebhookUrl,

        [Parameter(Mandatory=$true)]
        [hashtable]$Data
    )

    $body = $Data | ConvertTo-Json

    return Invoke-RestMethod `
        -Uri $WebhookUrl `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
}

# エラーハンドリング付きGitコマンド
function Invoke-GitCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    Invoke-Expression "git $Command"

    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: $Command"
    }
}

# Export functions
Export-ModuleMember -Function Invoke-LinearAPI, Send-N8nWebhook, Invoke-GitCommand
```

**使用例**:
```powershell
# ヘルパー関数読み込み
. .\scripts\helper-functions.ps1

# Linear API呼び出し
$query = "query { viewer { id name } }"
$result = Invoke-LinearAPI -Query $query

# n8n Webhook送信
Send-N8nWebhook `
    -WebhookUrl "https://your-n8n.com/webhook/test" `
    -Data @{ message = "Test"; status = "success" }

# Git操作
Invoke-GitCommand "add ."
Invoke-GitCommand "commit -m 'Auto commit'"
Invoke-GitCommand "push origin main"
```

---

## 📋 チェックリスト

### セットアップ確認
- [ ] PowerShell 5.1+ インストール済み
- [ ] APIキーファイル作成済み（Linear, GitHub）
- [ ] scripts/ディレクトリ作成
- [ ] 各スクリプト配置完了
- [ ] 実行ポリシー設定 (RemoteSigned)

### 機能テスト
- [ ] sync-linear-status.ps1 動作確認
- [ ] add-linear-comment.ps1 動作確認
- [ ] get-linear-issue.ps1 動作確認
- [ ] auto-git-commit.ps1 動作確認
- [ ] trigger-android-build.ps1 動作確認

### 統合テスト
- [ ] Issue駆動開発フルサイクル実行
- [ ] Webhook連携確認
- [ ] エラーハンドリング確認

---

## 🔗 関連ドキュメント

- **workflows/linear_issue_management.md**: Linear管理詳細
- **workflows/android-build-automation.md**: Android統合
- **workflows/windows-mcp-integration.md**: MCP統合
- **troubleshooting/powershell-encoding.md**: エンコーディング問題

---

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
**対象環境**: Windows 10/11, PowerShell 5.1+
