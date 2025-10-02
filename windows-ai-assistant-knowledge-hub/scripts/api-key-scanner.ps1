# api-key-scanner.ps1
# API Key Leak Scanner for Files and Directories
# Purpose: Scan for potential API key leaks before commit

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Path = ".",

    [Parameter(Mandatory=$false)]
    [switch]$Recursive,

    [Parameter(Mandatory=$false)]
    [switch]$FixLeaks,

    [Parameter(Mandatory=$false)]
    [string]$WhitelistFile = ""
)

# API Key Patterns
$patterns = @{
    "Linear" = "lin_api_[a-zA-Z0-9]{40,}"
    "GitHub" = "ghp_[a-zA-Z0-9]{36,}"
    "Notion" = "secret_[a-zA-Z0-9]{40,}"
    "Context7" = "ctx7_[a-zA-Z0-9]{40,}"
    "OpenAI" = "sk-proj-[a-zA-Z0-9]{40,}"
    "AWS" = "AKIA[A-Z0-9]{16}"
    "Stripe" = "sk_live_[a-zA-Z0-9]{24,}"
    "Slack" = "xox[baprs]-[a-zA-Z0-9-]{10,}"
    "Google" = "AIza[a-zA-Z0-9_-]{35}"
}

# Files to skip
$skipPatterns = @(
    "*.example",
    "*.md",
    "*template*",
    "*SECURITY*",
    "*README*",
    "*.log",
    "node_modules",
    ".git",
    "*.lock"
)

# Load whitelist
$whitelist = @()
if ($WhitelistFile -and (Test-Path $WhitelistFile)) {
    $whitelist = Get-Content $WhitelistFile | Where-Object { $_ -notmatch "^\s*#" -and $_ -ne "" }
    Write-Host "📋 Loaded $($whitelist.Count) whitelisted patterns" -ForegroundColor Cyan
}

# Scan results
$global:LeaksFound = @()
$global:FilesScanned = 0

function Test-ShouldSkipFile {
    param([string]$FilePath)

    foreach ($pattern in $skipPatterns) {
        if ($FilePath -like $pattern) {
            return $true
        }
    }
    return $false
}

function Test-IsWhitelisted {
    param([string]$Match)

    foreach ($whitelistedPattern in $whitelist) {
        if ($Match -match $whitelistedPattern) {
            return $true
        }
    }
    return $false
}

function Scan-File {
    param([string]$FilePath)

    if (Test-ShouldSkipFile $FilePath) {
        Write-Verbose "Skipping: $FilePath"
        return
    }

    $global:FilesScanned++

    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop

        foreach ($keyType in $patterns.Keys) {
            $pattern = $patterns[$keyType]
            $matches = [regex]::Matches($content, $pattern)

            foreach ($match in $matches) {
                # Check if whitelisted
                if (Test-IsWhitelisted $match.Value) {
                    Write-Verbose "Whitelisted: $($match.Value) in $FilePath"
                    continue
                }

                # Extract surrounding context
                $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                $contextStart = [Math]::Max(0, $match.Index - 50)
                $contextEnd = [Math]::Min($content.Length, $match.Index + $match.Length + 50)
                $context = $content.Substring($contextStart, $contextEnd - $contextStart)

                $global:LeaksFound += [PSCustomObject]@{
                    File = $FilePath
                    Type = $keyType
                    Match = $match.Value
                    Line = $lineNumber
                    Context = $context
                }
            }
        }
    } catch {
        Write-Verbose "Error scanning $FilePath: $_"
    }
}

# Main scan logic
Write-Host "🔍 API Key Scanner" -ForegroundColor Cyan
Write-Host "=================="
Write-Host "Path: $Path" -ForegroundColor Gray
Write-Host "Recursive: $Recursive" -ForegroundColor Gray

if ($Recursive) {
    $files = Get-ChildItem -Path $Path -Recurse -File
} else {
    $files = Get-ChildItem -Path $Path -File
}

Write-Host "Scanning $($files.Count) files..." -ForegroundColor Yellow

foreach ($file in $files) {
    Scan-File -FilePath $file.FullName
}

# Results
Write-Host "`n==================" -ForegroundColor Cyan
Write-Host "📊 Scan Results" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Files scanned: $global:FilesScanned" -ForegroundColor Gray
Write-Host "Leaks found: $($global:LeaksFound.Count)" -ForegroundColor $(if ($global:LeaksFound.Count -eq 0) { "Green" } else { "Red" })

if ($global:LeaksFound.Count -gt 0) {
    Write-Host "`n❌ POTENTIAL API KEY LEAKS DETECTED:" -ForegroundColor Red

    foreach ($leak in $global:LeaksFound) {
        Write-Host "`n📄 File: $($leak.File):$($leak.Line)" -ForegroundColor Yellow
        Write-Host "   Type: $($leak.Type)" -ForegroundColor Gray
        Write-Host "   Match: $($leak.Match.Substring(0, [Math]::Min(20, $leak.Match.Length)))..." -ForegroundColor Red
        Write-Host "   Context: $($leak.Context -replace '\s+', ' ')" -ForegroundColor Gray
    }

    Write-Host "`n⚠️  ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "   1. Remove API keys from files" -ForegroundColor White
    Write-Host "   2. Move to secure locations (e.g., $env:USERPROFILE\.linear-api-key)" -ForegroundColor White
    Write-Host "   3. Add to .gitignore if needed" -ForegroundColor White
    Write-Host "   4. If false positive, add to whitelist" -ForegroundColor White

    if ($FixLeaks) {
        Write-Host "`n🔧 Auto-fix not implemented yet" -ForegroundColor Yellow
        Write-Host "   Manual review required for security" -ForegroundColor Gray
    }

    exit 1
} else {
    Write-Host "`n✅ No API key leaks detected!" -ForegroundColor Green
    exit 0
}
