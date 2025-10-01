# Emergency Response - API Key Leak

APIキー漏洩時の緊急対応手順完全ガイド。GitHub履歴からの完全削除まで。

---

## 🚨 緊急対応フロー

### 即座に実行すべき3ステップ
1. **キー無効化** (5分以内)
2. **Git履歴削除** (10分以内)
3. **新キー生成・再設定** (15分以内)

---

## 📋 Phase 1: キー無効化（最優先）

### 1-1. Linear API Key無効化

**手順**:
1. https://linear.app/settings/api にアクセス
2. 漏洩したキーの行を探す
3. 「Revoke」ボタンクリック
4. 確認ダイアログで「Revoke」

**所要時間**: 2分

**PowerShellスクリプト**:
```powershell
# scripts/emergency-revoke-linear.ps1
# Linear APIキー緊急無効化ガイド

Write-Host "🚨 EMERGENCY: Linear API Key Revocation" -ForegroundColor Red

Write-Host "`n⚠️  IMMEDIATE ACTION REQUIRED:" -ForegroundColor Yellow
Write-Host "   1. Open: https://linear.app/settings/api" -ForegroundColor White
Write-Host "   2. Find the leaked key in the list" -ForegroundColor White
Write-Host "   3. Click 'Revoke' button" -ForegroundColor White
Write-Host "   4. Confirm revocation" -ForegroundColor White

# ブラウザ起動
Start-Process "https://linear.app/settings/api"

# 確認待機
Read-Host "`nPress Enter after revoking the key"

Write-Host "✅ Key revoked. Proceed to Phase 2: Git History Cleanup" -ForegroundColor Green
```

### 1-2. GitHub Token無効化

**手順**:
1. https://github.com/settings/tokens にアクセス
2. 漏洩したトークンを探す
3. 「Delete」ボタンクリック
4. 確認

**所要時間**: 2分

### 1-3. Notion API Key無効化

**手順**:
1. https://www.notion.so/my-integrations にアクセス
2. 漏洩したIntegrationを選択
3. 「Secrets」タブ
4. 「Rotate secret」クリック

**所要時間**: 2分

---

## 🧹 Phase 2: Git履歴完全削除

### 2-1. git filter-branch方式（推奨）

**完全削除スクリプト**:
```powershell
# scripts/emergency-git-cleanup.ps1
# Git履歴からAPIキー完全削除

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🧹 Git History Cleanup" -ForegroundColor Cyan
Write-Host "   Target: $FilePath" -ForegroundColor Yellow

# バックアップ作成
Write-Host "`n📦 Creating backup..." -ForegroundColor Yellow
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Copy-Item -Path ".git" -Destination "$backupDir\.git" -Recurse
Write-Host "   Backup: $backupDir" -ForegroundColor Green

# filter-branch実行
Write-Host "`n🔨 Removing file from Git history..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray

git filter-branch --force --index-filter `
    "git rm --cached --ignore-unmatch $FilePath" `
    --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ File removed from history" -ForegroundColor Green
} else {
    Write-Error "❌ filter-branch failed"
    exit 1
}

# reflogクリーンアップ
Write-Host "`n🧹 Cleaning reflog..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "✅ Git history cleaned" -ForegroundColor Green

# Force push警告
Write-Host "`n⚠️  NEXT STEP: Force push to remote" -ForegroundColor Yellow
Write-Host "   Run: git push --force origin main" -ForegroundColor White
Write-Host "   WARNING: This will rewrite remote history!" -ForegroundColor Red
```

**使用例**:
```powershell
# 漏洩ファイル削除
.\scripts\emergency-git-cleanup.ps1 -FilePath "leaked-config.json"

# Force push
git push --force origin main
```

### 2-2. BFG Repo-Cleaner方式（高速・簡単）

**インストール**:
```powershell
# BFG Repo-Cleaner ダウンロード
# https://rtyley.github.io/bfg-repo-cleaner/

# Java必須
java -version
```

**使用**:
```powershell
# scripts/emergency-bfg-cleanup.ps1
# BFG Repo-Cleaner使用版

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🧹 BFG Repo-Cleaner" -ForegroundColor Cyan

# BFGダウンロード確認
$bfgJar = "bfg-1.14.0.jar"
if (-not (Test-Path $bfgJar)) {
    Write-Host "Downloading BFG Repo-Cleaner..." -ForegroundColor Yellow
    Invoke-WebRequest `
        -Uri "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" `
        -OutFile $bfgJar
}

# Mirror clone作成
Write-Host "`n📦 Creating mirror clone..." -ForegroundColor Yellow
$repoDir = (Get-Item .).Name
git clone --mirror . "../$repoDir-mirror"

# BFG実行
Write-Host "`n🔨 Removing file with BFG..." -ForegroundColor Yellow
java -jar $bfgJar --delete-files $FilePath "../$repoDir-mirror"

# Mirror push
Push-Location "../$repoDir-mirror"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push
Pop-Location

# クリーンアップ
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "../$repoDir-mirror"

Write-Host "✅ BFG cleanup complete" -ForegroundColor Green
```

### 2-3. git-filter-repo方式（最新推奨）

**インストール**:
```powershell
pip install git-filter-repo
```

**使用**:
```powershell
# scripts/emergency-filter-repo-cleanup.ps1
# git-filter-repo使用版

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🧹 git-filter-repo Cleanup" -ForegroundColor Cyan

# filter-repo実行
Write-Host "`n🔨 Removing file from history..." -ForegroundColor Yellow
git filter-repo --path $FilePath --invert-paths --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ File removed successfully" -ForegroundColor Green

    # Force push
    Write-Host "`n⚠️  Force pushing to remote..." -ForegroundColor Yellow
    git push --force origin main

    Write-Host "✅ Remote history updated" -ForegroundColor Green
} else {
    Write-Error "❌ filter-repo failed"
    exit 1
}
```

---

## 🔑 Phase 3: 新キー生成・再設定

### 3-1. Linear API Key再生成

**手順**:
```powershell
# scripts/regenerate-linear-key.ps1
# Linear APIキー再生成ガイド

Write-Host "🔑 Linear API Key Regeneration" -ForegroundColor Cyan

Write-Host "`n📝 Steps:" -ForegroundColor Yellow
Write-Host "   1. Open: https://linear.app/settings/api" -ForegroundColor White
Write-Host "   2. Click 'Create API key'" -ForegroundColor White
Write-Host "   3. Name: 'Windows Development - $(Get-Date -Format 'yyyy-MM-dd')'" -ForegroundColor White
Write-Host "   4. Copy the new key" -ForegroundColor White

Start-Process "https://linear.app/settings/api"

# 新キー入力
Write-Host "`n🔐 Enter new Linear API key:" -ForegroundColor Yellow
$newKey = Read-Host

# ローカル保存
$newKey.Trim() | Out-File "$env:USERPROFILE\.linear-api-key" -Encoding ASCII -NoNewline

Write-Host "✅ New key saved to: $env:USERPROFILE\.linear-api-key" -ForegroundColor Green

# 検証
Write-Host "`n🔍 Verifying new key..." -ForegroundColor Yellow
$testQuery = @{
    query = "query { viewer { id name } }"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $newKey
            "Content-Type" = "application/json"
        } `
        -Body $testQuery

    Write-Host "✅ New key verified successfully" -ForegroundColor Green
    Write-Host "   User: $($response.data.viewer.name)" -ForegroundColor Cyan
} catch {
    Write-Error "❌ New key verification failed: $_"
    exit 1
}
```

### 3-2. GitHub Token再生成

**手順**:
```powershell
# scripts/regenerate-github-token.ps1

Write-Host "🔑 GitHub Token Regeneration" -ForegroundColor Cyan

Write-Host "`n📝 Steps:" -ForegroundColor Yellow
Write-Host "   1. Open: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "   2. Click 'Generate new token (classic)'" -ForegroundColor White
Write-Host "   3. Note: 'Windows Development - $(Get-Date -Format 'yyyy-MM-dd')'" -ForegroundColor White
Write-Host "   4. Select scopes: repo, read:user" -ForegroundColor White
Write-Host "   5. Click 'Generate token'" -ForegroundColor White
Write-Host "   6. Copy the token" -ForegroundColor White

Start-Process "https://github.com/settings/tokens/new"

# 新トークン入力
Write-Host "`n🔐 Enter new GitHub token:" -ForegroundColor Yellow
$newToken = Read-Host

# ローカル保存
$newToken.Trim() | Out-File "$env:USERPROFILE\.github-token" -Encoding ASCII -NoNewline

Write-Host "✅ New token saved to: $env:USERPROFILE\.github-token" -ForegroundColor Green
```

---

## 📊 Phase 4: 影響範囲確認

### 4-1. GitHub検索

**GitHub上の漏洩確認**:
```powershell
# scripts/check-github-exposure.ps1
# GitHub上の漏洩範囲確認

param(
    [Parameter(Mandatory=$true)]
    [string]$LeakedKey
)

Write-Host "🔍 Checking GitHub exposure..." -ForegroundColor Cyan

# GitHub APIで検索
$githubToken = Get-Content "$env:USERPROFILE\.github-token" -Raw
$query = $LeakedKey.Substring(0, 20)  # 部分一致検索

$searchUrl = "https://api.github.com/search/code?q=$query+user:YOUR_USERNAME"

try {
    $response = Invoke-RestMethod `
        -Uri $searchUrl `
        -Headers @{
            "Authorization" = "token $githubToken"
            "Accept" = "application/vnd.github.v3+json"
        }

    if ($response.total_count -gt 0) {
        Write-Host "❌ Leaked key found in GitHub:" -ForegroundColor Red
        $response.items | ForEach-Object {
            Write-Host "   Repository: $($_.repository.full_name)" -ForegroundColor Yellow
            Write-Host "   File: $($_.path)" -ForegroundColor Yellow
            Write-Host "   URL: $($_.html_url)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "✅ No public exposure found on GitHub" -ForegroundColor Green
    }
} catch {
    Write-Error "❌ GitHub search failed: $_"
}
```

### 4-2. 監査ログ確認

**Linear監査ログ**:
```powershell
# scripts/check-linear-audit-log.ps1
# Linear監査ログ確認

$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw

$query = @"
query {
  auditEntries(first: 50) {
    nodes {
      id
      type
      createdAt
      actor { name }
      metadata
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

    Write-Host "📜 Recent Linear Activity:" -ForegroundColor Cyan
    $response.data.auditEntries.nodes | Select-Object -First 10 | ForEach-Object {
        Write-Host "   $($_.createdAt) - $($_.type) by $($_.actor.name)" -ForegroundColor Yellow
    }

    # 不審なアクティビティチェック
    Write-Host "`n⚠️  Review the log above for suspicious activity" -ForegroundColor Yellow
} catch {
    Write-Error "❌ Failed to fetch audit log: $_"
}
```

---

## 📝 Phase 5: インシデントレポート

### 5-1. Linear Issue作成

**自動Issue作成**:
```powershell
# scripts/create-incident-report.ps1
# インシデントレポート自動作成

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,

    [Parameter(Mandatory=$true)]
    [string]$LeakSource,

    [Parameter(Mandatory=$true)]
    [string]$Resolution
)

$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
$teamId = Get-Content "$env:USERPROFILE\.linear-team-id" -Raw

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$issueBody = @"
## 🚨 Security Incident: API Key Leak

**Service**: $ServiceName
**Detected**: $timestamp
**Source**: $LeakSource

### Immediate Actions Taken
1. ✅ API key revoked immediately
2. ✅ Git history cleaned (filter-branch)
3. ✅ New key generated and configured
4. ✅ Force pushed to remote

### Resolution
$Resolution

### Verification
- [ ] No public exposure on GitHub
- [ ] Audit log reviewed
- [ ] All services using new key
- [ ] Pre-commit hook verified

### Prevention
- [ ] Team notified about incident
- [ ] Pre-commit hook testing scheduled
- [ ] Security audit scheduled

---
🤖 Auto-generated incident report
"@

$mutation = @"
mutation {
  issueCreate(input: {
    title: "🚨 Security Incident: $ServiceName API Key Leak",
    description: "$($issueBody -replace '"', '\"' -replace '\n', '\n')",
    teamId: "$teamId",
    priority: 1,
    labelIds: ["security", "incident"]
  }) {
    success
    issue { id identifier url }
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

    $issue = $response.data.issueCreate.issue
    Write-Host "✅ Incident report created: $($issue.identifier)" -ForegroundColor Green
    Write-Host "   URL: $($issue.url)" -ForegroundColor Cyan

    Start-Process $issue.url
} catch {
    Write-Error "❌ Failed to create incident report: $_"
}
```

---

## 🔄 Phase 6: 再発防止

### 6-1. チェックリスト実行

```powershell
# scripts/post-incident-checklist.ps1
# インシデント後チェックリスト

Write-Host "📋 Post-Incident Checklist" -ForegroundColor Cyan

$checks = @(
    @{ Task = "API key revoked"; Status = $false },
    @{ Task = "Git history cleaned"; Status = $false },
    @{ Task = "New key generated"; Status = $false },
    @{ Task = "Pre-commit hook verified"; Status = $false },
    @{ Task = "Team notified"; Status = $false },
    @{ Task = "Incident report created"; Status = $false },
    @{ Task = "Security audit scheduled"; Status = $false }
)

foreach ($check in $checks) {
    Write-Host "`n   $($check.Task)" -ForegroundColor Yellow
    $response = Read-Host "   Completed? (y/n)"

    if ($response -eq "y") {
        Write-Host "   ✅ Completed" -ForegroundColor Green
        $check.Status = $true
    } else {
        Write-Host "   ❌ Not completed" -ForegroundColor Red
    }
}

# サマリー
$completedCount = ($checks | Where-Object { $_.Status -eq $true }).Count
$totalCount = $checks.Count

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   Completed: $completedCount / $totalCount" -ForegroundColor $(if ($completedCount -eq $totalCount) {'Green'} else {'Red'})

if ($completedCount -eq $totalCount) {
    Write-Host "`n✅ All post-incident tasks completed" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tasks remain incomplete" -ForegroundColor Yellow
}
```

---

## 📞 緊急連絡先

### サービス別サポート

**Linear**:
- サポート: https://linear.app/contact
- ドキュメント: https://linear.app/docs

**GitHub**:
- サポート: https://support.github.com
- セキュリティ: security@github.com

**Notion**:
- サポート: https://www.notion.so/help
- セキュリティ: security@makenotion.com

---

## 📋 完全対応チェックリスト

### Phase 1: 即座対応（5分以内）
- [ ] 漏洩したキーを特定
- [ ] 該当サービスでキー無効化
- [ ] チームに緊急通知

### Phase 2: Git履歴削除（10分以内）
- [ ] バックアップ作成
- [ ] git filter-branch実行
- [ ] reflogクリーンアップ
- [ ] Force push実行

### Phase 3: 新キー設定（15分以内）
- [ ] 新APIキー生成
- [ ] ローカルファイル保存
- [ ] 動作確認テスト
- [ ] CI/CD環境変数更新

### Phase 4: 影響確認（30分以内）
- [ ] GitHub公開範囲確認
- [ ] 監査ログレビュー
- [ ] 不審なアクティビティ確認

### Phase 5: レポート作成（1時間以内）
- [ ] Linear Issueインシデントレポート作成
- [ ] タイムライン記録
- [ ] 対応内容記録

### Phase 6: 再発防止（1日以内）
- [ ] Pre-commit hook再テスト
- [ ] チーム全体にインシデント共有
- [ ] セキュリティトレーニング実施
- [ ] 定期監査スケジュール設定

---

## 🔗 関連ドキュメント

- **workflows/api-key-security/local-only-management.md**: 予防策
- **workflows/api-key-security/pre-commit-scanning.md**: 検出システム
- **config/api-keys-template.json**: キー管理テンプレート

---

**緊急度**: 🚨 最高
**最終更新**: 2025-10-02
**必読**: すべての開発者必読
