# setup-windows-environment.ps1
# Windows AI Assistant Knowledge Hub - Initial Setup
# Purpose: Configure API keys, MCP servers, and development environment

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipMcpValidation,

    [Parameter(Mandatory=$false)]
    [switch]$SkipGitHooks
)

Write-Host "🚀 Windows AI Assistant Knowledge Hub - Setup" -ForegroundColor Cyan
Write-Host "=============================================="

# Check PowerShell Version
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error "❌ PowerShell 5.0 or higher required. Current: $($PSVersionTable.PSVersion)"
    exit 1
}
Write-Host "✅ PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Green

# Step 1: API Keys Setup
Write-Host "`n📦 Step 1: API Keys Configuration" -ForegroundColor Yellow
Write-Host "------------------------------------"

$apiKeys = @{
    "Linear" = @{
        Path = "$env:USERPROFILE\.linear-api-key"
        Prompt = "Enter Linear API Key (lin_api_...)"
        Validation = "^lin_api_[a-zA-Z0-9]{40,}$"
    }
    "GitHub" = @{
        Path = "$env:USERPROFILE\.github-token"
        Prompt = "Enter GitHub Personal Access Token (ghp_...)"
        Validation = "^ghp_[a-zA-Z0-9]{36,}$"
    }
    "Notion" = @{
        Path = "$env:USERPROFILE\.notion-api-key"
        Prompt = "Enter Notion API Key (secret_...)"
        Validation = "^secret_[a-zA-Z0-9]{40,}$"
    }
    "Context7" = @{
        Path = "$env:USERPROFILE\.context7-api-key"
        Prompt = "Enter Context7 API Key (ctx7_...)"
        Validation = "^ctx7_[a-zA-Z0-9]{40,}$"
    }
}

foreach ($service in $apiKeys.Keys) {
    $config = $apiKeys[$service]

    if (Test-Path $config.Path) {
        Write-Host "  ✓ $service API key already exists" -ForegroundColor Gray
        continue
    }

    Write-Host "  ⚠️  $service API key not found" -ForegroundColor Yellow
    $key = Read-Host "  $($config.Prompt)"

    if ($key -match $config.Validation) {
        Set-Content -Path $config.Path -Value $key -NoNewline
        Write-Host "  ✅ $service API key saved to $($config.Path)" -ForegroundColor Green
    } elseif ($key -eq "") {
        Write-Host "  ⏭️  Skipped $service" -ForegroundColor Gray
    } else {
        Write-Warning "  ⚠️  Invalid $service API key format. Skipped."
    }
}

# Step 2: Linear Team ID
Write-Host "`n📋 Step 2: Linear Team Configuration" -ForegroundColor Yellow
Write-Host "------------------------------------"

$teamIdPath = "$env:USERPROFILE\.linear-team-id"
if (Test-Path $teamIdPath) {
    $teamId = Get-Content $teamIdPath -Raw
    Write-Host "  ✓ Team ID: $teamId" -ForegroundColor Gray
} else {
    Write-Host "  Enter Linear Team ID (e.g., bochang's lab):" -ForegroundColor Cyan
    $teamId = Read-Host "  Team ID"
    if ($teamId) {
        Set-Content -Path $teamIdPath -Value $teamId -NoNewline
        Write-Host "  ✅ Team ID saved" -ForegroundColor Green
    }
}

# Step 3: MCP Servers Validation
if (-not $SkipMcpValidation) {
    Write-Host "`n🔌 Step 3: MCP Servers Validation" -ForegroundColor Yellow
    Write-Host "------------------------------------"

    $mcpServers = @(
        "mcp-server-sequential-thinking",
        "@n8n-mcp/server"
    )

    foreach ($server in $mcpServers) {
        $installed = npm list -g $server 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $server installed" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $server not found" -ForegroundColor Red
            Write-Host "     Install: npm install -g $server" -ForegroundColor Gray
        }
    }

    Write-Host "`n  For full validation, run:" -ForegroundColor Cyan
    Write-Host "  .\scripts\validate-mcp-servers.ps1" -ForegroundColor White
}

# Step 4: Git Hooks Setup
if (-not $SkipGitHooks) {
    Write-Host "`n🔐 Step 4: Git Pre-commit Hook" -ForegroundColor Yellow
    Write-Host "------------------------------------"

    $gitRoot = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0) {
        $hookPath = "$gitRoot\.git\hooks\pre-commit"
        $hookScript = @'
#!/bin/bash
# API Key Scanner Pre-commit Hook

PATTERNS=(
    "lin_api_[a-zA-Z0-9]{40,}"
    "ghp_[a-zA-Z0-9]{36,}"
    "secret_[a-zA-Z0-9]{40,}"
    "ctx7_[a-zA-Z0-9]{40,}"
    "sk-proj-[a-zA-Z0-9]{40,}"
)

STAGED_FILES=$(git diff --cached --name-only)

for FILE in $STAGED_FILES; do
    # Skip documentation and templates
    if [[ "$FILE" =~ (\.example$|/docs/|template\.json|SECURITY\.md|README\.md) ]]; then
        continue
    fi

    for PATTERN in "${PATTERNS[@]}"; do
        if grep -E -i -q "$PATTERN" "$FILE" 2>/dev/null; then
            echo "❌ BLOCKED: Potential API key found in $FILE"
            echo "   Pattern: $PATTERN"
            exit 1
        fi
    done
done

echo "✅ No API keys detected in staged files"
exit 0
'@

        Set-Content -Path $hookPath -Value $hookScript -NoNewline

        # Make executable (Git Bash compatibility)
        git update-index --chmod=+x .git/hooks/pre-commit 2>$null

        Write-Host "  ✅ Pre-commit hook installed" -ForegroundColor Green
        Write-Host "     Location: $hookPath" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Not a git repository. Skipped." -ForegroundColor Yellow
    }
}

# Step 5: Claude Desktop Config
Write-Host "`n🤖 Step 5: Claude Desktop Configuration" -ForegroundColor Yellow
Write-Host "------------------------------------"

$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $claudeConfigPath) {
    Write-Host "  ✓ Claude Desktop config found" -ForegroundColor Gray
    Write-Host "     Path: $claudeConfigPath" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  Claude Desktop config not found" -ForegroundColor Yellow
    Write-Host "     Expected: $claudeConfigPath" -ForegroundColor Gray
    Write-Host "     See: workflows/windows-mcp-integration.md" -ForegroundColor Cyan
}

# Summary
Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "=============================================="
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure Claude Desktop MCP servers" -ForegroundColor White
Write-Host "     → workflows/windows-mcp-integration.md" -ForegroundColor Gray
Write-Host "  2. Validate MCP servers" -ForegroundColor White
Write-Host "     → .\scripts\validate-mcp-servers.ps1" -ForegroundColor Gray
Write-Host "  3. Test Linear integration" -ForegroundColor White
Write-Host "     → .\scripts\sync-linear-status.ps1 -IssueId BOC-XX -Status InProgress" -ForegroundColor Gray

exit 0
