// Enhanced Linear API for Code Mode Sandbox
// Implements robust search with identifier-to-UUID resolution

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  state: { name: string };
  createdAt: string;
  updatedAt: string;
  comments?: {
    nodes: Array<{
      id: string;
      body: string;
      createdAt: string;
      user: { name: string };
    }>;
  };
}

interface LinearSearchResult {
  found: boolean;
  issue?: LinearIssue;
  searchMethod?: string;
  totalSearched?: number;
}

class EnhancedLinearApi {
  private token: string;
  private issueCache: Map<string, LinearIssue> = new Map();
  private identifierToIdMap: Map<string, string> = new Map();

  constructor() {
    this.token = require('fs').readFileSync(process.env.HOME + '/.linear-api-key', 'utf8').trim();
  }

  // Progressive search strategy: recent → broader → comprehensive
  async findIssueByIdentifier(identifier: string): Promise<LinearSearchResult> {
    console.log(`[Enhanced Linear] Searching for issue: ${identifier}`);

    // Check cache first
    if (this.identifierToIdMap.has(identifier)) {
      const id = this.identifierToIdMap.get(identifier)!;
      if (this.issueCache.has(id)) {
        console.log(`[Enhanced Linear] Found in cache: ${identifier}`);
        return {
          found: true,
          issue: this.issueCache.get(id)!,
          searchMethod: 'cache'
        };
      }
    }

    // Strategy 1: Recent issues (fast)
    const recentResult = await this.searchInRecentIssues(identifier, 50);
    if (recentResult.found) {
      this.cacheIssue(recentResult.issue!);
      return { ...recentResult, searchMethod: 'recent' };
    }

    // Strategy 2: Broader search (medium)
    const broaderResult = await this.searchInRecentIssues(identifier, 200);
    if (broaderResult.found) {
      this.cacheIssue(broaderResult.issue!);
      return { ...broaderResult, searchMethod: 'broader' };
    }

    // Strategy 3: All states search (comprehensive)
    const comprehensiveResult = await this.searchInAllStates(identifier);
    if (comprehensiveResult.found) {
      this.cacheIssue(comprehensiveResult.issue!);
      return { ...comprehensiveResult, searchMethod: 'comprehensive' };
    }

    // Strategy 4: Paginated search (last resort)
    const paginatedResult = await this.searchWithPagination(identifier);
    if (paginatedResult.found) {
      this.cacheIssue(paginatedResult.issue!);
      return { ...paginatedResult, searchMethod: 'paginated' };
    }

    return { found: false };
  }

  // Search in recent issues with configurable limit
  private async searchInRecentIssues(identifier: string, limit: number): Promise<LinearSearchResult> {
    console.log(`[Enhanced Linear] Searching recent ${limit} issues...`);

    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `query {
            issues(orderBy: updatedAt, last: ${limit}) {
              nodes {
                id
                identifier
                title
                description
                state { name }
                createdAt
                updatedAt
                comments {
                  nodes {
                    id
                    body
                    createdAt
                    user { name }
                  }
                }
              }
            }
          }`
        })
      });

      if (!response.ok) {
        throw new Error(`Linear API error: ${response.status}`);
      }

      const data = await response.json();
      const issues = data.data?.issues?.nodes || [];

      // Search for matching identifier
      const matchingIssue = issues.find((issue: LinearIssue) => issue.identifier === identifier);

      if (matchingIssue) {
        console.log(`[Enhanced Linear] Found ${identifier} in recent ${limit} issues`);
        return {
          found: true,
          issue: matchingIssue,
          totalSearched: issues.length
        };
      }

      // Cache all issues for future searches
      issues.forEach((issue: LinearIssue) => {
        this.cacheIssue(issue);
      });

      return { found: false, totalSearched: issues.length };
    } catch (error) {
      console.error(`[Enhanced Linear] Error in recent search: ${error}`);
      return { found: false };
    }
  }

  // Search across all issue states
  private async searchInAllStates(identifier: string): Promise<LinearSearchResult> {
    console.log(`[Enhanced Linear] Searching across all states...`);

    const states = ['Todo', 'In Progress', 'In Review', 'Done', 'Backlog'];
    let totalSearched = 0;

    for (const state of states) {
      try {
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `query {
              issues(filter: { state: { name: { eq: "${state}" } } }, orderBy: updatedAt, last: 100) {
                nodes {
                  id
                  identifier
                  title
                  description
                  state { name }
                  createdAt
                  updatedAt
                  comments {
                    nodes {
                      id
                      body
                      createdAt
                      user { name }
                    }
                  }
                }
              }
            }`
          })
        });

        if (response.ok) {
          const data = await response.json();
          const issues = data.data?.issues?.nodes || [];
          totalSearched += issues.length;

          // Cache all issues
          issues.forEach((issue: LinearIssue) => {
            this.cacheIssue(issue);
          });

          // Check for match
          const matchingIssue = issues.find((issue: LinearIssue) => issue.identifier === identifier);
          if (matchingIssue) {
            console.log(`[Enhanced Linear] Found ${identifier} in ${state} state`);
            return {
              found: true,
              issue: matchingIssue,
              totalSearched
            };
          }
        }
      } catch (error) {
        console.warn(`[Enhanced Linear] Error searching ${state}: ${error}`);
      }
    }

    return { found: false, totalSearched };
  }

  // Paginated search as last resort
  private async searchWithPagination(identifier: string, cursor?: string): Promise<LinearSearchResult> {
    console.log(`[Enhanced Linear] Paginated search... cursor: ${cursor || 'start'}`);

    try {
      const query = cursor
        ? `query {
            issues(after: "${cursor}", first: 50) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                identifier
                title
                description
                state { name }
                createdAt
                updatedAt
              }
            }
          }`
        : `query {
            issues(first: 50) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                identifier
                title
                description
                state { name }
                createdAt
                updatedAt
              }
            }
          }`;

      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': this.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Linear API error: ${response.status}`);
      }

      const data = await response.json();
      const issues = data.data?.issues?.nodes || [];
      const pageInfo = data.data?.issues?.pageInfo;

      // Cache issues
      issues.forEach((issue: LinearIssue) => {
        this.cacheIssue(issue);
      });

      // Check for match
      const matchingIssue = issues.find((issue: LinearIssue) => issue.identifier === identifier);
      if (matchingIssue) {
        // Get full details
        const fullIssue = await this.getIssueById(matchingIssue.id);
        return {
          found: true,
          issue: fullIssue,
          totalSearched: issues.length
        };
      }

      // Continue pagination if available and not found
      if (pageInfo?.hasNextPage && pageInfo?.endCursor) {
        return await this.searchWithPagination(identifier, pageInfo.endCursor);
      }

      return { found: false, totalSearched: issues.length };
    } catch (error) {
      console.error(`[Enhanced Linear] Error in paginated search: ${error}`);
      return { found: false };
    }
  }

  // Get full issue details by ID
  async getIssueById(issueId: string): Promise<LinearIssue> {
    console.log(`[Enhanced Linear] Getting issue details: ${issueId}`);

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `query {
          issue(id: "${issueId}") {
            id
            identifier
            title
            description
            state { name }
            createdAt
            updatedAt
            comments {
              nodes {
                id
                body
                createdAt
                user { name }
              }
            }
          }
        }`
      })
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status}`);
    }

    const data = await response.json();
    const issue = data.data?.issue;

    if (issue) {
      this.cacheIssue(issue);
    }

    return issue;
  }

  // Cache management
  private cacheIssue(issue: LinearIssue): void {
    this.issueCache.set(issue.id, issue);
    this.identifierToIdMap.set(issue.identifier, issue.id);
  }

  // Legacy compatibility methods
  async getIssue(issueId: string): Promise<any> {
    // Check if issueId is actually an identifier
    if (issueId.match(/^BOC-\d+$/)) {
      const result = await this.findIssueByIdentifier(issueId);
      if (result.found) {
        return { data: { issue: result.issue } };
      } else {
        throw new Error(`Issue ${issueId} not found`);
      }
    }

    // Direct ID lookup
    const issue = await this.getIssueById(issueId);
    return { data: { issue } };
  }

  // Other Linear API methods (unchanged)
  async getActiveIssues(): Promise<any> {
    console.log(`[Enhanced Linear] Fetching active issues`);
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'query { issues(filter: { state: { type: { in: ["unstarted", "started"] } } }, orderBy: updatedAt, last: 10) { nodes { id identifier title description state { name } createdAt updatedAt } } }'
      })
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async addComment(issueId: string, body: string): Promise<any> {
    console.log(`[Enhanced Linear] Adding comment to issue: ${issueId}`);
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `mutation { commentCreate(input: { issueId: "${issueId}", body: "${body}" }) { success comment { id body } } }`
      })
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async updateIssueStatus(issueId: string, stateId: string): Promise<any> {
    console.log(`[Enhanced Linear] Updating issue status: ${issueId} -> ${stateId}`);
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `mutation { issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) { success issue { id state { name } } } }`
      })
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  // Cache statistics for debugging
  getCacheStats(): { totalIssues: number; totalIdentifiers: number } {
    return {
      totalIssues: this.issueCache.size,
      totalIdentifiers: this.identifierToIdMap.size
    };
  }
}

module.exports = { EnhancedLinearApi };