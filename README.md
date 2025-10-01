# Windows Android Sandbox Export

Termux-based development sandbox for Windows migration with secure API key management.

## 🚀 Quick Start

### 1. Setup API Keys (Required)
```bash
# Run the secure setup wizard
./setup-keys.sh

# Edit .env with your actual keys
nano .env

# Validate configuration
./validate-keys.sh
```

### 2. Run Sandbox
```bash
node sandbox.js test-sandbox.ts
```

---

## 🔒 Security First

**⚠️ This project uses local-only API keys that are NEVER committed to GitHub.**

See **[SECURITY.md](SECURITY.md)** for detailed security guide.

### Quick Security Check
```bash
# Verify keys are configured
./validate-keys.sh

# Verify .gitignore protection
cat .gitignore | grep -E "\.env|\.key|secret"

# Test pre-commit hook
git add . && git commit -m "test" # Should scan for API keys
```

---

## 📁 Project Structure

```
.env.example              # API key template (safe to commit)
.env                      # Your actual keys (NEVER commit)
.gitignore                # Blocks secrets from being committed
.git/hooks/pre-commit     # Auto-scans for leaked keys
sandbox.js                # Main sandbox runtime
enhanced-linear-api.js    # Linear API integration
setup-keys.sh             # Key configuration wizard
validate-keys.sh          # Key validation script
SECURITY.md               # Complete security guide
```

---

## 🔑 Required API Keys

1. **Notion API Key**: https://www.notion.so/my-integrations
2. **Context7 API Key**: https://context7.com
3. **Linear API Key**: https://linear.app/settings/api
4. **GitHub Token**: https://github.com/settings/tokens

Store keys in `.env` or separate files:
```bash
~/.linear-api-key
~/.github-token
~/.linear-team-id
```

---

## 🛡️ Security Features

- ✅ `.gitignore` blocks `.env`, `*.key`, `*-token` files
- ✅ Pre-commit hook scans for API key patterns
- ✅ Validation script checks key configuration
- ✅ Template file (`.env.example`) for documentation
- ✅ No hardcoded keys in source code

---

## 📚 Documentation

- **[SECURITY.md](SECURITY.md)**: API key management guide
- **[windows-mcp-guide.md](windows-mcp-guide.md)**: Windows MCP setup
- **[notion-to-linear-guide.md](notion-to-linear-guide.md)**: Notion integration

---

## 🚨 Emergency: Leaked API Key?

1. **Revoke the key immediately** (Notion/Linear/GitHub settings)
2. **Remove from Git history** (see SECURITY.md)
3. **Generate new key** and update `.env`
4. **Force push clean history**: `git push --force origin main`

---

## 🤝 Contributing

Before committing:
1. Run `./validate-keys.sh` to check configuration
2. Never use `git commit --no-verify` (bypasses security)
3. Review `git diff --cached` for hardcoded secrets

---

**🔒 Security First. Always.**
