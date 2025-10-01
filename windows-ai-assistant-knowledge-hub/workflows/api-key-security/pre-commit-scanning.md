# Pre-commit Scanning System

Git Pre-commit HookによるAPIキー漏洩自動防止システム完全ガイド。

---

## 🎯 概要

Pre-commit Hookを使用して、コミット前に自動的にAPIキーパターンをスキャンし、漏洩を防止。

### 防止対象
- Linear API Key (`lin_api_`)
- GitHub Token (`ghp_`)
- Notion API Key (`secret_`)
- Context7 API Key (`ctx7_`)
- OpenAI API Key (`sk-`)
- AWS Access Key (`AKIA`)
- その他機密情報

---

## 📋 Phase 1: Pre-commit Hook基本実装 (10分)

### 1-1. Bashスクリプト版

**.git/hooks/pre-commit**:
```bash
#!/bin/bash
# Pre-commit Hook: API Key Leak Prevention
# Version: 2.0

echo "🔒 Scanning for API keys..."

# APIキーパターン定義
PATTERNS=(
    "lin_api_[a-zA-Z0-9]{40,}"     # Linear API
    "ghp_[a-zA-Z0-9]{36,}"          # GitHub Token
    "secret_[a-zA-Z0-9]{40,}"       # Notion API
    "ctx7_[a-zA-Z0-9]{32,}"         # Context7 API
    "sk-[a-zA-Z0-9]{48,}"           # OpenAI API
    "AKIA[0-9A-Z]{16}"              # AWS Access Key
    "AIza[0-9A-Za-z\\-_]{35}"       # Google API
    "ya29\\.[0-9A-Za-z\\-_]+"       # Google OAuth
)

# ステージングファイル取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No files to check"
    exit 0
fi

FOUND_SECRETS=0

# ファイルごとにスキャン
for FILE in $STAGED_FILES; do
    # スキップ対象判定
    if [[ "$FILE" =~ (SECURITY\.md|README\.md|\.example$|/docs/|template\.json|api-keys-template|pre-commit-scanning\.md) ]]; then
        echo "⏭️  Skipping documentation/template: $FILE"
        continue
    fi

    # バイナリファイルスキップ
    if [ ! -f "$FILE" ]; then
        continue
    fi

    # ファイルタイプ確認
    if file "$FILE" | grep -q "text"; then
        # パターンマッチング
        for PATTERN in "${PATTERNS[@]}"; do
            if grep -E -i -q "$PATTERN" "$FILE"; then
                echo "❌ BLOCKED: Potential API key found in $FILE"
                echo "   Pattern matched: $PATTERN"

                # マッチした行を表示（最初の3行のみ）
                echo "   Matches:"
                grep -E -i -n "$PATTERN" "$FILE" | head -3 | while read line; do
                    echo "      $line"
                done

                FOUND_SECRETS=1
            fi
        done
    fi
done

# コミットブロック判定
if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo "🚫 Commit blocked to prevent API key leak!"
    echo ""
    echo "To fix:"
    echo "  1. Remove hardcoded API keys from files"
    echo "  2. Use \$HOME/.linear-api-key files instead"
    echo "  3. Check .gitignore for proper configuration"
    echo ""
    echo "Emergency bypass (NOT recommended):"
    echo "  git commit --no-verify"
    echo ""
    echo "For help, see: workflows/api-key-security/emergency-response.md"
    exit 1
fi

echo "✅ No API keys detected in staged files"
exit 0
```

### 1-2. PowerShell版（Windows Native）

**.git/hooks/pre-commit.ps1**:
```powershell
# Pre-commit Hook: API Key Leak Prevention (PowerShell)
# Version: 2.0

Write-Host "🔒 Scanning for API keys..." -ForegroundColor Cyan

# APIキーパターン定義
$patterns = @(
    "lin_api_[a-zA-Z0-9]{40,}",     # Linear API
    "ghp_[a-zA-Z0-9]{36,}",          # GitHub Token
    "secret_[a-zA-Z0-9]{40,}",       # Notion API
    "ctx7_[a-zA-Z0-9]{32,}",         # Context7 API
    "sk-[a-zA-Z0-9]{48,}",           # OpenAI API
    "AKIA[0-9A-Z]{16}",              # AWS Access Key
    "AIza[0-9A-Za-z\-_]{35}",        # Google API
    "ya29\.[0-9A-Za-z\-_]+"          # Google OAuth
)

# ステージングファイル取得
$stagedFiles = git diff --cached --name-only --diff-filter=ACM

if (-not $stagedFiles) {
    Write-Host "✅ No files to check" -ForegroundColor Green
    exit 0
}

$foundSecrets = $false

foreach ($file in $stagedFiles) {
    # スキップ対象判定
    if ($file -match "(SECURITY\.md|README\.md|\.example$|/docs/|template\.json|api-keys-template|pre-commit-scanning\.md)") {
        Write-Host "⏭️  Skipping documentation/template: $file" -ForegroundColor Gray
        continue
    }

    # ファイル存在確認
    if (-not (Test-Path $file)) {
        continue
    }

    # テキストファイル判定
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) {
        continue
    }

    # パターンマッチング
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            Write-Host "❌ BLOCKED: Potential API key found in $file" -ForegroundColor Red
            Write-Host "   Pattern matched: $pattern" -ForegroundColor Yellow

            # マッチした行を表示
            $matches = Select-String -Path $file -Pattern $pattern
            Write-Host "   Matches:" -ForegroundColor Yellow
            $matches | Select-Object -First 3 | ForEach-Object {
                Write-Host "      Line $($_.LineNumber): $($_.Line.Substring(0, [Math]::Min(80, $_.Line.Length)))..." -ForegroundColor Red
            }

            $foundSecrets = $true
        }
    }
}

# コミットブロック判定
if ($foundSecrets) {
    Write-Host ""
    Write-Host "🚫 Commit blocked to prevent API key leak!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "  1. Remove hardcoded API keys from files" -ForegroundColor White
    Write-Host "  2. Use `$env:USERPROFILE\.linear-api-key files instead" -ForegroundColor White
    Write-Host "  3. Check .gitignore for proper configuration" -ForegroundColor White
    Write-Host ""
    Write-Host "Emergency bypass (NOT recommended):" -ForegroundColor Yellow
    Write-Host "  git commit --no-verify" -ForegroundColor White
    Write-Host ""
    Write-Host "For help, see: workflows/api-key-security/emergency-response.md" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ No API keys detected in staged files" -ForegroundColor Green
exit 0
```

---

## 🔧 Phase 2: インストール・設定 (5分)

### 2-1. Bash Hook インストール

```powershell
# 1. Hookファイル作成
$hookContent = @'
#!/bin/bash
# [Bash script content from above]
'@

$hookContent | Out-File -FilePath ".git\hooks\pre-commit" -Encoding ASCII

# 2. 実行権限付与（Git Bash経由）
git update-index --chmod=+x .git/hooks/pre-commit

# 3. 動作確認
.\.git\hooks\pre-commit
```

### 2-2. PowerShell Hook インストール（代替）

```powershell
# 1. PowerShell版Hookファイル作成
$psHookContent = @'
# [PowerShell script content from above]
'@

$psHookContent | Out-File -FilePath ".git\hooks\pre-commit.ps1" -Encoding UTF8

# 2. Bash Wrapper作成
$wrapperContent = @'
#!/bin/bash
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/pre-commit.ps1
'@

$wrapperContent | Out-File -FilePath ".git\hooks\pre-commit" -Encoding ASCII

# 3. 実行権限付与
git update-index --chmod=+x .git/hooks/pre-commit
```

---

## 🧪 Phase 3: テスト・検証 (10分)

### 3-1. 基本動作テスト

**test-pre-commit.ps1**:
```powershell
# scripts/test-pre-commit.ps1
# Pre-commit Hook動作テスト

Write-Host "🧪 Testing Pre-commit Hook" -ForegroundColor Cyan

# テスト1: 正常ファイル（ブロックされないべき）
Write-Host "`n📝 Test 1: Normal file (should pass)" -ForegroundColor Yellow
"function test() { return 'hello'; }" | Out-File test-normal.js
git add test-normal.js
git commit -m "Test normal file"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Test 1 passed" -ForegroundColor Green
    git reset --soft HEAD~1
} else {
    Write-Host "   ❌ Test 1 failed" -ForegroundColor Red
}

# テスト2: Linear APIキー（ブロックされるべき）
Write-Host "`n📝 Test 2: Linear API key (should block)" -ForegroundColor Yellow
"const key = 'lin_api_EXAMPLE_KEY_DO_NOT_USE_1234567890123456';" | Out-File test-secret.js
git add test-secret.js
git commit -m "Test secret file"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✅ Test 2 passed (blocked as expected)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Test 2 failed (should have been blocked)" -ForegroundColor Red
}

# テスト3: GitHub Token（ブロックされるべき）
Write-Host "`n📝 Test 3: GitHub token (should block)" -ForegroundColor Yellow
"GITHUB_TOKEN=ghp_EXAMPLE_GITHUB_TOKEN_FOR_TEST_ONLY_XX" | Out-File test-github.txt
git add test-github.txt
git commit -m "Test github token"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✅ Test 3 passed (blocked as expected)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Test 3 failed (should have been blocked)" -ForegroundColor Red
}

# テスト4: テンプレートファイル（ブロックされないべき）
Write-Host "`n📝 Test 4: Template file (should pass)" -ForegroundColor Yellow
@"
{
  "linearApiKey": "lin_api_REPLACE_WITH_YOUR_ACTUAL_KEY_HERE_XXXX"
}
"@ | Out-File api-keys-template.json
git add api-keys-template.json
git commit -m "Test template file"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Test 4 passed" -ForegroundColor Green
    git reset --soft HEAD~1
} else {
    Write-Host "   ❌ Test 4 failed" -ForegroundColor Red
}

# クリーンアップ
Write-Host "`n🧹 Cleaning up test files..." -ForegroundColor Cyan
Remove-Item test-normal.js, test-secret.js, test-github.txt, api-keys-template.json -ErrorAction SilentlyContinue
git reset HEAD

Write-Host "`n✅ Pre-commit hook testing complete" -ForegroundColor Green
```

### 3-2. パターン網羅テスト

**test-patterns.ps1**:
```powershell
# scripts/test-patterns.ps1
# APIキーパターン網羅テスト

$testCases = @(
    @{ Pattern = "Linear API"; Key = "lin_api_EXAMPLE_KEY_DO_NOT_USE_1234567890_ABCD"; ShouldBlock = $true },
    @{ Pattern = "GitHub Token"; Key = "ghp_EXAMPLE_GITHUB_TOKEN_DO_NOT_USE_1234567"; ShouldBlock = $true },
    @{ Pattern = "Notion API"; Key = "secret_EXAMPLE_NOTION_KEY_DO_NOT_USE_1234567890"; ShouldBlock = $true },
    @{ Pattern = "Context7 API"; Key = "ctx7_EXAMPLE_CONTEXT7_KEY_TEST_ONLY"; ShouldBlock = $true },
    @{ Pattern = "OpenAI API"; Key = "sk-proj-EXAMPLE_OPENAI_KEY_FOR_TESTING_PURPOSES"; ShouldBlock = $true },
    @{ Pattern = "AWS Key"; Key = "AKIAEXAMPLEKEYFORTESTONLY"; ShouldBlock = $true },
    @{ Pattern = "Normal Code"; Key = "const apiUrl = 'https://api.example.com';"; ShouldBlock = $false }
)

Write-Host "🧪 Testing API Key Patterns" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

foreach ($test in $testCases) {
    Write-Host "`n📝 Testing: $($test.Pattern)" -ForegroundColor Yellow

    # テストファイル作成
    $test.Key | Out-File test-pattern.txt
    git add test-pattern.txt 2>$null

    # Commit試行
    git commit -m "Test $($test.Pattern)" 2>$null
    $blocked = $LASTEXITCODE -ne 0

    # 結果判定
    if ($blocked -eq $test.ShouldBlock) {
        Write-Host "   ✅ PASS" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "   ❌ FAIL" -ForegroundColor Red
        Write-Host "      Expected: $(if ($test.ShouldBlock) {'Blocked'} else {'Allowed'})" -ForegroundColor Gray
        Write-Host "      Actual: $(if ($blocked) {'Blocked'} else {'Allowed'})" -ForegroundColor Gray
        $failCount++
    }

    # リセット
    git reset HEAD 2>$null
}

# クリーンアップ
Remove-Item test-pattern.txt -ErrorAction SilentlyContinue

# サマリー
Write-Host "`n📊 Test Summary:" -ForegroundColor Cyan
Write-Host "   Passed: $passCount" -ForegroundColor Green
Write-Host "   Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) {'Green'} else {'Red'})

if ($failCount -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed" -ForegroundColor Red
    exit 1
}
```

---

## 🎨 Phase 4: カスタマイズ・拡張 (15分)

### 4-1. カスタムパターン追加

**add-custom-pattern.ps1**:
```powershell
# scripts/add-custom-pattern.ps1
# カスタムパターン追加

param(
    [Parameter(Mandatory=$true)]
    [string]$PatternName,

    [Parameter(Mandatory=$true)]
    [string]$RegexPattern
)

Write-Host "➕ Adding custom pattern to pre-commit hook" -ForegroundColor Cyan
Write-Host "   Name: $PatternName" -ForegroundColor Yellow
Write-Host "   Pattern: $RegexPattern" -ForegroundColor Yellow

# Pre-commit hook読み込み
$hookPath = ".git\hooks\pre-commit"
$hookContent = Get-Content $hookPath -Raw

# パターンセクション検索
if ($hookContent -match "PATTERNS=\(([\s\S]*?)\)") {
    $patternsSection = $matches[1]

    # 新規パターン追加
    $newPattern = "    `"$RegexPattern`"     # $PatternName"
    $updatedSection = $patternsSection.TrimEnd() + "`n$newPattern`n"

    # 置換
    $updatedContent = $hookContent -replace "PATTERNS=\(([\s\S]*?)\)", "PATTERNS=($updatedSection)"

    # 保存
    $updatedContent | Out-File -FilePath $hookPath -Encoding ASCII -NoNewline

    Write-Host "✅ Pattern added successfully" -ForegroundColor Green
    Write-Host "   Run test-patterns.ps1 to verify" -ForegroundColor Cyan
} else {
    Write-Error "❌ Could not find PATTERNS section in pre-commit hook"
    exit 1
}
```

**使用例**:
```powershell
# Slack Tokenパターン追加
.\scripts\add-custom-pattern.ps1 `
    -PatternName "Slack Token" `
    -RegexPattern "xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}"

# Stripe APIキーパターン追加
.\scripts\add-custom-pattern.ps1 `
    -PatternName "Stripe API" `
    -RegexPattern "sk_live_[a-zA-Z0-9]{24,}"
```

### 4-2. False Positive対策

**whitelist.json**:
```json
{
  "whitelist": {
    "files": [
      "docs/**/*.md",
      "examples/**/*",
      "*.example",
      "*-template.*"
    ],
    "patterns": [
      "lin_api_EXAMPLE_PATTERN_FOR_WHITELIST_ONLY_XX",
      "ghp_EXAMPLE_PATTERN_FOR_WHITELIST_ONLY_XXX",
      "secret_EXAMPLE_PATTERN_FOR_WHITELIST_ONLY_X"
    ]
  }
}
```

**pre-commit hook拡張**（whitelistサポート）:
```bash
#!/bin/bash
# Pre-commit Hook with Whitelist Support

WHITELIST_FILE="whitelist.json"

# Whitelist読み込み
if [ -f "$WHITELIST_FILE" ]; then
    WHITELIST_PATTERNS=$(cat "$WHITELIST_FILE" | jq -r '.whitelist.patterns[]')
fi

# ... [existing code] ...

# パターンマッチング（Whitelist考慮）
for PATTERN in "${PATTERNS[@]}"; do
    MATCHES=$(grep -E -i -n "$PATTERN" "$FILE")

    if [ -n "$MATCHES" ]; then
        # Whitelistチェック
        IS_WHITELISTED=false
        while IFS= read -r whitelisted; do
            if echo "$MATCHES" | grep -q "$whitelisted"; then
                IS_WHITELISTED=true
                break
            fi
        done <<< "$WHITELIST_PATTERNS"

        if [ "$IS_WHITELISTED" = false ]; then
            echo "❌ BLOCKED: Potential API key found in $FILE"
            FOUND_SECRETS=1
        fi
    fi
done
```

---

## 📊 Phase 5: 監視・レポート (10分)

### 5-1. スキャンログ記録

**pre-commit hook拡張**（ログ記録機能）:
```bash
#!/bin/bash
# Pre-commit Hook with Logging

LOG_FILE=".git/pre-commit-scan.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pre-commit scan started" >> "$LOG_FILE"

# ... [scanning logic] ...

if [ $FOUND_SECRETS -eq 1 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] BLOCKED: API key detected in $FILE" >> "$LOG_FILE"
    exit 1
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PASSED: No secrets detected" >> "$LOG_FILE"
    exit 0
fi
```

### 5-2. スキャンレポート生成

**generate-scan-report.ps1**:
```powershell
# scripts/generate-scan-report.ps1
# Pre-commit スキャンレポート生成

$logFile = ".git\pre-commit-scan.log"

if (-not (Test-Path $logFile)) {
    Write-Error "❌ Log file not found: $logFile"
    exit 1
}

Write-Host "📊 Pre-commit Scan Report" -ForegroundColor Cyan

# ログ読み込み
$logs = Get-Content $logFile

# 統計計算
$totalScans = ($logs | Select-String "Pre-commit scan started").Count
$blocked = ($logs | Select-String "BLOCKED").Count
$passed = ($logs | Select-String "PASSED").Count

Write-Host "`nStatistics:" -ForegroundColor Yellow
Write-Host "   Total Scans: $totalScans" -ForegroundColor White
Write-Host "   Blocked: $blocked" -ForegroundColor Red
Write-Host "   Passed: $passed" -ForegroundColor Green

# 最近のブロック
$recentBlocks = $logs | Select-String "BLOCKED" | Select-Object -Last 10

if ($recentBlocks) {
    Write-Host "`nRecent Blocks:" -ForegroundColor Yellow
    $recentBlocks | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Red
    }
}

# 推奨アクション
if ($blocked -gt 0) {
    Write-Host "`n⚠️  Blocked commits detected" -ForegroundColor Yellow
    Write-Host "   Review: workflows/api-key-security/emergency-response.md" -ForegroundColor Cyan
}
```

---

## 🔄 Phase 6: CI/CD統合 (10分)

### 6-1. GitHub Actions統合

**.github/workflows/secret-scan.yml**:
```yaml
name: Secret Scan

on:
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Install dependencies
        run: |
          sudo apt-get install -y jq

      - name: Run secret scan
        run: |
          bash .git/hooks/pre-commit

      - name: Check scan results
        if: failure()
        run: |
          echo "❌ Secret scan detected API keys in this PR"
          echo "Please remove hardcoded secrets before merging"
          exit 1
```

### 6-2. 定期スキャン

**scheduled-scan.yml**:
```yaml
name: Scheduled Secret Scan

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight

jobs:
  full-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Full history scan
        run: |
          # Git履歴全体スキャン
          git log --all --source --full-history --grep="lin_api_" --pretty=format:"%H - %s"
          git log --all --source --full-history --grep="ghp_" --pretty=format:"%H - %s"

      - name: Notify if leaks found
        if: failure()
        run: |
          # Slack/Discord通知
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{"text":"🚨 API key leak detected in repository history"}'
```

---

## 📋 チェックリスト

### セットアップ確認
- [ ] Pre-commit hookインストール済み
- [ ] 実行権限設定済み
- [ ] test-pre-commit.ps1実行成功
- [ ] test-patterns.ps1実行成功
- [ ] すべてのテストケースPASS

### カスタマイズ確認
- [ ] カスタムパターン追加（必要な場合）
- [ ] Whitelist設定（必要な場合）
- [ ] ログ記録有効化
- [ ] CI/CD統合（GitHub Actions）

### 運用確認
- [ ] チーム全員にHookインストール指示
- [ ] 定期スキャンレポート確認
- [ ] False Positive対応手順確立

---

## 🔗 関連ドキュメント

- **workflows/api-key-security/local-only-management.md**: APIキー管理
- **workflows/api-key-security/emergency-response.md**: 漏洩時対応
- **config/api-keys-template.json**: APIキーテンプレート
- **.gitignore**: 除外設定

---

**バージョン**: 2.0.0
**最終更新**: 2025-10-02
**推奨**: すべてのプロジェクトで必須
