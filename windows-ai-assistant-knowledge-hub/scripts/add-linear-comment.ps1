# add-linear-comment.ps1
# Add Comment to Linear Issue with Auto Status Update
# Usage: .\add-linear-comment.ps1 -IssueId "BOC-123" -Body "Build completed successfully"

param(
    [Parameter(Mandatory=$true)]
    [string]$IssueId,

    [Parameter(Mandatory=$true)]
    [string]$Body,

    [Parameter(Mandatory=$false)]
    [switch]$UpdateStatus,

    [Parameter(Mandatory=$false)]
    [ValidateSet("InProgress", "InReview", "Done")]
    [string]$NewStatus = "InReview"
)

# Load API Key
$linearKeyPath = "$env:USERPROFILE\.linear-api-key"
if (-not (Test-Path $linearKeyPath)) {
    Write-Error "❌ Linear API key not found at $linearKeyPath"
    exit 1
}

$linearKey = (Get-Content $linearKeyPath -Raw).Trim()

# GraphQL Mutation - Add Comment
$commentQuery = @"
mutation {
    commentCreate(
        input: {
            issueId: \"$IssueId\",
            body: \"$Body\"
        }
    ) {
        success
        comment {
            id
            body
            createdAt
        }
    }
}
"@

$commentBody = @{
    query = $commentQuery
} | ConvertTo-Json -Depth 10

# Execute Comment Creation
try {
    Write-Host "💬 Adding comment to $IssueId..."

    $response = Invoke-RestMethod `
        -Uri "https://api.linear.app/graphql" `
        -Method Post `
        -Headers @{
            "Authorization" = $linearKey
            "Content-Type" = "application/json"
        } `
        -Body $commentBody

    if ($response.data.commentCreate.success) {
        $comment = $response.data.commentCreate.comment
        Write-Host "✅ Comment added: $($comment.body.Substring(0, [Math]::Min(50, $comment.body.Length)))..."
        Write-Host "   Created: $($comment.createdAt)"
    } else {
        Write-Error "❌ Comment creation failed: $($response.errors[0].message)"
        exit 1
    }

} catch {
    Write-Error "❌ API Request failed: $_"
    exit 1
}

# Update Status if requested
if ($UpdateStatus) {
    Write-Host ""
    & "$PSScriptRoot\sync-linear-status.ps1" -IssueId $IssueId -Status $NewStatus
}

exit 0
