# Android Build Automation Workflow

Windows環境でのAndroid開発自動化ワークフロー完全ガイド。Gradle + Linear + n8n統合。

---

## 🎯 概要

Android開発で以下を自動化：
1. Gradle自動ビルド（Debug/Release）
2. Linear Issue自動更新
3. n8n Webhook連携
4. GitHub Actions CI/CD
5. APK配布自動化

---

## 📋 前提条件

### 必須ソフトウェア
```powershell
# Android Studio
# ダウンロード: https://developer.android.com/studio

# Java JDK 17+
java -version

# Gradle (Android Studio付属)
.\gradlew --version

# PowerShell 5.1+
$PSVersionTable.PSVersion
```

### プロジェクト構成
```
your-android-project/
├── app/
│   ├── build.gradle
│   └── src/
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
└── scripts/              # 自動化スクリプト
    ├── build-debug.ps1
    ├── build-release.ps1
    └── deploy-apk.ps1
```

---

## 🏗️ Phase 1: Gradle基本ビルド (10分)

### 1-1. Debug Build

**基本コマンド**:
```powershell
# Clean build
.\gradlew clean assembleDebug

# Incremental build
.\gradlew assembleDebug

# Verbose output
.\gradlew assembleDebug --stacktrace --info
```

**APK出力先**:
```
app/build/outputs/apk/debug/app-debug.apk
```

### 1-2. Release Build

**基本コマンド**:
```powershell
# Release build (署名付き)
.\gradlew assembleRelease

# Bundle生成 (Google Play用)
.\gradlew bundleRelease
```

**APK/Bundle出力先**:
```
app/build/outputs/apk/release/app-release.apk
app/build/outputs/bundle/release/app-release.aab
```

### 1-3. Build設定確認

**app/build.gradle**:
```groovy
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.example.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }

    signingConfigs {
        release {
            storeFile file("keystore.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
}
```

---

## 🤖 Phase 2: PowerShell自動化 (20分)

### 2-1. build-debug.ps1

**用途**: Debug Build + Linear更新

**スクリプト**:
```powershell
# scripts/build-debug.ps1
# Android Debug Build自動化

param(
    [Parameter(Mandatory=$false)]
    [string]$IssueId = $null,

    [Parameter(Mandatory=$false)]
    [switch]$Install,

    [Parameter(Mandatory=$false)]
    [switch]$Run
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "🏗️  Android Debug Build" -ForegroundColor Cyan
Write-Host "   Time: $timestamp" -ForegroundColor Gray

# Clean build
Write-Host "`n🧹 Cleaning..." -ForegroundColor Yellow
.\gradlew clean --quiet

# Build
Write-Host "📦 Building..." -ForegroundColor Yellow
.\gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build succeeded!" -ForegroundColor Green

    # APK情報
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "   APK: $apkPath" -ForegroundColor Cyan
        Write-Host "   Size: $([Math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }

    # インストール
    if ($Install) {
        Write-Host "`n📲 Installing to device..." -ForegroundColor Cyan
        adb install -r $apkPath

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Installed successfully" -ForegroundColor Green

            # アプリ起動
            if ($Run) {
                Write-Host "`n🚀 Launching app..." -ForegroundColor Cyan
                adb shell am start -n com.example.app/.MainActivity
            }
        } else {
            Write-Host "❌ Installation failed" -ForegroundColor Red
        }
    }

    # Linear Issue更新
    if ($IssueId) {
        Write-Host "`n🔄 Updating Linear Issue..." -ForegroundColor Cyan
        $comment = @"
## ✅ Debug Build成功

**Time**: $timestamp
**APK**: ``$apkPath``
**Size**: $([Math]::Round($apkSize, 2)) MB

Debug Build成功しました。
"@
        & "$PSScriptRoot\add-linear-comment.ps1" -IssueId $IssueId -Body $comment
    }

    exit 0
} else {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red

    # Linear Issue更新（エラー）
    if ($IssueId) {
        $errorComment = @"
## ❌ Debug Build失敗

**Time**: $timestamp

Build失敗。ログ確認が必要です。

``````
$(.\gradlew assembleDebug 2>&1 | Select-Object -Last 20)
``````
"@
        & "$PSScriptRoot\add-linear-comment.ps1" -IssueId $IssueId -Body $errorComment
    }

    exit 1
}
```

**使用例**:
```powershell
# シンプルビルド
.\scripts\build-debug.ps1

# ビルド + インストール
.\scripts\build-debug.ps1 -Install

# ビルド + インストール + 起動
.\scripts\build-debug.ps1 -Install -Run

# ビルド + Linear更新
.\scripts\build-debug.ps1 -IssueId "cff8f12c-d085-4e18-937a-2c07d402cfe8"

# 完全自動化
.\scripts\build-debug.ps1 `
    -IssueId "issue_id" `
    -Install `
    -Run
```

### 2-2. build-release.ps1

**用途**: Release Build + 署名 + 配布準備

**スクリプト**:
```powershell
# scripts/build-release.ps1
# Android Release Build自動化

param(
    [Parameter(Mandatory=$false)]
    [string]$IssueId = $null,

    [Parameter(Mandatory=$false)]
    [string]$VersionName = $null,

    [Parameter(Mandatory=$false)]
    [switch]$CreateTag
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "🏗️  Android Release Build" -ForegroundColor Cyan
Write-Host "   Time: $timestamp" -ForegroundColor Gray

# 環境変数確認
if (-not $env:KEYSTORE_PASSWORD) {
    Write-Error "❌ KEYSTORE_PASSWORD not set"
    exit 1
}

# Clean build
Write-Host "`n🧹 Cleaning..." -ForegroundColor Yellow
.\gradlew clean --quiet

# Release build
Write-Host "📦 Building Release APK..." -ForegroundColor Yellow
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Release Build succeeded!" -ForegroundColor Green

    # APK情報
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        $apkHash = (Get-FileHash $apkPath -Algorithm SHA256).Hash

        Write-Host "   APK: $apkPath" -ForegroundColor Cyan
        Write-Host "   Size: $([Math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host "   SHA256: $apkHash" -ForegroundColor Gray

        # 署名確認
        Write-Host "`n🔐 Verifying signature..." -ForegroundColor Yellow
        jarsigner -verify -verbose -certs $apkPath

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Signature verified" -ForegroundColor Green
        } else {
            Write-Host "❌ Signature verification failed" -ForegroundColor Red
            exit 1
        }
    }

    # バージョンタグ作成
    if ($CreateTag -and $VersionName) {
        Write-Host "`n🏷️  Creating Git tag..." -ForegroundColor Cyan
        git tag -a "v$VersionName" -m "Release v$VersionName"
        git push origin "v$VersionName"

        Write-Host "✅ Tag created: v$VersionName" -ForegroundColor Green
    }

    # Linear Issue更新
    if ($IssueId) {
        Write-Host "`n🔄 Updating Linear Issue..." -ForegroundColor Cyan
        $comment = @"
## ✅ Release Build成功

**Time**: $timestamp
**Version**: $VersionName
**APK**: ``$apkPath``
**Size**: $([Math]::Round($apkSize, 2)) MB
**SHA256**: ``$apkHash``

Release Build成功しました。配布準備完了。
"@
        & "$PSScriptRoot\add-linear-comment.ps1" -IssueId $IssueId -Body $comment
    }

    # 配布ディレクトリにコピー
    $releaseDir = "releases\v$VersionName"
    if ($VersionName) {
        New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
        Copy-Item $apkPath "$releaseDir\app-release-v$VersionName.apk"

        # リリースノート作成
        $releaseNotes = @"
# Release v$VersionName

**Date**: $timestamp
**APK**: app-release-v$VersionName.apk
**Size**: $([Math]::Round($apkSize, 2)) MB
**SHA256**: $apkHash

## Changes
- [Add your changes here]

## Installation
``````bash
adb install app-release-v$VersionName.apk
``````
"@
        $releaseNotes | Out-File "$releaseDir\RELEASE_NOTES.md"

        Write-Host "✅ Release files copied to $releaseDir" -ForegroundColor Green
    }

    exit 0
} else {
    Write-Host "`n❌ Release Build failed!" -ForegroundColor Red
    exit 1
}
```

**使用例**:
```powershell
# 環境変数設定
$env:KEYSTORE_PASSWORD = "your_password"
$env:KEY_ALIAS = "your_alias"
$env:KEY_PASSWORD = "your_key_password"

# シンプルリリースビルド
.\scripts\build-release.ps1

# バージョン指定
.\scripts\build-release.ps1 -VersionName "1.0.0"

# バージョン + Gitタグ作成
.\scripts\build-release.ps1 -VersionName "1.0.0" -CreateTag

# 完全自動化
.\scripts\build-release.ps1 `
    -IssueId "issue_id" `
    -VersionName "1.0.0" `
    -CreateTag
```

---

## 🔗 Phase 3: n8n Webhook連携 (30分)

### 3-1. n8n Workflow設計

**目的**: GitHub Push → n8n → Gradle Build → Linear更新

**Workflow構造**:
```
1. Webhook Trigger (GitHub)
   ↓
2. HTTP Request (Gradle Build API)
   ↓
3. Wait (Build完了まで)
   ↓
4. HTTP Request (Build結果取得)
   ↓
5. Linear API (Issue更新)
   ↓
6. Notion API (ビルドレポート記録)
   ↓
7. Discord Webhook (通知)
```

### 3-2. PowerShell Webhook Receiver

**webhook-receiver.ps1**:
```powershell
# scripts/webhook-receiver.ps1
# n8n Webhook受信 → Build実行

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 8080
)

Write-Host "🎣 Starting Webhook Receiver on port $Port..." -ForegroundColor Cyan

# HTTPリスナー起動
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "✅ Listening on http://localhost:$Port/" -ForegroundColor Green
Write-Host "   Endpoint: /build" -ForegroundColor Yellow

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    Write-Host "`n📡 Webhook received: $($request.Url.AbsolutePath)" -ForegroundColor Cyan

    if ($request.Url.AbsolutePath -eq "/build") {
        # リクエストボディ読み込み
        $reader = New-Object System.IO.StreamReader($request.InputStream)
        $body = $reader.ReadToEnd() | ConvertFrom-Json

        Write-Host "   Build Type: $($body.buildType)" -ForegroundColor Yellow
        Write-Host "   Issue ID: $($body.issueId)" -ForegroundColor Yellow

        # Build実行
        $buildScript = if ($body.buildType -eq "release") {
            ".\scripts\build-release.ps1"
        } else {
            ".\scripts\build-debug.ps1"
        }

        $buildArgs = @()
        if ($body.issueId) {
            $buildArgs += "-IssueId", $body.issueId
        }

        # バックグラウンドでBuild実行
        Start-Job -ScriptBlock {
            param($script, $args)
            & $script @args
        } -ArgumentList $buildScript, $buildArgs

        # レスポンス返却
        $responseJson = @{
            status = "started"
            buildType = $body.buildType
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        } | ConvertTo-Json

        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseJson)
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.OutputStream.Close()

        Write-Host "✅ Build started" -ForegroundColor Green
    } else {
        # 404エラー
        $response.StatusCode = 404
        $response.OutputStream.Close()
    }
}

$listener.Stop()
```

**使用例**:
```powershell
# Webhook Receiver起動
.\scripts\webhook-receiver.ps1

# ポート指定
.\scripts\webhook-receiver.ps1 -Port 9000

# バックグラウンド起動
Start-Job -ScriptBlock {
    Set-Location "C:\path\to\project"
    .\scripts\webhook-receiver.ps1
}
```

### 3-3. n8n Workflow設定

**n8n UIで設定**:

1. **Webhook Trigger**:
   - Method: POST
   - Path: `/android-build`
   - Response: Immediately

2. **HTTP Request (Build Trigger)**:
   - Method: POST
   - URL: `http://localhost:8080/build`
   - Body:
     ```json
     {
       "buildType": "{{ $json.buildType }}",
       "issueId": "{{ $json.issueId }}"
     }
     ```

3. **Wait Node**:
   - Time: 5 minutes
   - (ビルド完了まで待機)

4. **Linear API (Issue更新)**:
   - Method: POST
   - URL: `https://api.linear.app/graphql`
   - Headers:
     - `Authorization`: `{{ $credentials.linearApi.apiKey }}`
   - Body:
     ```graphql
     mutation {
       commentCreate(input: {
         issueId: "{{ $json.issueId }}",
         body: "Build completed via n8n automation"
       }) { success }
     }
     ```

### 3-4. GitHubからn8nトリガー

**GitHub Webhook設定**:
1. Repository Settings → Webhooks
2. Payload URL: `https://your-n8n.com/webhook/android-build`
3. Content type: `application/json`
4. Events: `push` (mainブランチのみ)

**.github/workflows/trigger-n8n.yml**:
```yaml
name: Trigger n8n Build

on:
  push:
    branches: [main]

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger n8n Webhook
        run: |
          curl -X POST https://your-n8n.com/webhook/android-build \
            -H "Content-Type: application/json" \
            -d '{
              "buildType": "debug",
              "issueId": "${{ secrets.LINEAR_ISSUE_ID }}",
              "ref": "${{ github.ref }}",
              "sha": "${{ github.sha }}"
            }'
```

---

## 🚀 Phase 4: GitHub Actions CI/CD (20分)

### 4-1. Android Build Action

**.github/workflows/android-build.yml**:
```yaml
name: Android Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: app/build/outputs/apk/debug/app-debug.apk

      - name: Update Linear Issue
        if: success()
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          LINEAR_ISSUE_ID: ${{ secrets.LINEAR_ISSUE_ID }}
        run: |
          curl -X POST https://api.linear.app/graphql \
            -H "Authorization: $LINEAR_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "query": "mutation { commentCreate(input: { issueId: \"'$LINEAR_ISSUE_ID'\", body: \"✅ GitHub Actions Build Success: '${{ github.sha }}' }) { success } }"
            }'
```

### 4-2. Release Build Action

**.github/workflows/release.yml**:
```yaml
name: Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Decode Keystore
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
        run: |
          echo $KEYSTORE_BASE64 | base64 -d > keystore.jks

      - name: Build Release APK
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: ./gradlew assembleRelease

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: app/build/outputs/apk/release/app-release.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📊 Phase 5: ビルド分析・最適化 (15分)

### 5-1. Build時間分析

**build-analyze.ps1**:
```powershell
# scripts/build-analyze.ps1
# Build時間分析

Write-Host "📊 Build Time Analysis" -ForegroundColor Cyan

# Profile付きビルド
.\gradlew assembleDebug --profile

# レポート確認
$profileDir = "build\reports\profile"
$latestProfile = Get-ChildItem $profileDir -Filter "profile-*.html" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($latestProfile) {
    Write-Host "✅ Profile report: $($latestProfile.FullName)" -ForegroundColor Green
    Start-Process $latestProfile.FullName
}
```

### 5-2. APKサイズ分析

**analyze-apk-size.ps1**:
```powershell
# scripts/analyze-apk-size.ps1
# APKサイズ分析

param(
    [Parameter(Mandatory=$true)]
    [string]$ApkPath
)

Write-Host "📦 APK Size Analysis" -ForegroundColor Cyan
Write-Host "   APK: $ApkPath" -ForegroundColor Gray

# 基本情報
$apkSize = (Get-Item $ApkPath).Length
Write-Host "`nTotal Size: $([Math]::Round($apkSize / 1MB, 2)) MB" -ForegroundColor Yellow

# APK Analyzer (Android SDK tools)
$buildTools = "$env:ANDROID_HOME\build-tools\34.0.0"
if (Test-Path "$buildTools\apkanalyzer.bat") {
    Write-Host "`n📊 Method Count:" -ForegroundColor Cyan
    & "$buildTools\apkanalyzer.bat" dex packages $ApkPath

    Write-Host "`n📊 File Sizes:" -ForegroundColor Cyan
    & "$buildTools\apkanalyzer.bat" apk file-size $ApkPath
}
```

---

## 🔄 統合ワークフロー例

### Example 1: 完全自動化開発サイクル

```powershell
# 開発 → テスト → Linear更新 → GitHub Push → n8n Build

# Step 1: 開発作業
# ... コード実装 ...

# Step 2: ローカルテストビルド
.\scripts\build-debug.ps1 -Install -Run

# Step 3: コミット
.\scripts\auto-git-commit.ps1 `
    -Message "feat: Add new feature" `
    -IssueId "issue_id" `
    -Push

# Step 4: GitHub Actions自動ビルド (自動実行)
# Step 5: n8n Webhook経由でLinear更新 (自動実行)

# Step 6: 手動確認・Issue完了
.\scripts\add-linear-comment.ps1 `
    -IssueId "issue_id" `
    -Body "✅ すべての自動化ステップ完了・検証済み"
```

### Example 2: リリース準備フルフロー

```powershell
# バージョン設定
$version = "1.0.0"
$issueId = "release-issue-id"

# Step 1: リリースビルド
.\scripts\build-release.ps1 `
    -IssueId $issueId `
    -VersionName $version `
    -CreateTag

# Step 2: APKサイズ分析
.\scripts\analyze-apk-size.ps1 `
    -ApkPath "releases\v$version\app-release-v$version.apk"

# Step 3: GitHub Release作成
gh release create "v$version" `
    "releases\v$version\app-release-v$version.apk" `
    --title "Release v$version" `
    --notes-file "releases\v$version\RELEASE_NOTES.md"

# Step 4: Linear Issue完了
.\scripts\sync-linear-status.ps1 -IssueId $issueId -Status Done
```

---

## 🚨 トラブルシューティング

### エラー1: Gradle Build失敗

**症状**:
```
FAILURE: Build failed with an exception.
```

**対処**:
```powershell
# 1. Clean build
.\gradlew clean

# 2. Gradle cache削除
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"

# 3. 詳細ログ確認
.\gradlew assembleDebug --stacktrace --info

# 4. Android Studio同期
# Android Studio → File → Sync Project with Gradle Files
```

### エラー2: 署名エラー

**症状**:
```
Failed to read key from keystore
```

**対処**:
```powershell
# 1. 環境変数確認
Write-Host "KEYSTORE_PASSWORD: $env:KEYSTORE_PASSWORD"
Write-Host "KEY_ALIAS: $env:KEY_ALIAS"

# 2. Keystore確認
keytool -list -v -keystore keystore.jks

# 3. 新規Keystore作成（必要な場合）
keytool -genkey -v -keystore keystore.jks `
    -alias your-alias -keyalg RSA -keysize 2048 -validity 10000
```

### エラー3: ADB接続エラー

**症状**:
```
adb: device not found
```

**対処**:
```powershell
# 1. デバイス確認
adb devices

# 2. ADB再起動
adb kill-server
adb start-server

# 3. USB設定確認（実機の場合）
# デバイス設定 → 開発者向けオプション → USBデバッグ有効化
```

---

## 📋 チェックリスト

### セットアップ確認
- [ ] Android Studio インストール済み
- [ ] JDK 17+ インストール済み
- [ ] Gradle動作確認
- [ ] Keystoreファイル作成済み
- [ ] 環境変数設定済み

### スクリプト配置
- [ ] build-debug.ps1 配置
- [ ] build-release.ps1 配置
- [ ] webhook-receiver.ps1 配置
- [ ] analyze-apk-size.ps1 配置

### 統合確認
- [ ] Linear API連携テスト
- [ ] n8n Webhook連携テスト
- [ ] GitHub Actions動作確認
- [ ] 完全自動化フロー実行

---

## 🔗 関連ドキュメント

- **workflows/powershell-automation.md**: PowerShell詳細
- **workflows/windows-mcp-integration.md**: MCP統合
- **workflows/linear_issue_management.md**: Linear管理
- **config/project_map.json**: プロジェクト設定

---

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
**対象環境**: Windows 10/11, Android Studio, Gradle 8.0+
