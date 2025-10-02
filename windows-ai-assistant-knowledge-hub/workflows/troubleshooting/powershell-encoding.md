# PowerShell Encoding Troubleshooting

PowerShellエンコーディング問題のトラブルシューティングガイド。

---

## 🐛 よくある問題

### 問題1: 日本語が文字化け

**症状**:
```powershell
Write-Host "完了しました"
# 出力: �����܂���
```

**原因**: コンソールエンコーディングがShift-JIS

**解決策**:
```powershell
# UTF-8に変更
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001

# スクリプト先頭に追加
$OutputEncoding = [System.Text.Encoding]::UTF8
```

---

### 問題2: JSON変換時の文字化け

**症状**:
```powershell
$data = @{ name = "テスト" }
$json = ConvertTo-Json $data
# → 文字化け
```

**解決策**:
```powershell
# -EncodingパラメータでUTF-8指定
$json = ConvertTo-Json $data -Depth 10
$json | Out-File -Encoding UTF8 output.json
```

---

### 問題3: API呼び出しで日本語が送信できない

**解決策**:
```powershell
$body = @{
    title = "日本語タイトル"
} | ConvertTo-Json -Depth 10

# UTF-8バイト配列に変換
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Invoke-RestMethod -Uri $url -Method Post -Body $bodyBytes
```

---

**Last Updated**: 2025-10-02
