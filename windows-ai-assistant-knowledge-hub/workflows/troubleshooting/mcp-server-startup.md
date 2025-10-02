# MCP Server Startup Troubleshooting

MCPサーバー起動問題のトラブルシューティング。

---

## 🐛 よくある問題

### 問題1: MCP Server が起動しない

**症状**:
```
Claude Desktop: MCP server 'sequential-thinking' failed to start
```

**原因**: Node.jsパスが正しくない

**解決策**:
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "node",  // ← フルパスに変更
      "args": ["C:\\Users\\YOUR_NAME\\AppData\\Roaming\\npm\\node_modules\\...\\index.js"]
    }
  }
}
```

---

### 問題2: API Keyが認識されない

**症状**:
```
Error: NOTION_API_KEY not found
```

**解決策**:
```powershell
# ファイル存在確認
Test-Path "$env:USERPROFILE\.notion-api-key"

# 内容確認
Get-Content "$env:USERPROFILE\.notion-api-key"

# Claude Desktop再起動
```

---

### 問題3: Claude Desktop設定が反映されない

**解決策**:
```powershell
# 1. Claude Desktop完全終了
Get-Process Claude* | Stop-Process -Force

# 2. 設定ファイル確認
cat "$env:APPDATA\Claude\claude_desktop_config.json"

# 3. JSONフォーマット検証
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json

# 4. Claude Desktop再起動
```

---

### 問題4: MCP Serverバージョン不一致

**解決策**:
```powershell
# 最新版に更新
npm update -g mcp-server-sequential-thinking
npm update -g @n8n-mcp/server

# インストール確認
npm list -g | Select-String "mcp"
```

---

**Last Updated**: 2025-10-02
