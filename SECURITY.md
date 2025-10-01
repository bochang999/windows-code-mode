# 🔒 Security Guide - API Key Management

## ⚠️ Never Commit API Keys to Git!

This project uses a **local-only** API key management system to prevent accidental leaks to GitHub.

---

## 🚀 Quick Setup

### 1. Run the setup script
```bash
./setup-keys.sh
```

### 2. Edit `.env` file with your actual keys
```bash
nano .env
```

### 3. Validate configuration
```bash
./validate-keys.sh
```

---

## 📁 File Structure

```
.env.example       # Template file (safe to commit)
.env               # Your actual keys (NEVER commit - in .gitignore)
.gitignore         # Blocks .env, *.key, *-token files
.git/hooks/pre-commit  # Auto-scans for leaked keys before commit
```

---

## 🔑 Two Ways to Store Keys

### Option 1: `.env` File (Recommended for development)
```bash
# .env
NOTION_API_KEY=ntn_xxxxxxxxxxxxx
CONTEXT7_API_KEY=ctx7_xxxxxxxxxxxxx
```

### Option 2: Separate Files (Recommended for production)
```bash
echo "your_linear_key" > ~/.linear-api-key
echo "your_github_token" > ~/.github-token
echo "your_team_id" > ~/.linear-team-id
chmod 600 ~/.linear-api-key ~/.github-token ~/.linear-team-id
```

---

## 🛡️ Security Features

### ✅ `.gitignore` Protection
Blocks these patterns from being committed:
- `.env`, `.env.local`, `.env.*`
- `*.key`, `*-api-key`, `*-token`
- `*secret*`

### ✅ Pre-commit Hook
Automatically scans staged files for:
- Notion keys: `ntn_xxxxx`
- OpenAI keys: `sk-xxxxx`
- GitHub tokens: `ghp_xxxxx`
- Bearer tokens
- Hardcoded API keys in code

**If detected, commit is blocked!**

### ✅ Key Validation Script
```bash
./validate-keys.sh
# ✅ NOTION_API_KEY: Configured in .env
# ✅ LINEAR_API_KEY: Configured in ~/.linear-api-key
# ✅ All API keys are configured!
```

---

## 🚨 What to Do If You Accidentally Commit a Key

### 1. **Revoke the leaked key immediately**
- Notion: https://www.notion.so/my-integrations
- Linear: https://linear.app/settings/api
- GitHub: https://github.com/settings/tokens

### 2. **Remove from Git history**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch FILE_WITH_KEY" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force origin main
```

### 3. **Generate new keys**
Replace all leaked keys with fresh ones.

---

## 📋 Checklist Before Committing

- [ ] Run `./validate-keys.sh` to confirm keys are configured
- [ ] Verify `.env` is in `.gitignore`
- [ ] No hardcoded keys in source code
- [ ] Pre-commit hook is executable: `chmod +x .git/hooks/pre-commit`
- [ ] Test with: `git add . && git commit -m "test"` (hook should run)

---

## 🔗 Related Files

- **sandbox.js**: Uses `process.env.NOTION_API_KEY` (never hardcoded)
- **enhanced-linear-api.js**: Reads from `~/.linear-api-key` file
- **.env.example**: Template showing required keys (safe to share)

---

## 💡 Best Practices

1. ✅ **DO**: Use environment variables or secure files
2. ✅ **DO**: Store keys in `~/.config/` or `~/.credentials/`
3. ✅ **DO**: Set file permissions: `chmod 600 ~/.linear-api-key`
4. ❌ **DON'T**: Hardcode keys in source code
5. ❌ **DON'T**: Share screenshots containing keys
6. ❌ **DON'T**: Use `--no-verify` to bypass pre-commit hook

---

**🔒 Security is everyone's responsibility. When in doubt, ask!**
