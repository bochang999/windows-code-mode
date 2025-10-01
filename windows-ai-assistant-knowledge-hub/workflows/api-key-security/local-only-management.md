# API Key Local-Only Management

Windows環境でのAPIキー完全ローカル管理ガイド。GitHub漏洩防止徹底。

---

## 🎯 基本原則

### 絶対ルール
1. **APIキーは絶対にGitHubに配置しない**
2. **ホームディレクトリに個別ファイル保存**
3. **.gitignoreで完全ブロック**
4. **Pre-commit hookで自動スキャン**
5. **環境変数も使用禁止** (.envファイルも危険)

---

## 📁 Phase 1: ストレージ設計 (5分)

### 1-1. 推奨ストレージ構造

```
C:\Users\<username>\
├── .linear-api-key           # Linear API
├── .github-token             # GitHub Personal Access Token
├── .linear-team-id           # Linear Team ID
├── .notion-api-key           # Notion API
├── .context7-api-key         # Context7 API
└── .keystore-password        # Android Keystore Password
```

### 1-2. PowerShellヘルパー関数

**create-api-keys.ps1**:
```powershell
# scripts/create-api-keys.ps1
# APIキーファイル作成ヘルパー

function New-ApiKeyFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Service,

        [Parameter(Mandatory=$true)]
        [string]$ApiKey
    )

    $filename = ".$Service-api-key"
    $path = Join-Path $env:USERPROFILE $filename

    # ファイル作成
    $ApiKey.Trim() | Out-File -FilePath $path -Encoding ASCII -NoNewline

    # アクセス権限設定（読み取り専用）
    $acl = Get-Acl $path
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $env:USERNAME, "Read", "Allow"
    )
    $acl.AddAccessRule($rule)
    Set-Acl $path $acl

    Write-Host "✅ Created: $path" -ForegroundColor Green
    Write-Host "   Permission: Read-only for $env:USERNAME" -ForegroundColor Gray
}

# 使用例
Write-Host "🔑 API Key Setup Wizard" -ForegroundColor Cyan

# Linear
$linearKey = Read-Host "Enter Linear API Key (lin_api_...)"
New-ApiKeyFile -Service "linear" -ApiKey $linearKey

# GitHub
$githubToken = Read-Host "Enter GitHub Token (ghp_...)"
New-ApiKeyFile -Service "github-token" -ApiKey $githubToken

# Linear Team ID
$teamId = Read-Host "Enter Linear Team ID"
New-ApiKeyFile -Service "linear-team-id" -ApiKey $teamId

Write-Host "`n✅ API Key setup complete!" -ForegroundColor Green
```

**使用**:
```powershell
.\scripts\create-api-keys.ps1
```

---

## 🔒 Phase 2: .gitignore設定 (5分)

### 2-1. 完全.gitignoreパターン

**.gitignore**:
```gitignore
# ========================================
# API Keys and Secrets - NEVER COMMIT
# ========================================

# Environment files
.env
.env.local
.env.development
.env.production
.env.*.local

# API key files
*.key
*-api-key
*-token
*secret*
*password*
*.pem
*.p12
*.jks

# Specific patterns
.linear-api-key
.github-token
.linear-team-id
.notion-api-key
.context7-api-key
keystore.jks
keystore.properties

# Allow templates only
!.env.example
!api-keys-template.json
!*.example

# ========================================
# Build artifacts
# ========================================
app/build/
build/
*.apk
*.aab

# ========================================
# IDE
# ========================================
.idea/
.vscode/
*.iml

# ========================================
# OS
# ========================================
.DS_Store
Thumbs.db
```

### 2-2. .gitignore検証

**verify-gitignore.ps1**:
```powershell
# scripts/verify-gitignore.ps1
# .gitignore検証

Write-Host "🔍 Verifying .gitignore..." -ForegroundColor Cyan

$patterns = @(
    ".env",
    "*.key",
    "*-api-key",
    "*-token",
    "*secret*",
    "keystore.jks"
)

$allPatternsFound = $true

foreach ($pattern in $patterns) {
    $found = Select-String -Path ".gitignore" -Pattern [regex]::Escape($pattern) -Quiet

    if ($found) {
        Write-Host "   ✅ $pattern" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $pattern NOT FOUND" -ForegroundColor Red
        $allPatternsFound = $false
    }
}

if ($allPatternsFound) {
    Write-Host "`n✅ All required patterns present" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some patterns missing - update .gitignore" -ForegroundColor Red
    exit 1
}
```

---

## 🛡️ Phase 3: Pre-commit Hook (10分)

### 3-1. 自動スキャンHook

**.git/hooks/pre-commit**:
```bash
#!/bin/bash
# Pre-commit hook: API key leak prevention

echo "🔒 Scanning for API keys..."

# APIキーパターン
PATTERNS=(
    "lin_api_[a-zA-Z0-9]{40,}"     # Linear
    "ghp_[a-zA-Z0-9]{36,}"          # GitHub
    "secret_[a-zA-Z0-9]{40,}"       # Notion
    "ctx7_[a-zA-Z0-9]{32,}"         # Context7
    "sk-[a-zA-Z0-9]{48,}"           # OpenAI
    "AKIA[0-9A-Z]{16}"              # AWS
)

# ステージングファイル取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

FOUND_SECRETS=0
for FILE in $STAGED_FILES; do
    # ドキュメント・テンプレートスキップ
    if [[ "$FILE" =~ (SECURITY\.md|README\.md|\.example$|/docs/|template\.json|api-keys-template) ]]; then
        echo "⏭️  Skipping documentation/template: $FILE"
        continue
    fi

    # バイナリファイルスキップ
    if [ -f "$FILE" ]; then
        for PATTERN in "${PATTERNS[@]}"; do
            if grep -E -i -q "$PATTERN" "$FILE"; then
                echo "❌ BLOCKED: Potential API key found in $FILE"
                echo "   Pattern matched: $PATTERN"
                FOUND_SECRETS=1
            fi
        done
    fi
done

# コミットブロック
if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo "🚫 Commit blocked to prevent API key leak!"
    echo ""
    echo "To fix:"
    echo "  1. Remove hardcoded API keys from files"
    echo "  2. Use $HOME/.linear-api-key files instead"
    echo "  3. Check .gitignore for proper configuration"
    echo ""
    echo "To bypass this check (NOT recommended):"
    echo "  git commit --no-verify"
    exit 1
fi

echo "✅ No API keys detected in staged files"
exit 0
```

**インストール**:
```powershell
# Pre-commit hookコピー
Copy-Item scripts\pre-commit .git\hooks\pre-commit

# 実行権限付与（Git Bash経由）
git update-index --chmod=+x .git/hooks/pre-commit
```

### 3-2. Hook動作確認

```powershell
# テストファイル作成（APIキー含む）
"lin_api_EXAMPLE_KEY_FOR_TESTING_ONLY_123456789" | Out-File test-secret.txt

# Git add試行
git add test-secret.txt

# Commit試行（ブロックされるべき）
git commit -m "test"

# 期待される出力:
# ❌ BLOCKED: Potential API key found in test-secret.txt

# クリーンアップ
Remove-Item test-secret.txt
```

---

## 📖 Phase 4: 安全な読み込みパターン (5分)

### 4-1. PowerShell読み込み

```powershell
# ✅ 正しい読み込み方法
$linearKey = Get-Content "$env:USERPROFILE\.linear-api-key" -Raw
$linearKey = $linearKey.Trim()  # 改行削除

# Linear API呼び出し
$headers = @{
    "Authorization" = $linearKey
    "Content-Type" = "application/json"
}

Invoke-RestMethod `
    -Uri "https://api.linear.app/graphql" `
    -Headers $headers `
    -Method Post
```

### 4-2. Node.js読み込み

```javascript
// ✅ 正しい読み込み方法
const fs = require('fs');
const os = require('os');
const path = require('path');

const keyPath = path.join(os.homedir(), '.linear-api-key');
const linearKey = fs.readFileSync(keyPath, 'utf8').trim();

// Linear API呼び出し
const headers = {
    'Authorization': linearKey,
    'Content-Type': 'application/json'
};
```

### 4-3. Python読み込み

```python
# ✅ 正しい読み込み方法
import os
from pathlib import Path

key_path = Path.home() / '.linear-api-key'
linear_key = key_path.read_text().strip()

# Linear API呼び出し
headers = {
    'Authorization': linear_key,
    'Content-Type': 'application/json'
}
```

---

## ❌ 禁止パターン

### NG Pattern 1: .envファイル

```powershell
# ❌ 危険 - .envファイル使用
# .env
LINEAR_API_KEY=lin_api_xxxxx

# スクリプト
$env:LINEAR_API_KEY = "lin_api_xxxxx"  # ❌ 絶対NG
```

**理由**:
- .envファイルを誤ってコミットするリスク
- 環境変数がプロセスツリーで露出

### NG Pattern 2: ハードコード

```powershell
# ❌ 絶対禁止 - ハードコード
$linearKey = "lin_api_EXAMPLE_HARDCODED_KEY_NEVER_DO_THIS_12345"
```

**理由**:
- コードに直接埋め込み
- GitHub漏洩リスク100%

### NG Pattern 3: リポジトリ内ファイル

```powershell
# ❌ 危険 - リポジトリ内保存
# config/secrets.json
{
  "linearApiKey": "lin_api_xxxxx"
}
```

**理由**:
- .gitignore忘れリスク
- Git履歴に残る可能性

---

## 🔍 Phase 5: 検証・監視 (10分)

### 5-1. APIキー存在確認

**validate-keys.ps1**:
```powershell
# scripts/validate-keys.ps1
# APIキー設定検証

Write-Host "🔍 Validating API Keys..." -ForegroundColor Cyan

$keys = @(
    @{ Name = "Linear API"; File = ".linear-api-key"; Pattern = "^lin_api_" },
    @{ Name = "GitHub Token"; File = ".github-token"; Pattern = "^ghp_" },
    @{ Name = "Linear Team ID"; File = ".linear-team-id"; Pattern = "^[a-f0-9-]{36}$" },
    @{ Name = "Notion API"; File = ".notion-api-key"; Pattern = "^secret_" },
    @{ Name = "Context7 API"; File = ".context7-api-key"; Pattern = "^ctx7_" }
)

$allValid = $true

foreach ($key in $keys) {
    $path = Join-Path $env:USERPROFILE $key.File

    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        $content = $content.Trim()

        if ($content -match $key.Pattern) {
            Write-Host "   ✅ $($key.Name): Valid" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($key.Name): Invalid format" -ForegroundColor Yellow
            $allValid = $false
        }
    } else {
        Write-Host "   ❌ $($key.Name): Not found" -ForegroundColor Red
        $allValid = $false
    }
}

if ($allValid) {
    Write-Host "`n✅ All API keys valid" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some API keys missing or invalid" -ForegroundColor Yellow
    exit 1
}
```

### 5-2. GitHub漏洩スキャン

**scan-github-leaks.ps1**:
```powershell
# scripts/scan-github-leaks.ps1
# GitHubリポジトリ漏洩スキャン

param(
    [Parameter(Mandatory=$false)]
    [string]$Repository = "."
)

Write-Host "🔍 Scanning for leaked secrets in Git history..." -ForegroundColor Cyan

$patterns = @(
    "lin_api_",
    "ghp_",
    "secret_",
    "ctx7_",
    "AKIA"
)

$leaksFound = $false

foreach ($pattern in $patterns) {
    Write-Host "`n   Searching for: $pattern" -ForegroundColor Yellow

    $results = git log --all --source --full-history --grep="$pattern" --pretty=format:"%H - %s"

    if ($results) {
        Write-Host "   ❌ LEAK DETECTED in commits:" -ForegroundColor Red
        $results | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Red
        }
        $leaksFound = $true
    }
}

# ファイルコンテンツスキャン
Write-Host "`n   Scanning file contents..." -ForegroundColor Yellow
foreach ($pattern in $patterns) {
    $fileResults = git grep -i "$pattern" $(git rev-list --all) 2>$null

    if ($fileResults) {
        Write-Host "   ❌ LEAK DETECTED in files:" -ForegroundColor Red
        $fileResults | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Red
        }
        $leaksFound = $true
    }
}

if ($leaksFound) {
    Write-Host "`n🚨 API key leaks detected! Immediate action required." -ForegroundColor Red
    Write-Host "   See: workflows/api-key-security/emergency-response.md" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ No leaks detected in Git history" -ForegroundColor Green
    exit 0
}
```

---

## 📊 Phase 6: 定期監査 (5分)

### 6-1. 自動監査スクリプト

**audit-security.ps1**:
```powershell
# scripts/audit-security.ps1
# セキュリティ監査

Write-Host "🔒 Security Audit Report" -ForegroundColor Cyan
Write-Host "   Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# 1. .gitignore確認
Write-Host "`n1. .gitignore Configuration" -ForegroundColor Yellow
.\scripts\verify-gitignore.ps1

# 2. Pre-commit hook確認
Write-Host "`n2. Pre-commit Hook" -ForegroundColor Yellow
if (Test-Path ".git\hooks\pre-commit") {
    Write-Host "   ✅ Pre-commit hook present" -ForegroundColor Green
} else {
    Write-Host "   ❌ Pre-commit hook MISSING" -ForegroundColor Red
}

# 3. APIキー検証
Write-Host "`n3. API Keys Validation" -ForegroundColor Yellow
.\scripts\validate-keys.ps1

# 4. GitHub漏洩スキャン
Write-Host "`n4. GitHub Leak Scan" -ForegroundColor Yellow
.\scripts\scan-github-leaks.ps1

Write-Host "`n✅ Security audit complete" -ForegroundColor Green
```

### 6-2. タスクスケジューラ登録（週次監査）

```powershell
# 週次セキュリティ監査設定
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-File C:\path\to\scripts\audit-security.ps1"

$trigger = New-ScheduledTaskTrigger -Weekly -At 9:00AM -DaysOfWeek Monday

Register-ScheduledTask `
    -TaskName "Weekly Security Audit" `
    -Action $action `
    -Trigger $trigger
```

---

## 📋 チェックリスト

### セットアップ確認
- [ ] APIキーファイル作成 (~/.linear-api-key等)
- [ ] .gitignore設定完了
- [ ] Pre-commit hookインストール
- [ ] validate-keys.ps1実行成功
- [ ] scan-github-leaks.ps1実行（漏洩なし確認）

### 運用確認
- [ ] 全スクリプトでローカルファイル読み込み使用
- [ ] .envファイル不使用
- [ ] ハードコード完全排除
- [ ] 定期監査スケジュール設定

### 緊急対応準備
- [ ] emergency-response.mdレビュー済み
- [ ] Linear APIキー再発行手順理解
- [ ] GitHub Token再発行手順理解
- [ ] Git履歴削除手順理解

---

## 🔗 関連ドキュメント

- **workflows/api-key-security/pre-commit-scanning.md**: Pre-commit詳細
- **workflows/api-key-security/emergency-response.md**: 漏洩時緊急対応
- **config/api-keys-template.json**: APIキーテンプレート
- **SECURITY.md**: セキュリティ全般ガイド

---

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
**セキュリティレベル**: 最高
