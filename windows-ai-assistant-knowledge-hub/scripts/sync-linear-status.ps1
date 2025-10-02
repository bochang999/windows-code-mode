# sync-linear-status.ps1
# Linear Issue Status Sync Automation
# Usage: .\sync-linear-status.ps1 -IssueId "BOC-123" -Status "InProgress"

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId,

    [Parameter(Mandatory=$true)]
    [ValidateSet("InProgress", "InReview", "Done", "Todo", "Canceled")]
    [string]$Status
)

# Load API Key
$linearKeyPath = "$env:USERPROFILE\.linear-api-key"
if (-not (Test-Path $linearKeyPath)) {
    Write-Error "❌ Linear API key not found at $linearKeyPath"
    Write-Host "Run: setup-windows-environment.ps1 first"
    exit 1
}

$linearKey = (Get-Content $linearKeyPath -Raw).Trim()

# State ID Mapping
$stateIds = @{
    "Todo" = "9c9e3e3e-8e4f-4b5a-9e3e-3e8e4f4b5a9e"
    "InProgress" = "1cebb56e-524e-4de0-b676-0f574df9012a"
    "InReview" = "33feb1c9-3276-4e13-863a-0b93db032a0f"
    "Done" = "7e4f4b5a-9e3e-3e8e-4f4b-5a9e3e3e8e4f"
    "Canceled" = "5a9e3e3e-8e4f-4b5a-9e3e-3e8e4f4b5a9e"
}

$stateId = $stateIds[$Status]

# GraphQL Mutation
$query = @"
mutation {
    issueUpdate(
        id: \"$IssueId\",
        input: {
            stateId: \"$stateId\"
        }
    ) {
        success
        issue {
            id
            identifier
            title
            state {
                name
            }
        }
    }
}
"@

$body = @{
    query = $query
} | ConvertTo-Json -Depth 10

# Execute API Request
try {
    Write-Host "🔄 Updating Linear issue $IssueId to $Status..."

    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $body

    if ($response.data.issueUpdate.success) {
        $issue = $response.data.issueUpdate.issue
        Write-Host "✅ Success: $($issue.identifier) - $($issue.title)"
        Write-Host "   Status: $($issue.state.name)"
        exit 0
    } else {
        Write-Error "❌ Update failed: $($response.errors[0].message)"
        exit 1
    }

} catch {
    Write-Error "❌ API Request failed: $_"
    exit 1
}
