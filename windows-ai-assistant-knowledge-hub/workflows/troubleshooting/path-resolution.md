# Path Resolution Troubleshooting

Windows/Termuxパス形式変換トラブルシューティング。

---

## 🐛 よくある問題

### 問題1: Bashスタイルパスが使えない

**症状**:
```powershell
cd ~/.linear-api-key  # エラー
```

**解決策**:
```powershell
# Windows形式に変換
cd $env:USERPROFILE\.linear-api-key
```

---

### 問題2: スペース含むパスでエラー

**症状**:
```powershell
cd C:\Program Files\App  # エラー: 'Files\App' が見つかりません
```

**解決策**:
```powershell
# 引用符で囲む
cd "C:\Program Files\App"

# またはバッククォート
cd C:\Program` Files\App
```

---

### 問題3: 相対パスが解決されない

**解決策**:
```powershell
# 絶対パスに変換
$fullPath = Resolve-Path ".\scripts\build.ps1"

# または
$fullPath = Join-Path $PSScriptRoot "build.ps1"
```

---

**Last Updated**: 2025-10-02
