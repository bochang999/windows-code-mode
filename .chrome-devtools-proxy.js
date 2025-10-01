#!/usr/bin/env node
const WebSocket = require('ws');
const http = require('http');

class ChromeDevToolsProxy {
  constructor(port = 9222) {
    this.port = port;
    this.server = null;
    this.wss = null;
  }

  async start() {
    console.log('🔧 Starting Chrome DevTools Proxy MCP...');

    // HTTP Server for DevTools Protocol
    this.server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        description: 'Chrome DevTools Proxy for Termux',
        version: '1.0.0',
        webSocketDebuggerUrl: `ws://localhost:${this.port}/devtools`
      }));
    });

    // WebSocket Server for DevTools
    this.wss = new WebSocket.Server({
      port: this.port + 1,
      path: '/devtools'
    });

    this.wss.on('connection', (ws) => {
      console.log('📱 DevTools client connected');

      ws.on('message', (message) => {
        try {
          const cmd = JSON.parse(message);
          this.handleDevToolsCommand(cmd, ws);
        } catch (error) {
          console.error('❌ Command parsing error:', error);
        }
      });

      ws.on('close', () => {
        console.log('🔌 DevTools client disconnected');
      });
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Chrome DevTools Proxy running on http://localhost:${this.port}`);
    });
  }

  handleDevToolsCommand(cmd, ws) {
    // Basic DevTools Protocol simulation
    const response = {
      id: cmd.id,
      result: this.mockDevToolsResponse(cmd.method, cmd.params)
    };

    ws.send(JSON.stringify(response));
  }

  mockDevToolsResponse(method, params) {
    switch (method) {
      case 'Runtime.evaluate':
        return {
          result: {
            type: 'string',
            value: `Executed: ${params.expression}`
          }
        };
      case 'DOM.getDocument':
        return {
          root: {
            nodeId: 1,
            nodeType: 9,
            nodeName: '#document',
            children: []
          }
        };
      case 'Network.enable':
        return {};
      default:
        return { message: `Method ${method} simulated in Termux environment` };
    }
  }

  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    console.log('🔚 Chrome DevTools Proxy stopped');
  }
}

// 実行部分
if (require.main === module) {
  const proxy = new ChromeDevToolsProxy(9222);
  proxy.start();

  process.on('SIGTERM', () => proxy.stop());
  process.on('SIGINT', () => proxy.stop());
}

module.exports = ChromeDevToolsProxy;