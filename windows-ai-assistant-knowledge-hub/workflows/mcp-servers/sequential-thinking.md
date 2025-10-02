# Sequential Thinking MCP Integration Guide

Sequential Thinking MCPの統合ガイド。複雑な問題を段階的に解決するための思考フレームワーク。

---

## 🎯 概要

### Sequential Thinking MCPとは

**多段階思考プロセスのMCP実装**
- 複雑な問題を分解して段階的に解決
- 各思考ステップを記録・可視化
- 仮説検証サイクルを実装
- 思考の分岐・修正が可能

### ユースケース

1. **Phase 4戦略立案** (Linear Issueワークフロー)
2. **エラー原因調査** (多段階デバッグ)
3. **アーキテクチャ設計** (システム設計思考)
4. **コードレビュー** (段階的品質分析)

---

## 📦 インストール

### 1. NPMパッケージインストール

```powershell
npm install -g mcp-server-sequential-thinking
```

### 2. Claude Desktop設定

**ファイル**: `$env:APPDATA\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "node",
      "args": [
        "C:\\Users\\YOUR_USERNAME\\AppData\\Roaming\\npm\\node_modules\\mcp-server-sequential-thinking\\dist\\index.js"
      ]
    }
  }
}
```

### 3. Claude Desktop再起動

```powershell
# Claude Desktopを再起動
# MCPサーバーが自動起動
```

---

## 🔧 基本的な使い方

### ツール: `sequentialthinking`

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| `thought` | string | ✅ | 現在の思考ステップの内容 |
| `nextThoughtNeeded` | boolean | ✅ | 次の思考が必要か |
| `thoughtNumber` | number | ✅ | 現在の思考番号（1から開始） |
| `totalThoughts` | number | ✅ | 予想される総思考数 |
| `isRevision` | boolean | ❌ | このステップが修正か |
| `revisesThought` | number | ❌ | どの思考を修正するか |
| `branchFromThought` | number | ❌ | 分岐元の思考番号 |
| `branchId` | string | ❌ | 分岐のID |

### 基本例：3ステップ思考

```javascript
// Step 1: 問題分析
await sequentialthinking({
    thought: "Linear Issue BOC-123の要件を分析。ユーザーはAPK自動ビルド機能を希望。",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 3
});

// Step 2: 技術選定
await sequentialthinking({
    thought: "Gradleビルド + Linear API + n8n webhook連携が最適と判断。",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 3
});

// Step 3: 実装計画
await sequentialthinking({
    thought: "PowerShellスクリプト3本作成: build.ps1, notify.ps1, update-status.ps1",
    nextThoughtNeeded: false,
    thoughtNumber: 3,
    totalThoughts: 3
});
```

---

## 🎨 高度な使用例

### 1. 思考の修正（Revision）

```javascript
// Step 1: 初期仮説
await sequentialthinking({
    thought: "仮説: ESLintエラーはグローバル変数の未定義が原因",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 5
});

// Step 2: 検証
await sequentialthinking({
    thought: "検証: グローバル変数追加してもエラー継続。仮説は誤り。",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 5
});

// Step 3: 仮説修正
await sequentialthinking({
    thought: "修正仮説: sourceTypeの設定ミスが原因。moduleではなくcommonjs。",
    nextThoughtNeeded: true,
    thoughtNumber: 3,
    totalThoughts: 5,
    isRevision: true,
    revisesThought: 1  // Step 1を修正
});
```

### 2. 思考の分岐（Branching）

```javascript
// Main Branch: Step 1
await sequentialthinking({
    thought: "2つのアプローチを検討: A) 全自動化 vs B) 半自動化",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 4
});

// Branch A: 全自動化
await sequentialthinking({
    thought: "[Branch A] 全自動: GitHub Actions + Linear API webhook",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 4,
    branchFromThought: 1,
    branchId: "approach-a"
});

// Branch B: 半自動化
await sequentialthinking({
    thought: "[Branch B] 半自動: PowerShellスクリプト手動実行 + Linear手動更新",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 4,
    branchFromThought: 1,
    branchId: "approach-b"
});

// 最終決定
await sequentialthinking({
    thought: "Branch Aを採用。GitHub Actions環境が整っているため。",
    nextThoughtNeeded: false,
    thoughtNumber: 3,
    totalThoughts: 3
});
```

### 3. 動的な総思考数調整

```javascript
// 初期見積もり: 3ステップ
await sequentialthinking({
    thought: "Phase 1: 要件確認",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 3
});

// 複雑性発覚 → 総数増加
await sequentialthinking({
    thought: "Phase 2: 要件が予想より複雑。追加調査が必要。",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 6,  // 3 → 6に増加
    needsMoreThoughts: true
});
```

---

## 📊 実際のワークフロー統合

### Phase 4戦略立案（Linear Issue）

**シナリオ**: BOC-123「Android APK自動ビルド機能」

```javascript
// 思考プロセス開始
console.log("🧠 Sequential Thinking: BOC-123 Strategy Planning");

// Step 1: Issue分析
await sequentialthinking({
    thought: `Linear Issue BOC-123分析:
    - 目的: Android APK自動ビルド
    - 現状: 手動Gradleビルドで15分/回
    - 期待: ボタン1クリックで自動化`,
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 7
});

// Step 2: 技術スタック確認
await sequentialthinking({
    thought: `利用可能な技術:
    - Gradle 8.x (既存)
    - PowerShell 7.x (Windows環境)
    - Linear API (GraphQL)
    - n8n (536ワークフローノード)`,
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 7
});

// Step 3: アーキテクチャ設計
await sequentialthinking({
    thought: `設計案:
    [Trigger] Linear Issueラベル変更
       ↓
    [n8n Webhook] ラベル検知
       ↓
    [PowerShell] build.ps1実行
       ↓
    [Gradle] APKビルド
       ↓
    [Linear API] Issue status更新`,
    nextThoughtNeeded: true,
    thoughtNumber: 3,
    totalThoughts: 7
});

// Step 4: 実装ステップ分解
await sequentialthinking({
    thought: `実装タスク:
    1. scripts/build-apk.ps1作成
    2. n8n workflow設計
    3. Linear webhook設定
    4. エラーハンドリング実装
    5. テスト実行`,
    nextThoughtNeeded: true,
    thoughtNumber: 4,
    totalThoughts: 7
});

// Step 5: リスク分析
await sequentialthinking({
    thought: `潜在的リスク:
    - Gradleビルド失敗時の処理
    - API rate limit対策
    - ビルド時間長期化（> 10分）`,
    nextThoughtNeeded: true,
    thoughtNumber: 5,
    totalThoughts: 7
});

// Step 6: 対策立案
await sequentialthinking({
    thought: `リスク対策:
    - ビルド失敗 → Linear commentで通知 + rollback
    - Rate limit → exponential backoff実装
    - 長期化 → timeout 15分設定 + 非同期実行`,
    nextThoughtNeeded: true,
    thoughtNumber: 6,
    totalThoughts: 7
});

// Step 7: 最終戦略
await sequentialthinking({
    thought: `最終戦略確定:
    Phase 1: build-apk.ps1 + Linear API統合 (2h)
    Phase 2: n8n workflow設計 (1h)
    Phase 3: エラー処理 + テスト (2h)
    合計工数: 5時間
    開始: 今すぐ
    完了予定: 本日中`,
    nextThoughtNeeded: false,
    thoughtNumber: 7,
    totalThoughts: 7
});

console.log("✅ Strategic Planning Complete!");
```

---

## 🛠️ ベストプラクティス

### DO ✅

1. **最初は少なめの見積もり**
   ```javascript
   totalThoughts: 3  // 最初は3-5程度
   // 必要に応じて増やす
   ```

2. **思考内容を具体的に**
   ```javascript
   // ❌ Bad
   thought: "次のステップを考える"

   // ✅ Good
   thought: "Linear APIのrate limit: 100req/min。バッチ処理で回避可能。"
   ```

3. **仮説検証サイクルを活用**
   ```javascript
   // 仮説 → 検証 → 修正のサイクル
   isRevision: true
   revisesThought: 2
   ```

4. **分岐で並行検討**
   ```javascript
   branchFromThought: 1
   branchId: "approach-a"
   ```

### DON'T ❌

1. ❌ 思考ステップを飛ばさない
2. ❌ `totalThoughts`を最初から大きくしすぎない
3. ❌ 抽象的な思考内容を避ける
4. ❌ 修正・分岐機能を使わず直線的に考える

---

## 📈 パフォーマンス最適化

### 思考数の目安

| 問題の複雑度 | 推奨思考数 | 例 |
|-------------|-----------|-----|
| 簡単 | 3-5 | バグ修正、小機能追加 |
| 中程度 | 5-10 | 新機能実装、リファクタリング |
| 複雑 | 10-20 | アーキテクチャ設計、大規模変更 |
| 超複雑 | 20+ | システム全体再設計 |

### 実行時間

- **1思考あたり**: 約1-2秒
- **10思考**: 約10-20秒
- **並行実行**: 不可（順次実行のみ）

---

## 🔗 他MCPとの連携

### 1. n8n MCPとの統合

```javascript
// Sequential Thinkingで戦略立案
await sequentialthinking({
    thought: "n8n workflowで以下を実装: Linear webhook → APKビルド → 通知",
    // ...
});

// n8n MCPでworkflow実行
await n8nExecuteWorkflow({
    workflowId: "apk-build-workflow"
});
```

### 2. Linear APIとの統合

```javascript
// 思考完了後にLinear更新
await sequentialthinking({
    thought: "実装完了。Linear Issueを'Done'に更新。",
    nextThoughtNeeded: false,
    // ...
});

// PowerShellスクリプト実行
exec('pwsh -File scripts/sync-linear-status.ps1 -IssueId BOC-123 -Status Done');
```

---

## 📚 サンプルユースケース

### エラー原因調査

```javascript
await sequentialthinking({
    thought: "エラー: 'window is not defined'。原因仮説: SSR環境でwindowアクセス",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 5
});

await sequentialthinking({
    thought: "コード確認: 確かにwindow.localStorage直接アクセス。仮説正しい。",
    nextThoughtNeeded: true,
    thoughtNumber: 2,
    totalThoughts: 5
});

await sequentialthinking({
    thought: "解決策: typeof window !== 'undefined'でガード追加",
    nextThoughtNeeded: false,
    thoughtNumber: 3,
    totalThoughts: 3  // 予想より早く解決
});
```

---

## 🎯 まとめ

Sequential Thinking MCPは:

1. **複雑な問題を構造化** - 段階的思考で整理
2. **仮説検証を可視化** - 試行錯誤を記録
3. **戦略立案を支援** - Phase 4で必須
4. **柔軟な思考フロー** - 修正・分岐が自由

**推奨**: Linear Issue Phase 4で必ず使用！

---

**Last Updated**: 2025-10-02
**MCP Server**: sequential-thinking v1.0
**Maintained By**: Windows AI Assistant Knowledge Hub
