/**
 * MCP Integration Test Template
 * Purpose: Test MCP server connectivity and functionality on Windows
 *
 * Usage:
 *   node templates/mcp-integration-test.js
 *   node templates/mcp-integration-test.js --server sequential-thinking
 *   node templates/mcp-integration-test.js --all
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// ANSI Color Codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// MCP Server Configurations
const mcpServers = {
    'sequential-thinking': {
        name: 'Sequential Thinking MCP',
        package: 'mcp-server-sequential-thinking',
        testCommand: 'sequentialthinking',
        requiredEnv: [],
        description: 'Multi-step problem solving'
    },
    'n8n': {
        name: 'n8n Workflow Automation MCP',
        package: '@n8n-mcp/server',
        testCommand: null, // API-based
        requiredEnv: ['N8N_API_KEY'],
        description: '536 workflow automation nodes'
    },
    'notion': {
        name: 'Notion API MCP',
        package: null, // Built-in
        testCommand: null,
        requiredEnv: ['NOTION_API_KEY'],
        description: 'Japanese-enabled documentation'
    },
    'context7': {
        name: 'Context7 API MCP',
        package: null,
        testCommand: null,
        requiredEnv: ['CONTEXT7_API_KEY'],
        description: 'Technical documentation retrieval'
    },
    'github': {
        name: 'GitHub API MCP',
        package: null,
        testCommand: null,
        requiredEnv: ['GITHUB_TOKEN'],
        description: 'Repository management'
    },
    'linear': {
        name: 'Linear API MCP',
        package: null,
        testCommand: null,
        requiredEnv: ['LINEAR_API_KEY'],
        description: 'Issue tracking'
    },
    'chrome-devtools': {
        name: 'Chrome DevTools MCP',
        package: null,
        testCommand: null,
        requiredEnv: [],
        description: 'WebView debugging'
    }
};

// Utility Functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getApiKeyPath(keyName) {
    const userProfile = process.env.USERPROFILE || process.env.HOME;
    const keyMap = {
        'N8N_API_KEY': '.n8n-api-key',
        'NOTION_API_KEY': '.notion-api-key',
        'CONTEXT7_API_KEY': '.context7-api-key',
        'GITHUB_TOKEN': '.github-token',
        'LINEAR_API_KEY': '.linear-api-key'
    };

    return path.join(userProfile, keyMap[keyName] || `.${keyName.toLowerCase()}`);
}

function loadApiKey(keyName) {
    const keyPath = getApiKeyPath(keyName);

    try {
        if (fs.existsSync(keyPath)) {
            const key = fs.readFileSync(keyPath, 'utf8').trim();
            return key || null;
        }
    } catch (error) {
        log(`   ⚠️  Error reading ${keyName}: ${error.message}`, 'yellow');
    }

    return null;
}

// Test Functions
async function testNpmPackage(serverConfig) {
    log(`   Testing NPM package: ${serverConfig.package}`, 'gray');

    try {
        const { stdout } = await execAsync(`npm list -g ${serverConfig.package}`);

        if (stdout.includes(serverConfig.package)) {
            log(`   ✅ Package installed`, 'green');
            return true;
        } else {
            log(`   ❌ Package not found`, 'red');
            log(`      Install: npm install -g ${serverConfig.package}`, 'gray');
            return false;
        }
    } catch (error) {
        log(`   ❌ Package not installed`, 'red');
        log(`      Install: npm install -g ${serverConfig.package}`, 'gray');
        return false;
    }
}

async function testEnvironmentVariables(serverConfig) {
    log(`   Testing environment variables`, 'gray');

    let allPresent = true;

    for (const envVar of serverConfig.requiredEnv) {
        const apiKey = loadApiKey(envVar);

        if (apiKey) {
            log(`   ✅ ${envVar} configured`, 'green');
        } else {
            log(`   ❌ ${envVar} not found`, 'red');
            log(`      Path: ${getApiKeyPath(envVar)}`, 'gray');
            allPresent = false;
        }
    }

    return allPresent;
}

async function testLinearApi() {
    log(`   Testing Linear API connection`, 'gray');

    const apiKey = loadApiKey('LINEAR_API_KEY');
    if (!apiKey) {
        log(`   ⏭️  Skipping (no API key)`, 'yellow');
        return false;
    }

    try {
        const query = JSON.stringify({
            query: `{
                viewer {
                    id
                    name
                    email
                }
            }`
        });

        // Using PowerShell Invoke-RestMethod (Windows compatible)
        const psCommand = `
            $headers = @{
                "Authorization" = "${apiKey}"
                "Content-Type" = "application/json"
            }
            $body = '${query}'
            Invoke-RestMethod -Uri "https://api.linear.app/graphql" -Method POST -Headers $headers -Body $body | ConvertTo-Json
        `;

        const { stdout } = await execAsync(`powershell -Command "${psCommand.replace(/"/g, '\\"')}"`, {
            shell: 'powershell.exe'
        });

        const response = JSON.parse(stdout);

        if (response.data && response.data.viewer) {
            log(`   ✅ API connection successful`, 'green');
            log(`      User: ${response.data.viewer.name}`, 'gray');
            return true;
        } else {
            log(`   ❌ API returned unexpected response`, 'red');
            return false;
        }
    } catch (error) {
        log(`   ❌ API connection failed: ${error.message}`, 'red');
        return false;
    }
}

async function testGitHubApi() {
    log(`   Testing GitHub API connection`, 'gray');

    const token = loadApiKey('GITHUB_TOKEN');
    if (!token) {
        log(`   ⏭️  Skipping (no token)`, 'yellow');
        return false;
    }

    try {
        const psCommand = `
            $headers = @{
                "Authorization" = "Bearer ${token}"
                "User-Agent" = "PowerShell"
            }
            Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers | ConvertTo-Json
        `;

        const { stdout } = await execAsync(`powershell -Command "${psCommand.replace(/"/g, '\\"')}"`, {
            shell: 'powershell.exe'
        });

        const user = JSON.parse(stdout);

        if (user.login) {
            log(`   ✅ API connection successful`, 'green');
            log(`      User: ${user.login}`, 'gray');
            return true;
        } else {
            log(`   ❌ API returned unexpected response`, 'red');
            return false;
        }
    } catch (error) {
        log(`   ❌ API connection failed: ${error.message}`, 'red');
        return false;
    }
}

async function testClaudeDesktopConfig() {
    log(`   Testing Claude Desktop configuration`, 'gray');

    const appData = process.env.APPDATA;
    const configPath = path.join(appData, 'Claude', 'claude_desktop_config.json');

    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            if (config.mcpServers) {
                const serverCount = Object.keys(config.mcpServers).length;
                log(`   ✅ Config found with ${serverCount} MCP servers`, 'green');

                for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
                    log(`      - ${serverName}`, 'gray');
                }

                return true;
            } else {
                log(`   ⚠️  Config exists but no MCP servers configured`, 'yellow');
                return false;
            }
        } else {
            log(`   ❌ Claude Desktop config not found`, 'red');
            log(`      Expected: ${configPath}`, 'gray');
            return false;
        }
    } catch (error) {
        log(`   ❌ Error reading config: ${error.message}`, 'red');
        return false;
    }
}

// Main Test Runner
async function runTest(serverKey) {
    const serverConfig = mcpServers[serverKey];

    log(`\n📦 ${serverConfig.name}`, 'yellow');
    log(`   Description: ${serverConfig.description}`, 'gray');

    let passed = 0;
    let total = 0;

    // Test 1: NPM Package (if applicable)
    if (serverConfig.package) {
        total++;
        if (await testNpmPackage(serverConfig)) {
            passed++;
        }
    }

    // Test 2: Environment Variables
    if (serverConfig.requiredEnv.length > 0) {
        total++;
        if (await testEnvironmentVariables(serverConfig)) {
            passed++;
        }
    }

    // Test 3: API Connection (for specific servers)
    if (serverKey === 'linear') {
        total++;
        if (await testLinearApi()) {
            passed++;
        }
    }

    if (serverKey === 'github') {
        total++;
        if (await testGitHubApi()) {
            passed++;
        }
    }

    return { passed, total };
}

async function main() {
    log('🔌 MCP Integration Test', 'cyan');
    log('=======================\n', 'cyan');

    const args = process.argv.slice(2);
    const testAll = args.includes('--all');
    const specificServer = args.find(arg => !arg.startsWith('--'));

    let totalPassed = 0;
    let totalTests = 0;

    // Test servers
    if (testAll || !specificServer) {
        for (const serverKey of Object.keys(mcpServers)) {
            const { passed, total } = await runTest(serverKey);
            totalPassed += passed;
            totalTests += total;
        }
    } else {
        if (mcpServers[specificServer]) {
            const { passed, total } = await runTest(specificServer);
            totalPassed += passed;
            totalTests += total;
        } else {
            log(`❌ Unknown server: ${specificServer}`, 'red');
            log(`Available servers: ${Object.keys(mcpServers).join(', ')}`, 'gray');
            process.exit(1);
        }
    }

    // Test Claude Desktop Config
    log(`\n🤖 Claude Desktop Configuration`, 'yellow');
    const configResult = await testClaudeDesktopConfig();
    totalTests++;
    if (configResult) totalPassed++;

    // Summary
    log(`\n=======================`, 'cyan');
    log(`📊 Test Summary`, 'cyan');
    log(`=======================`, 'cyan');
    log(`Tests passed: ${totalPassed}/${totalTests}`, totalPassed === totalTests ? 'green' : 'yellow');

    if (totalPassed === totalTests) {
        log(`\n🎉 All tests passed!`, 'green');
        process.exit(0);
    } else {
        log(`\n⚠️  Some tests failed. Review the output above.`, 'yellow');
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    main().catch(error => {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    mcpServers,
    testNpmPackage,
    testEnvironmentVariables,
    testLinearApi,
    testGitHubApi,
    testClaudeDesktopConfig
};
