// Direct Sequential Thinking integration for Code Mode Sandbox
// Extracted from sequentialthinking/src/sequentialthinking/index.ts
// Provides same API as MCP Sequential Thinking but without server dependency

class LocalSequentialThinking {
  constructor() {
    this.thoughtHistory = [];
    this.branches = {};
    // Disable thought logging by default in sandbox (avoid console pollution)
    this.disableThoughtLogging = true;
  }

  validateThoughtData(input) {
    const data = input || {};

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      isRevision: data.isRevision,
      revisesThought: data.revisesThought,
      branchFromThought: data.branchFromThought,
      branchId: data.branchId,
      needsMoreThoughts: data.needsMoreThoughts,
    };
  }

  formatThought(thoughtData) {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = '🔄 Revision';
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = '🌿 Branch';
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = '💭 Thought';
      context = '';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  processThought(input) {
    try {
      const validatedInput = this.validateThoughtData(input);

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      this.thoughtHistory.push(validatedInput);

      if (validatedInput.branchFromThought && validatedInput.branchId) {
        if (!this.branches[validatedInput.branchId]) {
          this.branches[validatedInput.branchId] = [];
        }
        this.branches[validatedInput.branchId].push(validatedInput);
      }

      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(validatedInput);
        console.log('[Sequential Thinking]', formattedThought);
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: validatedInput.thoughtNumber,
            totalThoughts: validatedInput.totalThoughts,
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
            branches: Object.keys(this.branches),
            thoughtHistoryLength: this.thoughtHistory.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  // MCP-compatible API for sandbox integration
  async callTool(toolName, args) {
    console.log(`[Local Sequential Thinking] Processing tool: ${toolName}`);

    if (toolName === 'sequentialthinking') {
      const result = this.processThought(args);

      // Format response to match MCP server format
      return {
        jsonrpc: '2.0',
        id: Math.random().toString(36).substring(2, 15),
        result: result
      };
    } else {
      throw new Error(`Local Sequential Thinking: Unknown tool '${toolName}'`);
    }
  }

  // Utility methods
  getThoughtHistory() {
    return this.thoughtHistory;
  }

  getBranches() {
    return this.branches;
  }

  clearHistory() {
    this.thoughtHistory = [];
    this.branches = {};
  }

  setLogging(enabled) {
    this.disableThoughtLogging = !enabled;
  }
}

module.exports = { LocalSequentialThinking };