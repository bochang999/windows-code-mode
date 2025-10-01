# Windows-ai-assistant-knowledge-hub プロジェクト設計書

## 🎯 プロジェクト目的

Termux環境の`ai-assistant-knowledge-hub`をWindows環境に最適化したナレッジベース構築。
Windows特有の制約（PowerShell、パス形式、MCP統合）に対応し、windows-code-mode開発を支援。

---

## 📊 元システム分析

### ai-assistant-knowledge-hub構成

```
ai-assistant-knowledge-hub/
├── README.md                 # システム概要・8フェーズワークフロー
├── commons/
│   └── constitution.md       # 基本理念・開発方針
├── workflows/
│   ├── linear_issue_management.md
│   ├── git_push_troubleshooting.md
│   ├── milestone_creation.md
│   ├── build_error_correction.md
│   ├── code_quality_audit/
│   │   ├── README.md
│   │   ├── phase1_ai_self_review.md
│   │   ├── phase2_sonarqube_analysis.md
│   │   ├── phase3_comparative_analysis.md
│   │   └── phase4_knowledge_base_update.md
│   ├── build_error_correction/
│   │   ├── phase1_detection.md
│   │   ├── phase2_investigation.md
│   │   ├── phase2.5_analysis.md
│   │   ├── phase3_consultation.md
│   │   ├── phase4_implementation.md
│   │   ├── phase4.5_code_review.md
│   │   ├── phase5_deploy_prep.md
│   │   └── phase6_sonarqube_final.md
│   └── system_test/
│       └── phase1.md
└── config/
    └── project_map.json      # プロジェクトマッピング
```

### 核心機能
1. **8フェーズワークフロー**: Linear Issue → AI戦略立案 → 実装
2. **Sequential Thinking MCP統合**: Phase 4戦略立案
3. **AI多段階レビュー**: Gemini + Claude
4. **Linear自動管理**: Issue状態自動更新

---

## 🏗️ Windows版設計

### ディレクトリ構造

```
windows-ai-assistant-knowledge-hub/
├── README.md                           # Windows版概要
├── SETUP.md                            # Windows環境セットアップガイド
│
├── commons/
│   ├── constitution.md                 # 開発理念（継承）
│   └── windows-development-principles.md # Windows特有原則
│
├── workflows/
│   ├── linear_issue_management.md      # Linear管理（継承）
│   ├── windows-mcp-integration.md      # Windows MCP統合ワークフロー
│   ├── powershell-automation.md        # PowerShell自動化
│   ├── android-build-automation.md     # Android Studio統合
│   │
│   ├── code_quality/
│   │   ├── README.md
│   │   ├── eslint-integration.md       # ESLint LSP統合
│   │   └── pre-commit-hooks.md         # Git hooks管理
│   │
│   ├── api-key-security/
│   │   ├── local-only-management.md    # APIキー管理
│   │   ├── pre-commit-scanning.md      # 漏洩防止
│   │   └── emergency-response.md       # 緊急対応手順
│   │
│   ├── mcp-servers/
│   │   ├── sequential-thinking.md      # Sequential Thinking MCP
│   │   ├── n8n-workflow.md             # n8n MCP活用
│   │   ├── notion-integration.md       # Notion API
│   │   └── context7-docs.md            # Context7技術情報
│   │
│   └── troubleshooting/
│       ├── powershell-encoding.md      # エンコーディング問題
│       ├── path-resolution.md          # パス形式変換
│       └── mcp-server-startup.md       # MCPサーバー起動
│
├── config/
│   ├── project_map.json                # Windowsプロジェクトマッピング
│   ├── mcp-servers.json                # MCP設定管理
│   └── api-keys-template.json          # APIキーテンプレート
│
├── scripts/
│   ├── setup-windows-environment.ps1   # 環境初期化
│   ├── validate-mcp-servers.ps1        # MCP動作確認
│   └── sync-linear-status.ps1          # Linear同期
│
└── templates/
    ├── linear-issue-report.md          # Issueレポートテンプレート
    ├── mcp-integration-test.js         # MCP統合テスト
    └── workflow-design.md              # ワークフロー設計書
```

---

## 🔄 主要な変更点

### 1. Bash → PowerShell変換

**Before (Termux)**:
```bash
#!/bin/bash
cat ~/.linear-api-key
curl -X POST https://api.linear.app/graphql
```

**After (Windows)**:
```powershell
# PowerShell
cat $env:USERPROFILE\.linear-api-key
Invoke-RestMethod -Uri https://api.linear.app/graphql -Method POST
```

### 2. パス形式統一

**Before**:
```bash
$HOME/.linear-api-key
/data/data/com.termux/files/home/project
```

**After**:
```powershell
$env:USERPROFILE\.linear-api-key
C:\Users\kirok\dev\windows-code-mode
```

### 3. MCP統合強化

**新規追加**:
- Sequential Thinking MCP運用ガイド
- n8n MCP ワークフロー設計パターン
- Notion/Context7統合ベストプラクティス
- MCP Servers起動スクリプト

### 4. セキュリティ機能追加

**Windows特化**:
- Pre-commit hookのPowerShell版
- .env管理ガイド（Windows Credential Manager統合）
- APIキー漏洩スキャナー（PowerShell実装）

---

## 📋 新規ワークフロー

### 1. Windows MCP統合ワークフロー
```markdown
workflows/windows-mcp-integration.md

Phase 1: MCP Servers起動確認
Phase 2: API接続テスト
Phase 3: Sandbox統合検証
Phase 4: Linear/Notion連携確認
```

### 2. PowerShell自動化ワークフロー
```markdown
workflows/powershell-automation.md

- Linear Issue自動更新
- APK自動ビルド + レポート生成
- GitHub自動commit/push
- Notion → Linear同期
```

### 3. Android開発統合ワークフロー
```markdown
workflows/android-build-automation.md

- Gradleビルド自動化
- n8n Webhook連携
- Linear Issueステータス同期
- ビルド結果Notion記録
```

---

## 🛠️ 実装フェーズ

### Phase 1: 基盤構築（1-2日）

**タスク**:
- [x] ディレクトリ構造作成
- [ ] README.md/SETUP.md作成
- [ ] commons/継承・Windows原則追加
- [ ] config/基本設定ファイル

**成果物**:
- プロジェクト骨格
- セットアップガイド
- 設定テンプレート

### Phase 2: ワークフロー移植（2-3日）

**タスク**:
- [ ] linear_issue_management.md（PowerShell版）
- [ ] windows-mcp-integration.md
- [ ] api-key-security/完全ガイド
- [ ] mcp-servers/各MCP運用マニュアル

**成果物**:
- 10個のワークフローマニュアル
- PowerShellスクリプト5個

### Phase 3: スクリプト実装（2-3日）

**タスク**:
- [ ] setup-windows-environment.ps1
- [ ] validate-mcp-servers.ps1
- [ ] sync-linear-status.ps1
- [ ] api-key-scanner.ps1

**成果物**:
- 自動化スクリプト一式
- テストスクリプト

### Phase 4: テンプレート作成（1日）

**タスク**:
- [ ] linear-issue-report.md
- [ ] mcp-integration-test.js
- [ ] workflow-design.md

**成果物**:
- 実用テンプレート3個

### Phase 5: ドキュメント整備（1日）

**タスク**:
- [ ] troubleshooting/よくあるエラー集
- [ ] 統合テストガイド
- [ ] ベストプラクティス集

**成果物**:
- 完全ドキュメント

---

## 📊 想定工数

| フェーズ | 工数 | 成果物 |
|---------|-----|--------|
| Phase 1: 基盤構築 | 1-2日 | プロジェクト骨格 |
| Phase 2: ワークフロー移植 | 2-3日 | 10マニュアル |
| Phase 3: スクリプト実装 | 2-3日 | 5スクリプト |
| Phase 4: テンプレート | 1日 | 3テンプレート |
| Phase 5: ドキュメント | 1日 | 完全ドキュメント |
| **合計** | **7-10日** | **完全システム** |

---

## 🎯 成功基準

### 必須要件
- ✅ Windows環境で全ワークフロー動作
- ✅ MCP Servers統合完了
- ✅ Linear自動管理機能動作
- ✅ APIキーセキュリティ保証
- ✅ PowerShell自動化スクリプト動作

### 推奨要件
- ✅ Claude Desktop MCP統合
- ✅ n8nワークフロー自動化
- ✅ Android開発CI/CD連携
- ✅ トラブルシューティング完備

---

## 🔗 関連リソース

**既存プロジェクト**:
- ai-assistant-knowledge-hub (Termux版元システム)
- windows-code-mode (Windows開発環境)

**Linear Issues**:
- BOC-116: Windows Code Mode Sandbox統合

**GitHub Repositories**:
- https://github.com/bochang999/windows-code-mode
- (予定) https://github.com/bochang999/windows-ai-assistant-knowledge-hub

---

**作成日**: 2025-10-02
**バージョン**: 1.0.0 (設計書)
**次のステップ**: Phase 1実装開始
