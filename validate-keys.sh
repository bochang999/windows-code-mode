#!/bin/bash
# API Key Validation Script
# Checks if all required API keys are configured

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

echo "🔍 Validating API Key Configuration..."
echo ""

# Load .env if exists
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo "✅ Found .env file"
else
    echo "⚠️  No .env file found"
fi

# Validation function
validate_key() {
    local key_name=$1
    local key_value=$2
    local file_path=$3

    if [ -n "$key_value" ] && [ "$key_value" != "your_${key_name,,}_here" ]; then
        echo "✅ $key_name: Configured in .env"
        return 0
    elif [ -n "$file_path" ] && [ -f "$file_path" ]; then
        echo "✅ $key_name: Configured in $file_path"
        return 0
    else
        echo "❌ $key_name: NOT configured"
        return 1
    fi
}

# Check each key
ERRORS=0

validate_key "NOTION_API_KEY" "$NOTION_API_KEY" "" || ((ERRORS++))
validate_key "CONTEXT7_API_KEY" "$CONTEXT7_API_KEY" "" || ((ERRORS++))
validate_key "LINEAR_API_KEY" "$LINEAR_API_KEY" "$HOME/.linear-api-key" || ((ERRORS++))
validate_key "LINEAR_TEAM_ID" "$LINEAR_TEAM_ID" "$HOME/.linear-team-id" || ((ERRORS++))
validate_key "GITHUB_TOKEN" "$GITHUB_TOKEN" "$HOME/.github-token" || ((ERRORS++))

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All API keys are configured!"
    exit 0
else
    echo "⚠️  $ERRORS API key(s) missing"
    echo ""
    echo "To fix:"
    echo "  1. Run: ./setup-keys.sh"
    echo "  2. Edit .env and add your keys"
    echo "  3. Or store keys in ~/.linear-api-key, ~/.github-token, etc."
    exit 1
fi
