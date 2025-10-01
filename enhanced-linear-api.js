// Enhanced Linear API for Code Mode Sandbox
// Implements robust search with identifier-to-UUID resolution
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var EnhancedLinearApi = /** @class */ (function () {
    function EnhancedLinearApi() {
        this.issueCache = new Map();
        this.identifierToIdMap = new Map();
        this.token = require('fs').readFileSync(process.env.HOME + '/.linear-api-key', 'utf8').trim();
    }
    // Progressive search strategy: recent → broader → comprehensive
    EnhancedLinearApi.prototype.findIssueByIdentifier = function (identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var id, recentResult, broaderResult, comprehensiveResult, paginatedResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Enhanced Linear] Searching for issue: ".concat(identifier));
                        // Check cache first
                        if (this.identifierToIdMap.has(identifier)) {
                            id = this.identifierToIdMap.get(identifier);
                            if (this.issueCache.has(id)) {
                                console.log("[Enhanced Linear] Found in cache: ".concat(identifier));
                                return [2 /*return*/, {
                                        found: true,
                                        issue: this.issueCache.get(id),
                                        searchMethod: 'cache'
                                    }];
                            }
                        }
                        return [4 /*yield*/, this.searchInRecentIssues(identifier, 50)];
                    case 1:
                        recentResult = _a.sent();
                        if (recentResult.found) {
                            this.cacheIssue(recentResult.issue);
                            return [2 /*return*/, __assign(__assign({}, recentResult), { searchMethod: 'recent' })];
                        }
                        return [4 /*yield*/, this.searchInRecentIssues(identifier, 200)];
                    case 2:
                        broaderResult = _a.sent();
                        if (broaderResult.found) {
                            this.cacheIssue(broaderResult.issue);
                            return [2 /*return*/, __assign(__assign({}, broaderResult), { searchMethod: 'broader' })];
                        }
                        return [4 /*yield*/, this.searchInAllStates(identifier)];
                    case 3:
                        comprehensiveResult = _a.sent();
                        if (comprehensiveResult.found) {
                            this.cacheIssue(comprehensiveResult.issue);
                            return [2 /*return*/, __assign(__assign({}, comprehensiveResult), { searchMethod: 'comprehensive' })];
                        }
                        return [4 /*yield*/, this.searchWithPagination(identifier)];
                    case 4:
                        paginatedResult = _a.sent();
                        if (paginatedResult.found) {
                            this.cacheIssue(paginatedResult.issue);
                            return [2 /*return*/, __assign(__assign({}, paginatedResult), { searchMethod: 'paginated' })];
                        }
                        return [2 /*return*/, { found: false }];
                }
            });
        });
    };
    // Search in recent issues with configurable limit
    EnhancedLinearApi.prototype.searchInRecentIssues = function (identifier, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, issues, matchingIssue, error_1;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("[Enhanced Linear] Searching recent ".concat(limit, " issues..."));
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: "query {\n            issues(orderBy: updatedAt, last: ".concat(limit, ") {\n              nodes {\n                id\n                identifier\n                title\n                description\n                state { name }\n                createdAt\n                updatedAt\n                comments {\n                  nodes {\n                    id\n                    body\n                    createdAt\n                    user { name }\n                  }\n                }\n              }\n            }\n          }")
                                })
                            })];
                    case 2:
                        response = _c.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _c.sent();
                        issues = ((_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.nodes) || [];
                        matchingIssue = issues.find(function (issue) { return issue.identifier === identifier; });
                        if (matchingIssue) {
                            console.log("[Enhanced Linear] Found ".concat(identifier, " in recent ").concat(limit, " issues"));
                            return [2 /*return*/, {
                                    found: true,
                                    issue: matchingIssue,
                                    totalSearched: issues.length
                                }];
                        }
                        // Cache all issues for future searches
                        issues.forEach(function (issue) {
                            _this.cacheIssue(issue);
                        });
                        return [2 /*return*/, { found: false, totalSearched: issues.length }];
                    case 4:
                        error_1 = _c.sent();
                        console.error("[Enhanced Linear] Error in recent search: ".concat(error_1));
                        return [2 /*return*/, { found: false }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Search across all issue states
    EnhancedLinearApi.prototype.searchInAllStates = function (identifier) {
        return __awaiter(this, void 0, void 0, function () {
            var states, totalSearched, _i, states_1, state, response, data, issues, matchingIssue, error_2;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("[Enhanced Linear] Searching across all states...");
                        states = ['Todo', 'In Progress', 'In Review', 'Done', 'Backlog'];
                        totalSearched = 0;
                        _i = 0, states_1 = states;
                        _c.label = 1;
                    case 1:
                        if (!(_i < states_1.length)) return [3 /*break*/, 8];
                        state = states_1[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: "query {\n              issues(filter: { state: { name: { eq: \"".concat(state, "\" } } }, orderBy: updatedAt, last: 100) {\n                nodes {\n                  id\n                  identifier\n                  title\n                  description\n                  state { name }\n                  createdAt\n                  updatedAt\n                  comments {\n                    nodes {\n                      id\n                      body\n                      createdAt\n                      user { name }\n                    }\n                  }\n                }\n              }\n            }")
                                })
                            })];
                    case 3:
                        response = _c.sent();
                        if (!response.ok) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _c.sent();
                        issues = ((_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.nodes) || [];
                        totalSearched += issues.length;
                        // Cache all issues
                        issues.forEach(function (issue) {
                            _this.cacheIssue(issue);
                        });
                        matchingIssue = issues.find(function (issue) { return issue.identifier === identifier; });
                        if (matchingIssue) {
                            console.log("[Enhanced Linear] Found ".concat(identifier, " in ").concat(state, " state"));
                            return [2 /*return*/, {
                                    found: true,
                                    issue: matchingIssue,
                                    totalSearched: totalSearched
                                }];
                        }
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _c.sent();
                        console.warn("[Enhanced Linear] Error searching ".concat(state, ": ").concat(error_2));
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, { found: false, totalSearched: totalSearched }];
                }
            });
        });
    };
    // Paginated search as last resort
    EnhancedLinearApi.prototype.searchWithPagination = function (identifier, cursor) {
        return __awaiter(this, void 0, void 0, function () {
            var query, response, data, issues, pageInfo, matchingIssue, fullIssue, error_3;
            var _this = this;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        console.log("[Enhanced Linear] Paginated search... cursor: ".concat(cursor || 'start'));
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 8, , 9]);
                        query = cursor
                            ? "query {\n            issues(after: \"".concat(cursor, "\", first: 50) {\n              pageInfo { hasNextPage endCursor }\n              nodes {\n                id\n                identifier\n                title\n                description\n                state { name }\n                createdAt\n                updatedAt\n              }\n            }\n          }")
                            : "query {\n            issues(first: 50) {\n              pageInfo { hasNextPage endCursor }\n              nodes {\n                id\n                identifier\n                title\n                description\n                state { name }\n                createdAt\n                updatedAt\n              }\n            }\n          }";
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ query: query })
                            })];
                    case 2:
                        response = _e.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _e.sent();
                        issues = ((_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.issues) === null || _b === void 0 ? void 0 : _b.nodes) || [];
                        pageInfo = (_d = (_c = data.data) === null || _c === void 0 ? void 0 : _c.issues) === null || _d === void 0 ? void 0 : _d.pageInfo;
                        // Cache issues
                        issues.forEach(function (issue) {
                            _this.cacheIssue(issue);
                        });
                        matchingIssue = issues.find(function (issue) { return issue.identifier === identifier; });
                        if (!matchingIssue) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getIssueById(matchingIssue.id)];
                    case 4:
                        fullIssue = _e.sent();
                        return [2 /*return*/, {
                                found: true,
                                issue: fullIssue,
                                totalSearched: issues.length
                            }];
                    case 5:
                        if (!((pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.hasNextPage) && (pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.endCursor))) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.searchWithPagination(identifier, pageInfo.endCursor)];
                    case 6: return [2 /*return*/, _e.sent()];
                    case 7: return [2 /*return*/, { found: false, totalSearched: issues.length }];
                    case 8:
                        error_3 = _e.sent();
                        console.error("[Enhanced Linear] Error in paginated search: ".concat(error_3));
                        return [2 /*return*/, { found: false }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Get full issue details by ID
    EnhancedLinearApi.prototype.getIssueById = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, issue;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("[Enhanced Linear] Getting issue details: ".concat(issueId));
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: "query {\n          issue(id: \"".concat(issueId, "\") {\n            id\n            identifier\n            title\n            description\n            state { name }\n            createdAt\n            updatedAt\n            comments {\n              nodes {\n                id\n                body\n                createdAt\n                user { name }\n              }\n            }\n          }\n        }")
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        issue = (_a = data.data) === null || _a === void 0 ? void 0 : _a.issue;
                        if (issue) {
                            this.cacheIssue(issue);
                        }
                        return [2 /*return*/, issue];
                }
            });
        });
    };
    // Cache management
    EnhancedLinearApi.prototype.cacheIssue = function (issue) {
        this.issueCache.set(issue.id, issue);
        this.identifierToIdMap.set(issue.identifier, issue.id);
    };
    // Legacy compatibility methods
    EnhancedLinearApi.prototype.getIssue = function (issueId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, issue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!issueId.match(/^BOC-\d+$/)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.findIssueByIdentifier(issueId)];
                    case 1:
                        result = _a.sent();
                        if (result.found) {
                            return [2 /*return*/, { data: { issue: result.issue } }];
                        }
                        else {
                            throw new Error("Issue ".concat(issueId, " not found"));
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.getIssueById(issueId)];
                    case 3:
                        issue = _a.sent();
                        return [2 /*return*/, { data: { issue: issue } }];
                }
            });
        });
    };
    // Other Linear API methods (unchanged)
    EnhancedLinearApi.prototype.getActiveIssues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Enhanced Linear] Fetching active issues");
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: 'query { issues(filter: { state: { type: { in: ["unstarted", "started"] } } }, orderBy: updatedAt, last: 10) { nodes { id identifier title description state { name } createdAt updatedAt } } }'
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EnhancedLinearApi.prototype.addComment = function (issueId, body) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Enhanced Linear] Adding comment to issue: ".concat(issueId));
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: "mutation { commentCreate(input: { issueId: \"".concat(issueId, "\", body: \"").concat(body, "\" }) { success comment { id body } } }")
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EnhancedLinearApi.prototype.updateIssueStatus = function (issueId, stateId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Enhanced Linear] Updating issue status: ".concat(issueId, " -> ").concat(stateId));
                        return [4 /*yield*/, fetch('https://api.linear.app/graphql', {
                                method: 'POST',
                                headers: {
                                    'Authorization': this.token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    query: "mutation { issueUpdate(id: \"".concat(issueId, "\", input: { stateId: \"").concat(stateId, "\" }) { success issue { id state { name } } } }")
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Linear API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Cache statistics for debugging
    EnhancedLinearApi.prototype.getCacheStats = function () {
        return {
            totalIssues: this.issueCache.size,
            totalIdentifiers: this.identifierToIdMap.size
        };
    };
    return EnhancedLinearApi;
}());
module.exports = { EnhancedLinearApi: EnhancedLinearApi };
