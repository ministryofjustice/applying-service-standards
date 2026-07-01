# Security Deferrals

This document records npm dependency vulnerabilities that cannot be resolved without breaking changes or where no patched version is available within the current major version.

## Deferred Vulnerabilities

| Package | Current Version | Severity | Parent Dependency | Reason for Deferral |
|---------|----------------|----------|-------------------|---------------------|
| uuid | < 11.1.1 (transitive, ~8.x installed) | Moderate | @azure/msal-node@2.16.3 | No fix available within `@azure/msal-node` v2.x. The fix requires upgrading to `@azure/msal-node` v5.x which is a breaking major version change requiring code changes to the authentication implementation. |

## Advisory Details

### uuid — Missing buffer bounds check (GHSA-w5hq-g745-h8pq)

- **Advisory**: https://github.com/advisories/GHSA-w5hq-g745-h8pq
- **Affected versions**: uuid < 11.1.1
- **Fix available**: Yes, but requires `@azure/msal-node` >= 5.x
- **Impact**: The vulnerability relates to a missing bounds check when an optional `buf` parameter is provided to `uuid.v3()`, `uuid.v5()`, or `uuid.v6()`. This application does not directly call these functions with a buffer argument, reducing the practical risk.

## Review Schedule

This document should be reviewed when:

1. `@azure/msal-node` v5.x migration is planned
2. A patch for `uuid` becomes available within the `@azure/msal-node` v2.x dependency tree
3. As part of regular quarterly security reviews

## Last Updated

Date: 2025-07-15
