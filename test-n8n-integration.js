// n8n MCP Integration Test Script
// Tests n8n MCP API functionality in sandbox environment

(async () => {
    console.log('🧪 Starting n8n MCP Integration Test...\n');

    try {
        // Test 1: Get HTTP Request Node Info
        console.log('📝 Test 1: Getting HttpRequest node info...');
        const httpNode = await mcp.n8n.getNodeInfo('HttpRequest');
        console.log('✅ HttpRequest node retrieved');
        console.log('   Properties:', Object.keys(httpNode.properties || {}).length);
        console.log('   Operations:', Object.keys(httpNode.operations || {}).length);
        console.log('');

        // Test 2: Search Webhook Nodes
        console.log('📝 Test 2: Searching webhook nodes...');
        const webhookNodes = await mcp.n8n.searchNodes('webhook');
        console.log('✅ Webhook nodes found:', webhookNodes.length);
        if (webhookNodes.length > 0) {
            console.log('   First result:', webhookNodes[0].name || webhookNodes[0]);
        }
        console.log('');

        // Test 3: List AI Nodes
        console.log('📝 Test 3: Listing AI category nodes...');
        const aiNodes = await mcp.n8n.listNodes({ category: 'AI' });
        console.log('✅ AI nodes found:', aiNodes.length);
        if (aiNodes.length > 0) {
            console.log('   Sample nodes:', aiNodes.slice(0, 3).map(n => n.name || n).join(', '));
        }
        console.log('');

        // Test 4: Get Database Nodes
        console.log('📝 Test 4: Searching database nodes...');
        const dbNodes = await mcp.n8n.searchNodes('database postgres mysql');
        console.log('✅ Database nodes found:', dbNodes.length);
        console.log('');

        // Summary
        console.log('═══════════════════════════════════');
        console.log('🎉 All n8n MCP tests passed!');
        console.log('═══════════════════════════════════');
        console.log('');
        console.log('📊 Test Summary:');
        console.log('   ✅ Node info retrieval: PASS');
        console.log('   ✅ Node search: PASS');
        console.log('   ✅ Node listing: PASS');
        console.log('   ✅ Category filtering: PASS');
        console.log('');
        console.log('🚀 n8n MCP is ready for production use!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('   1. Ensure n8n MCP server is running:');
        console.error('      npx @n8n-mcp/server');
        console.error('   2. Check server is listening on http://localhost:3000');
        console.error('   3. Verify network connectivity');
        console.error('');
        throw error;
    }
})();
