#!/bin/bash
# Secure API Key Setup Script
# This script helps you configure API keys securely (local only, never committed to git)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

echo "🔐 Secure API Key Setup"
echo "======================="
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy template
if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ Created .env from template"
else
    echo "❌ .env.example not found!"
    exit 1
fi

echo ""
echo "📝 Please edit .env file and add your API keys:"
echo "   nano .env"
echo ""
echo "🔒 Security Checklist:"
echo "   ✓ .env is in .gitignore (won't be committed)"
echo "   ✓ Alternative: Store keys in ~/.linear-api-key, ~/.github-token, etc."
echo "   ✓ Never share or screenshot your .env file"
echo ""
echo "🚀 After setup, test with:"
echo "   node sandbox.js test-sandbox.ts"
echo ""

# Verify .env is in .gitignore
if ! grep -q "^\.env$" "$SCRIPT_DIR/.gitignore" 2>/dev/null; then
    echo "⚠️  WARNING: .env is not in .gitignore!"
    echo "Adding .env to .gitignore..."
    echo ".env" >> "$SCRIPT_DIR/.gitignore"
fi

echo "✅ Setup complete!"
