// Advanced n8n Workflow Design Test
// Combines Sequential Thinking + n8n MCP for intelligent workflow design

(async () => {
    console.log('🎨 Advanced Workflow Design Test with Sequential Thinking\n');

    try {
        // Phase 1: Problem Analysis
        console.log('🧠 Phase 1: Analyzing workflow requirements...');
        await mcp.sequentialThinking.callTool('sequentialthinking', {
            thought: 'Analyzing requirements for Android build automation workflow...',
            thoughtNumber: 1,
            totalThoughts: 5,
            nextThoughtNeeded: true
        });
        console.log('✅ Phase 1 complete\n');

        // Phase 2: n8n Node Discovery
        console.log('🔍 Phase 2: Discovering relevant n8n nodes...');
        const webhookNodes = await mcp.n8n.searchNodes('webhook');
        const httpNodes = await mcp.n8n.searchNodes('http request');
        const notificationNodes = await mcp.n8n.searchNodes('notification slack discord');

        await mcp.sequentialThinking.callTool('sequentialthinking', {
            thought: `Found ${webhookNodes.length} webhook nodes, ${httpNodes.length} HTTP nodes, and ${notificationNodes.length} notification nodes. Designing workflow structure...`,
            thoughtNumber: 2,
            totalThoughts: 5,
            nextThoughtNeeded: true
        });
        console.log('✅ Phase 2 complete\n');

        // Phase 3: Workflow Structure Design
        console.log('📋 Phase 3: Designing workflow structure...');
        const workflow = {
            name: 'Android Build Automation',
            trigger: {
                type: 'Webhook',
                description: 'Receives build trigger from GitHub webhook'
            },
            steps: [
                {
                    node: 'HttpRequest',
                    action: 'Trigger Gradle build',
                    endpoint: 'http://localhost:8080/build'
                },
                {
                    node: 'HttpRequest',
                    action: 'Check build status',
                    polling: true
                },
                {
                    node: 'Linear',
                    action: 'Update issue status',
                    issueId: 'BOC-116'
                },
                {
                    node: 'Notion',
                    action: 'Create build report',
                    page: 'Build Reports'
                },
                {
                    node: 'Notification',
                    action: 'Send Discord notification',
                    channel: '#builds'
                }
            ]
        };

        await mcp.sequentialThinking.callTool('sequentialthinking', {
            thought: `Workflow structure complete with ${workflow.steps.length} steps. Validating design...`,
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true
        });
        console.log('✅ Phase 3 complete\n');

        // Phase 4: Get Detailed Node Info
        console.log('📚 Phase 4: Gathering detailed node documentation...');
        const httpNodeInfo = await mcp.n8n.getNodeInfo('HttpRequest');
        const webhookNodeInfo = await mcp.n8n.getNodeInfo('Webhook');

        await mcp.sequentialThinking.callTool('sequentialthinking', {
            thought: 'Collected comprehensive node documentation. Ready for implementation.',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true
        });
        console.log('✅ Phase 4 complete\n');

        // Phase 5: Final Summary
        console.log('📊 Phase 5: Generating workflow summary...');
        await mcp.sequentialThinking.callTool('sequentialthinking', {
            thought: `Android Build Automation workflow designed successfully. Ready to implement with ${workflow.steps.length} automation steps using n8n nodes.`,
            thoughtNumber: 5,
            totalThoughts: 5,
            nextThoughtNeeded: false
        });

        // Display Results
        console.log('\n═══════════════════════════════════');
        console.log('🎉 Workflow Design Complete!');
        console.log('═══════════════════════════════════\n');
        console.log('📋 Workflow Summary:');
        console.log(JSON.stringify(workflow, null, 2));
        console.log('');
        console.log('📚 Documentation Retrieved:');
        console.log(`   - HttpRequest: ${Object.keys(httpNodeInfo.properties || {}).length} properties`);
        console.log(`   - Webhook: ${Object.keys(webhookNodeInfo.properties || {}).length} properties`);
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('   1. Implement workflow in n8n UI');
        console.log('   2. Configure webhook endpoint');
        console.log('   3. Test with GitHub integration');
        console.log('   4. Deploy to production');

    } catch (error) {
        console.error('❌ Workflow design failed:', error.message);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('   1. Check n8n MCP server: npx @n8n-mcp/server');
        console.error('   2. Check Sequential Thinking MCP: npx mcp-server-sequential-thinking');
        console.error('   3. Verify both servers are running');
        throw error;
    }
})();
