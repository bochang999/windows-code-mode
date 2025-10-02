# Linear Issue Report Template

## Basic Information

**Issue ID**: BOC-XXX
**Title**: [Descriptive title]
**Status**: Todo | In Progress | In Review | Done
**Priority**: Urgent | High | Medium | Low
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD

**Assignee**: @username
**Team**: bochang's lab
**Labels**: `windows`, `mcp`, `automation`, `security`

---

## 📋 Description

[Clear description of the issue, feature, or bug]

### Context
- **Environment**: Windows 11 / PowerShell 7.x
- **Related Systems**: MCP servers, Linear API, GitHub
- **Repository**: windows-ai-assistant-knowledge-hub

### Current Behavior
[What is happening now]

### Expected Behavior
[What should happen]

---

## 🎯 Objectives

- [ ] Primary goal 1
- [ ] Primary goal 2
- [ ] Primary goal 3

### Success Criteria
1. Criterion 1 with measurable metric
2. Criterion 2 with verification method
3. Criterion 3 with acceptance test

---

## 🔧 Technical Details

### Affected Components
- **Scripts**: `script-name.ps1`
- **Workflows**: `workflow-name.md`
- **Config**: `config-file.json`

### Dependencies
- Linear API GraphQL endpoint
- PowerShell 7.x
- MCP Server: [server-name]
- External APIs: [API names]

### Environment Variables
```powershell
$env:USERPROFILE\.linear-api-key
$env:USERPROFILE\.github-token
$env:APPDATA\Claude\claude_desktop_config.json
```

---

## 📝 Implementation Plan

### Phase 1: Preparation
**Duration**: X hours/days

1. [ ] Research existing implementations
2. [ ] Review related Linear issues
3. [ ] Validate MCP server availability
4. [ ] Check API key permissions

**Commands**:
```powershell
# Validate environment
.\scripts\validate-mcp-servers.ps1

# Check Linear connection
.\scripts\sync-linear-status.ps1 -IssueId "BOC-XXX" -Status "InProgress"
```

### Phase 2: Implementation
**Duration**: X hours/days

1. [ ] Create/modify PowerShell script
2. [ ] Update workflow documentation
3. [ ] Add error handling
4. [ ] Implement logging

**Files to Create/Modify**:
```
scripts/
  └── new-feature.ps1       # New implementation

workflows/
  └── feature-guide.md      # Documentation
```

### Phase 3: Testing
**Duration**: X hours/days

1. [ ] Unit tests
2. [ ] Integration tests with Linear API
3. [ ] MCP server integration tests
4. [ ] API key leak scanner validation

**Test Commands**:
```powershell
# Run API key scanner
.\scripts\api-key-scanner.ps1 -Path . -Recursive

# Test MCP integration
node templates\mcp-integration-test.js
```

### Phase 4: Documentation & Deployment
**Duration**: X hours/days

1. [ ] Update README.md
2. [ ] Add workflow documentation
3. [ ] Update SETUP.md if needed
4. [ ] Commit and push to GitHub

---

## 🧪 Testing Checklist

### Pre-commit Checks
- [ ] No API keys in code (pre-commit hook passes)
- [ ] PowerShell syntax validation
- [ ] File paths use Windows format

### Functional Tests
- [ ] Script executes without errors
- [ ] Linear API integration works
- [ ] MCP server communication successful
- [ ] Error handling works as expected

### Integration Tests
- [ ] Works with existing scripts
- [ ] Compatible with current workflows
- [ ] No breaking changes to config files

### Security Tests
- [ ] API keys stored securely (not in code)
- [ ] Pre-commit hook detects test keys
- [ ] No sensitive data in logs

---

## 📊 Progress Tracking

### Completed Tasks
- [x] Example completed task
- [x] Another completed task

### In Progress
- [ ] Current task being worked on

### Blocked
- [ ] Task blocked by dependency (reason: ...)

### Notes
[Daily progress notes, blockers, decisions made]

**YYYY-MM-DD HH:MM**:
- Started implementation of feature X
- Discovered issue with Y, investigating solution

**YYYY-MM-DD HH:MM**:
- Fixed issue Y by changing approach Z
- Completed Phase 1, moving to Phase 2

---

## 🐛 Bugs & Issues Encountered

### Issue 1: [Short description]
**Severity**: Critical | High | Medium | Low
**Status**: Open | Investigating | Fixed

**Description**:
[Detailed description of the bug]

**Error Message**:
```
[Error output if applicable]
```

**Root Cause**:
[Analysis of why the bug occurred]

**Solution**:
[How it was fixed or workaround]

**Prevention**:
[How to prevent similar issues in the future]

---

## 🔗 Related Issues

- **Depends On**: BOC-XXX (Description)
- **Blocks**: BOC-XXX (Description)
- **Related**: BOC-XXX (Description)
- **Duplicate Of**: BOC-XXX (if applicable)

---

## 📚 References

### Documentation
- [Windows MCP Integration Guide](../workflows/windows-mcp-integration.md)
- [PowerShell Automation](../workflows/powershell-automation.md)
- [API Key Security](../workflows/api-key-security/local-only-management.md)

### External Resources
- [Linear API Documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

### Code References
```powershell
# Example: sync-linear-status.ps1:45-60
# Relevant code snippet for reference
```

---

## 💡 Lessons Learned

### What Worked Well
- Specific approach or technique that was effective
- Tool or method that saved time

### What Could Be Improved
- Areas for optimization
- Alternative approaches to consider

### Recommendations for Future
- Best practices identified
- Pattern to reuse in similar issues

---

## ✅ Completion Checklist

Before marking as "Done", ensure:

- [ ] All objectives completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code committed to GitHub
- [ ] Pre-commit hook passes
- [ ] No API keys leaked
- [ ] Linear issue status updated to "In Review"
- [ ] Related issues updated
- [ ] Team notified (if applicable)

---

## 🤖 Automation Status

**Linear API Integration**:
```powershell
# Update status automatically
.\scripts\sync-linear-status.ps1 -IssueId "BOC-XXX" -Status "InReview"

# Add completion comment
.\scripts\add-linear-comment.ps1 -IssueId "BOC-XXX" -Body "✅ Feature implemented and tested" -UpdateStatus -NewStatus "Done"
```

**GitHub Integration**:
```powershell
# Commit changes
git add .
git commit -m "feat: Implement feature X (BOC-XXX)"
git push origin main
```

---

**Template Version**: 1.0
**Last Updated**: 2025-10-02
**Maintained By**: Windows AI Assistant Knowledge Hub
