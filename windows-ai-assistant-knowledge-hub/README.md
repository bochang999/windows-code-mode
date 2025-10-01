# 🪟 Windows AI Assistant Knowledge Hub

Windows環境に最適化したAI協業ナレッジベースシステム。
`windows-code-mode`プロジェクトの開発を支援するワークフロー・ベストプラクティス集。

---

## 🎯 プロジェクト目的

**Termux版`ai-assistant-knowledge-hub`をWindows環境に完全移植**し、以下を実現：

1. ✅ **PowerShell最適化**: Bash → PowerShell完全対応
2. ✅ **MCP統合強化**: 7つのMCPサーバー運用ガイド
3. ✅ **セキュリティ徹底**: APIキーローカル管理・漏洩防止
4. ✅ **Android開発支援**: Gradle/n8n/Linear統合ワークフロー

---

## 🏗️ システム構成

```
windows-ai-assistant-knowledge-hub/
├── README.md                   # このファイル
├── SETUP.md                    # セットアップガイド
│
├── commons/                    # 基本理念・原則
│   ├── constitution.md
│   └── windows-development-principles.md
│
├── workflows/                  # ワークフローマニュアル
│   ├── linear_issue_management.md
│   ├── windows-mcp-integration.md
│   ├── powershell-automation.md
│   ├── android-build-automation.md
│   │
│   ├── code_quality/           # コード品質
│   │   ├── eslint-integration.md
│   │   └── pre-commit-hooks.md
│   │
│   ├── api-key-security/       # セキュリティ
│   │   ├── local-only-management.md
│   │   ├── pre-commit-scanning.md
│   │   └── emergency-response.md
│   │
│   ├── mcp-servers/            # MCP運用
│   │   ├── sequential-thinking.md
│   │   ├── n8n-workflow.md
│   │   ├── notion-integration.md
│   │   └── context7-docs.md
│   │
│   └── troubleshooting/        # トラブルシューティング
│       ├── powershell-encoding.md
│       ├── path-resolution.md
│       └── mcp-server-startup.md
│
├── config/                     # 設定ファイル
│   ├── project_map.json
│   ├── mcp-servers.json
│   └── api-keys-template.json
│
├── scripts/                    # 自動化スクリプト
│   ├── setup-windows-environment.ps1
│   ├── validate-mcp-servers.ps1
│   └── sync-linear-status.ps1
│
└── templates/                  # テンプレート
    ├── linear-issue-report.md
    ├── mcp-integration-test.js
    └── workflow-design.md
```

---

## 🚀 クイックスタート

### 1. セットアップ
```powershell
# リポジトリclone
git clone https://github.com/bochang999/windows-ai-assistant-knowledge-hub.git
cd windows-ai-assistant-knowledge-hub

# Windows環境初期化
.\scripts\setup-windows-environment.ps1
```

### 2. MCP Servers起動
```powershell
# Sequential Thinking MCP
Start-Process powershell -ArgumentList "npx -y mcp-server-sequential-thinking"

# n8n MCP
Start-Process powershell -ArgumentList "npx -y @n8n-mcp/server"
```

### 3. 動作確認
```powershell
# MCP Servers検証
.\scripts\validate-mcp-servers.ps1
```

詳細は **[SETUP.md](SETUP.md)** 参照。

---

## 📚 主要ワークフロー

### 1. Linear Issue管理
**workflows/linear_issue_management.md**

```powershell
# Issue読み取り → "In Progress"
# 作業実行
# 完了 → コメント追加 → "In Review"
```

**自動化**: `scripts/sync-linear-status.ps1`

### 2. MCP統合開発
**workflows/windows-mcp-integration.md**

- Sequential Thinking: 多段階思考パターン
- n8n: ワークフロー自動化（536ノード）
- Notion: 日本語入力対応
- Context7: 技術ドキュメント即座取得

### 3. セキュリティ管理
**workflows/api-key-security/**

- APIキー完全ローカル化
- Pre-commit hook自動スキャン
- 漏洩時緊急対応手順

### 4. Android開発自動化
**workflows/android-build-automation.md**

- Gradle自動ビルド
- n8n Webhook連携
- Linear Issue自動更新

---

## 🔧 必須設定

### APIキー設定
```powershell
# .envファイル作成
copy config\api-keys-template.json .env

# 編集
notepad .env

# 推奨: 別ファイル保存
echo "lin_api_xxxxx" > $env:USERPROFILE\.linear-api-key
echo "ghp_xxxxx" > $env:USERPROFILE\.github-token
```

### MCP Servers設定
```powershell
# Claude Desktop統合
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

詳細は **workflows/api-key-security/local-only-management.md** 参照。

---

## 🎓 学習パス

### 初級（Windows環境構築）
1. SETUP.md: 環境セットアップ
2. workflows/linear_issue_management.md: Linear管理
3. workflows/api-key-security/local-only-management.md: セキュリティ基礎

### 中級（MCP統合）
1. workflows/windows-mcp-integration.md: MCP概要
2. workflows/mcp-servers/n8n-workflow.md: n8n活用
3. workflows/powershell-automation.md: PowerShell自動化

### 上級（開発自動化）
1. workflows/android-build-automation.md: CI/CD構築
2. templates/workflow-design.md: カスタムワークフロー設計
3. workflows/code_quality/: 品質管理

---

## 🔗 関連プロジェクト

- **windows-code-mode**: Windows開発環境本体
  - https://github.com/bochang999/windows-code-mode

- **ai-assistant-knowledge-hub**: Termux版元システム
  - 内部リポジトリ

---

## 📞 サポート

**ドキュメント不明点**:
- workflows/troubleshooting/: よくあるエラー集
- GitHub Issues: 問題報告

**Linear連携**:
- BOC-116: Windows Code Mode Sandbox統合

---

**バージョン**: 1.0.0
**最終更新**: 2025-10-02
**対象環境**: Windows 10/11 + PowerShell 5.1+
