# validate-mcp-servers.ps1
# MCP Servers Health Check and Validation
# Purpose: Verify all 7 MCP servers are correctly configured

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [switch]$FixIssues
)

Write-Host "🔌 MCP Servers Validation" -ForegroundColor Cyan
Write-Host "=========================="

# Global validation results
$global:FailedChecks = 0
$global:PassedChecks = 0

function Test-McpServer {
    param(
        [string]$Name,
        [string]$NpmPackage,
        [string]$ConfigKey,
        [scriptblock]$CustomValidation = $null
    )

    Write-Host "`n📦 $Name" -ForegroundColor Yellow
    Write-Host "   Package: $NpmPackage" -ForegroundColor Gray

    # Check npm installation
    $installed = npm list -g $NpmPackage 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ NPM package installed" -ForegroundColor Green
        $global:PassedChecks++
    } else {
        Write-Host "   ❌ NPM package NOT installed" -ForegroundColor Red
        $global:FailedChecks++

        if ($FixIssues) {
            Write-Host "   🔧 Installing $NpmPackage..." -ForegroundColor Cyan
            npm install -g $NpmPackage
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Installation successful" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Installation failed" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   💡 Fix: npm install -g $NpmPackage" -ForegroundColor Gray
            return $false
        }
    }

    # Custom validation
    if ($CustomValidation) {
        $result = & $CustomValidation
        if ($result) {
            $global:PassedChecks++
        } else {
            $global:FailedChecks++
            return $false
        }
    }

    return $true
}

# 1. Sequential Thinking MCP
Test-McpServer `
    -Name "Sequential Thinking MCP" `
    -NpmPackage "mcp-server-sequential-thinking" `
    -ConfigKey "sequential-thinking" `
    -CustomValidation {
        # Check if sequential thinking executable exists
        $mcpPath = npm root -g
        $execPath = Join-Path $mcpPath "mcp-server-sequential-thinking\bin\mcp-server-sequential-thinking.js"
        if (Test-Path $execPath) {
            Write-Host "   ✅ Executable found: $execPath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ Executable not found" -ForegroundColor Red
            return $false
        }
    }

# 2. n8n MCP
Test-McpServer `
    -Name "n8n Workflow Automation MCP" `
    -NpmPackage "@n8n-mcp/server" `
    -ConfigKey "n8n-mcp" `
    -CustomValidation {
        # Check n8n API key
        $n8nKeyPath = "$env:USERPROFILE\.n8n-api-key"
        if (Test-Path $n8nKeyPath) {
            Write-Host "   ✅ n8n API key configured" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️  n8n API key not found (optional)" -ForegroundColor Yellow
            Write-Host "      Path: $n8nKeyPath" -ForegroundColor Gray
            return $true  # Not critical
        }
    }

# 3. Notion API MCP
Write-Host "`n📦 Notion API MCP" -ForegroundColor Yellow
$notionKeyPath = "$env:USERPROFILE\.notion-api-key"
if (Test-Path $notionKeyPath) {
    Write-Host "   ✅ API key configured" -ForegroundColor Green
    $global:PassedChecks++
} else {
    Write-Host "   ❌ API key not found" -ForegroundColor Red
    Write-Host "   💡 Fix: Add key to $notionKeyPath" -ForegroundColor Gray
    $global:FailedChecks++
}

# 4. Context7 API MCP
Write-Host "`n📦 Context7 API MCP" -ForegroundColor Yellow
$ctx7KeyPath = "$env:USERPROFILE\.context7-api-key"
if (Test-Path $ctx7KeyPath) {
    Write-Host "   ✅ API key configured" -ForegroundColor Green
    $global:PassedChecks++
} else {
    Write-Host "   ❌ API key not found" -ForegroundColor Red
    Write-Host "   💡 Fix: Add key to $ctx7KeyPath" -ForegroundColor Gray
    $global:FailedChecks++
}

# 5. GitHub API MCP
Write-Host "`n📦 GitHub API MCP" -ForegroundColor Yellow
$ghTokenPath = "$env:USERPROFILE\.github-token"
if (Test-Path $ghTokenPath) {
    Write-Host "   ✅ Token configured" -ForegroundColor Green
    $global:PassedChecks++

    # Test GitHub API access
    try {
        $token = (Get-Content $ghTokenPath -Raw).Trim()
        $response = Invoke-RestMethod `
            -Uri "https://api.github.com/user" `
            -Method Get `
            -Headers @{
                "Authorization" = "Bearer $token"
                "User-Agent" = "PowerShell"
            }
        Write-Host "   ✅ API access verified: $($response.login)" -ForegroundColor Green
        $global:PassedChecks++
    } catch {
        Write-Host "   ❌ API access failed: $_" -ForegroundColor Red
        $global:FailedChecks++
    }
} else {
    Write-Host "   ❌ Token not found" -ForegroundColor Red
    Write-Host "   💡 Fix: Add token to $ghTokenPath" -ForegroundColor Gray
    $global:FailedChecks++
}

# 6. Linear API MCP
Write-Host "`n📦 Linear API MCP" -ForegroundColor Yellow
$linearKeyPath = "$env:USERPROFILE\.linear-api-key"
if (Test-Path $linearKeyPath) {
    Write-Host "   ✅ API key configured" -ForegroundColor Green
    $global:PassedChecks++

    # Test Linear API access
    try {
        $linearKey = (Get-Content $linearKeyPath -Raw).Trim()
        $query = @"
{
    viewer {
        id
        name
        email
    }
}
"@
        $body = @{ query = $query } | ConvertTo-Json
        $response = Invoke-RestMethod `
            -Uri "https://api.linear.app/graphql" `
            -Method Post `
            -Headers @{
                "Authorization" = $linearKey
                "Content-Type" = "application/json"
            } `
            -Body $body

        Write-Host "   ✅ API access verified: $($response.data.viewer.name)" -ForegroundColor Green
        $global:PassedChecks++
    } catch {
        Write-Host "   ❌ API access failed: $_" -ForegroundColor Red
        $global:FailedChecks++
    }
} else {
    Write-Host "   ❌ API key not found" -ForegroundColor Red
    Write-Host "   💡 Fix: Add key to $linearKeyPath" -ForegroundColor Gray
    $global:FailedChecks++
}

# 7. Chrome DevTools MCP
Write-Host "`n📦 Chrome DevTools MCP (Windows)" -ForegroundColor Yellow
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Chrome found: $path" -ForegroundColor Green
        $chromeFound = $true
        $global:PassedChecks++
        break
    }
}

if (-not $chromeFound) {
    Write-Host "   ⚠️  Chrome not found (optional for WebView debugging)" -ForegroundColor Yellow
    Write-Host "      Install Chrome for WebView debugging support" -ForegroundColor Gray
}

# Claude Desktop Config Validation
Write-Host "`n🤖 Claude Desktop Configuration" -ForegroundColor Yellow
Write-Host "============================"
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"

if (Test-Path $claudeConfigPath) {
    Write-Host "✅ Config file found" -ForegroundColor Green
    $global:PassedChecks++

    try {
        $config = Get-Content $claudeConfigPath -Raw | ConvertFrom-Json

        if ($config.mcpServers) {
            $serverCount = ($config.mcpServers | Get-Member -MemberType NoteProperty).Count
            Write-Host "✅ MCP servers configured: $serverCount" -ForegroundColor Green
            $global:PassedChecks++

            if ($Verbose) {
                Write-Host "`nConfigured servers:" -ForegroundColor Cyan
                $config.mcpServers | Get-Member -MemberType NoteProperty | ForEach-Object {
                    Write-Host "   - $($_.Name)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "⚠️  No MCP servers configured" -ForegroundColor Yellow
            $global:FailedChecks++
        }
    } catch {
        Write-Host "❌ Invalid JSON format: $_" -ForegroundColor Red
        $global:FailedChecks++
    }
} else {
    Write-Host "❌ Config file not found" -ForegroundColor Red
    Write-Host "   Path: $claudeConfigPath" -ForegroundColor Gray
    Write-Host "   💡 See: workflows/windows-mcp-integration.md" -ForegroundColor Gray
    $global:FailedChecks++
}

# Summary
Write-Host "`n==========================" -ForegroundColor Cyan
Write-Host "📊 Validation Summary" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host "✅ Passed checks: $global:PassedChecks" -ForegroundColor Green
Write-Host "❌ Failed checks: $global:FailedChecks" -ForegroundColor Red

if ($global:FailedChecks -eq 0) {
    Write-Host "`n🎉 All MCP servers validated successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some checks failed. Review the output above." -ForegroundColor Yellow
    Write-Host "💡 Run with -FixIssues to auto-install missing packages" -ForegroundColor Cyan
    exit 1
}
