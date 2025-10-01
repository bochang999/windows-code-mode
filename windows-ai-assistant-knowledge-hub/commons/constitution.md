# AI Assistant Constitutional Principles (Windows Edition)

## 📊 Two-Layer Knowledge Management System (Integrated Version)

This is the foundational architecture that governs all AI assistant operations:

```
Repository (this location) - AI collaboration rules, technical constraints, development policies only
Linear                     - Project management, tasks, progress, development logs, error resolution, all learning patterns
```

**Important**: `devlog.md` is abolished. All project management operations are integrated and managed in Linear.

## 🏗️ Development Environment Architecture Principles

### 🎯 **Basic Premises (Absolute Compliance)**

**Windows = Primary Development Environment**
- **Role**: Full-stack development (code editing + builds + testing)
- **Responsibility scope**: Android Studio, Gradle, PowerShell automation
- **Platform strength**: Native Windows tools, MCP integration, GUI support

**GitHub Actions = CI/CD Automation**
- **Role**: Automated builds, testing, deployment
- **Responsibility scope**: All dependencies, signing, release automation
- **Quality assurance**: Local builds in Windows → Automated deployment in Actions

### 📋 **Environment Responsibility Separation**

```
Windows (primary development):
├── Code editing (VSCode/Claude Desktop)
├── ESLint + TypeScript LSP
├── Android Studio builds (Gradle)
├── APK generation & testing
├── PowerShell automation scripts
├── MCP Servers integration
└── Git operations

GitHub Actions (automation):
├── npm ci --include=dev (full dependencies)
├── Automated APK builds
├── Code signing & release
├── Multi-platform testing
└── Deployment pipelines
```

### 🔧 **Windows-Specific Development Tools**

**PowerShell Automation**:
- Linear API integration (GraphQL)
- Android build automation
- MCP server management
- API key security scanning

**MCP Servers**:
- Sequential Thinking: Multi-step problem solving
- n8n MCP: Workflow automation (536 nodes)
- Notion API: Japanese documentation
- Context7: Technical documentation

**Android Development**:
- Android Studio: Primary APK build tool
- Gradle: Build automation
- n8n Webhooks: Build trigger integration

### ⚠️ **Important: Windows Path Conventions**

**Use Windows path format consistently**:
- Correct: `$env:USERPROFILE\.linear-api-key`
- Correct: `C:\Users\username\dev\project`
- Avoid: `/home/user/.linear-api-key` (Unix style)

**PowerShell script requirements**:
- Use `Invoke-RestMethod` instead of `curl`
- Use `Get-Content` instead of `cat`
- Quote paths with spaces: `cd "C:\Program Files\Project"`

## 🔒 Security Principles

### API Key Management
- **Never commit**: .env, *.key, *-token files
- **Local storage**: `$env:USERPROFILE\.linear-api-key`
- **Pre-commit hooks**: Automatic API key scanning
- **Emergency response**: Immediate revocation + history cleanup

### MCP Server Security
- **Isolated execution**: Each MCP server runs independently
- **API key isolation**: Separate keys per service
- **Connection validation**: Test before production use

## Emergency Patterns

- **Boot Failure**: Check file loading order, undefined dependencies
- **APK Signing**: Use RecipeBox proven signing system
- **Build Errors**:
  - Windows: Check Gradle sync, Android SDK paths
  - CI/CD: Refer to Linear issue history for pipeline solutions
- **PowerShell Errors**: Check execution policy, encoding (UTF-8)
- **MCP Server Issues**: Verify Node.js installation, restart Claude Desktop

---

*This file contains only essential rules. All detailed information is stored in the Linear integrated management system.*
