# ESLint Integration Guide

Windows環境でのESLint統合ガイド。Termux環境でTypeScript LSPが動作しない制約下での現実的な解決策。

---

## 🎯 背景：なぜESLintなのか

### Termux環境の制約
**問題**: TypeScript LSPがタイムアウトで動作しない
```
[Error] TypeScript LSP: Connection timeout (30s exceeded)
[Error] tsserver failed to start
```

**解決策**: ESLintで現実的なコード品質管理
- ✅ 高速動作（タイムアウトなし）
- ✅ 自動修正機能
- ✅ リアルタイムエラー検出
- ✅ 軽量で安定

### トレードオフ
**得られるもの**:
- リアルタイムエラー検出
- 自動コード修正
- 実用的な開発体験

**諦めるもの**:
- `find_definition` (定義ジャンプ)
- `find_references` (参照検索)
- 高度な型推論

**結論**: Termux制約下での**最適解**

---

## 📦 インストール

### 1. ESLint本体 + 高速化daemon版

```powershell
# 基本パッケージ
npm install --save-dev eslint

# Daemon版（高速化）
npm install --save-dev eslint_d

# VSCode Language Server（オプション）
npm install --save-dev vscode-langservers-extracted
```

### 2. 設定ファイル作成

**eslint.config.js** (ESLint 9.x Flat Config):
```javascript
export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                console: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                history: "readonly",
                navigator: "readonly",
                location: "readonly",

                // Capacitor globals
                Capacitor: "readonly",
                CapacitorApp: "readonly"
            }
        },
        rules: {
            // エラーレベル
            "no-unused-vars": ["warn", {
                "args": "none",
                "varsIgnorePattern": "^_"
            }],
            "no-undef": "error",

            // スタイル（自動修正可能）
            "quotes": ["warn", "single", {
                "allowTemplateLiterals": true
            }],
            "semi": ["warn", "always"],
            "indent": ["warn", 4],

            // ベストプラクティス
            "eqeqeq": ["warn", "always"],
            "no-var": "error",
            "prefer-const": "warn"
        }
    }
];
```

### 3. package.json スクリプト追加

```json
{
    "scripts": {
        "lint": "eslint .",
        "lint:fix": "eslint . --fix",
        "lint:watch": "eslint . --watch"
    }
}
```

---

## 🚀 使用方法

### 基本コマンド

```powershell
# 単一ファイルチェック
npx eslint script.js

# ディレクトリ全体
npx eslint src/

# 自動修正
npx eslint script.js --fix

# 監視モード（保存時に自動チェック）
npx eslint script.js --watch
```

### 高速化: eslint_d使用

```powershell
# Daemon起動（初回のみ）
npx eslint_d start

# 高速チェック（2回目以降は爆速）
npx eslint_d script.js

# 自動修正
npx eslint_d script.js --fix

# Daemon停止
npx eslint_d stop
```

---

## 🔧 実用的なワークフロー

### 開発中のリアルタイムチェック

**ターミナル1**: コード編集
```powershell
# VSCode等でコード編集
code script.js
```

**ターミナル2**: 監視モード実行
```powershell
# 保存時に自動チェック
npx eslint script.js --watch
```

**出力例**:
```
/path/to/script.js
  12:5  warning  'unusedVar' is defined but never used  no-unused-vars
  23:1  error    'apiKey' is not defined                no-undef
  45:20 warning  Strings must use singlequote           quotes

✖ 3 problems (1 error, 2 warnings)
  1 error and 2 warnings potentially fixable with the `--fix` option.
```

### コミット前のバッチチェック

```powershell
# 全ファイルチェック + 自動修正
npm run lint:fix

# エラーが残っている場合は手動修正
npx eslint src/problematic-file.js

# エラー解消後にコミット
git add .
git commit -m "fix: Resolve ESLint errors"
```

---

## 🎨 自動修正の例

### Before (ESLint警告あり)
```javascript
var apiKey = "test_key"  // no-var, quotes, semi
let unusedVar = 123      // no-unused-vars

if (data == null) {      // eqeqeq
    console.log("Error")
}
```

### After (`eslint --fix`)
```javascript
const apiKey = 'test_key'; // ✅ const, single quotes, semicolon
// unusedVar removed or prefixed with _

if (data === null) {       // ✅ strict equality
    console.log('Error');
}
```

---

## 🔍 よくあるエラーと対処法

### Error 1: `'window' is not defined`

**原因**: グローバル変数が宣言されていない

**解決策**: eslint.config.js に追加
```javascript
globals: {
    window: "readonly",
    document: "readonly"
}
```

### Error 2: `Parsing error: The keyword 'export' is reserved`

**原因**: sourceType設定が間違っている

**解決策**:
```javascript
languageOptions: {
    sourceType: "module"  // CommonJS の場合は "commonjs"
}
```

### Error 3: `Definition for rule 'XXX' was not found`

**原因**: プラグインが不足

**解決策**:
```powershell
# 必要なプラグインをインストール
npm install --save-dev eslint-plugin-XXX
```

---

## 📊 ESLint vs TypeScript LSP比較

| 機能 | ESLint | TypeScript LSP |
|-----|--------|---------------|
| エラー検出 | ✅ 高速 | ❌ タイムアウト |
| 自動修正 | ✅ あり | ⚠️ 限定的 |
| 定義ジャンプ | ❌ なし | ✅ あり（動作せず） |
| 参照検索 | ❌ なし | ✅ あり（動作せず） |
| Termux動作 | ✅ 安定 | ❌ 不安定 |
| 学習コスト | 🟢 低 | 🟡 中 |

**Termux環境での推奨**: **ESLint一択**

---

## 🛠️ プロジェクト別設定

### windows-code-mode (Capacitor)

**特徴**: Capacitor専用グローバル変数

```javascript
globals: {
    Capacitor: "readonly",
    CapacitorApp: "readonly",
    CapacitorFilesystem: "readonly",
    CapacitorSQLite: "readonly"
}
```

### windows-ai-assistant-knowledge-hub (Documentation)

**特徴**: Node.js環境変数

```javascript
languageOptions: {
    ecmaVersion: 2022,
    sourceType: "commonjs",
    globals: {
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly"
    }
}
```

---

## 💡 パフォーマンス最適化

### 1. `.eslintignore` 設定

不要なファイルを除外:
```
node_modules/
dist/
build/
*.min.js
*.bundle.js
```

### 2. キャッシュ有効化

```powershell
# キャッシュを使用（2回目以降高速）
npx eslint --cache src/
```

### 3. eslint_d（Daemon版）活用

```powershell
# 初回起動後は超高速
npx eslint_d start
npx eslint_d src/  # < 100ms
```

---

## 🔗 統合ツール

### Git Pre-commit Hook統合

**.git/hooks/pre-commit**:
```bash
#!/bin/bash

echo "🔍 Running ESLint..."

# ESLint実行
npx eslint src/ --quiet

if [ $? -ne 0 ]; then
    echo "❌ ESLint errors found. Fix before committing."
    echo "💡 Run: npm run lint:fix"
    exit 1
fi

echo "✅ ESLint passed"
```

### VSCode統合（オプション）

**settings.json**:
```json
{
    "eslint.enable": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact"
    ],
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

---

## 📚 ルールカスタマイズ例

### 厳格モード（本番推奨）

```javascript
rules: {
    "no-unused-vars": "error",  // warn → error
    "no-undef": "error",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error"
}
```

### 緩和モード（開発初期）

```javascript
rules: {
    "no-unused-vars": "warn",
    "quotes": "off",  // 引用符チェック無効
    "semi": "off",    // セミコロンチェック無効
    "indent": "off"   // インデントチェック無効
}
```

---

## 🎯 ベストプラクティス

### DO ✅
1. **コミット前に必ず実行**
   ```powershell
   npm run lint:fix
   ```

2. **監視モードで開発**
   ```powershell
   npx eslint src/ --watch
   ```

3. **警告も修正する**
   - 警告を放置しない
   - 定期的にクリーンアップ

4. **eslint_dで高速化**
   - Daemon版で開発効率UP

### DON'T ❌
1. ❌ `// eslint-disable` を乱用しない
2. ❌ エラーを無視してコミットしない
3. ❌ ルールを理解せず無効化しない
4. ❌ 自動修正後の確認を怠らない

---

## 🔧 トラブルシューティング

### 問題: ESLintが遅い

**解決策**:
```powershell
# eslint_d使用
npx eslint_d start
npx eslint_d src/

# または.eslintignoreで除外
echo "node_modules/" >> .eslintignore
```

### 問題: ルールが多すぎて混乱

**解決策**:
```powershell
# 重要なエラーのみ表示
npx eslint src/ --quiet

# エラーレベルのみ修正
npx eslint src/ --fix --quiet
```

---

## 📖 関連ドキュメント

- [Code Quality README](./README.md)
- [Pre-commit Hooks Setup](./pre-commit-hooks.md)
- [ESLint Official Docs](https://eslint.org/docs/latest/)

---

**Last Updated**: 2025-10-02
**Termux Optimization**: ✅ Verified
**Maintained By**: Windows AI Assistant Knowledge Hub
