# ADR 0001: Package naming, npm ownership, and publishing policy

Status: accepted  
Date: 2026-07-12  
Phase: 0 (monorepo migration)

## Context

The migration plan targets `@tweeq/core`, `@tweeq/dom`, `@tweeq/styles`,
`@tweeq/react`, and `@tweeq/vue`. Neither the `@tweeq` npm scope nor the fate
of the unscoped `tweeq` name (upstream [baku89/tweeq](https://github.com/baku89/tweeq),
currently `"private": true` and unpublished) is under this fork's control.

## Decision

1. Workspace packages use the `@tweeq/*` names **internally only**:
   `@tweeq/core`, `@tweeq/dom`, `@tweeq/styles`, `@tweeq/react`, `@tweeq/vue`,
   and the private `@tweeq/test-contracts`. All resolve through the
   `workspace:` protocol, so no name ever hits the public registry during
   development or CI.
2. Every package remains `"private": true` (or is covered by a
   publish-blocking CI check) until npm scope ownership and the unscoped
   `tweeq` name are settled with the upstream author. Publishing without that
   agreement is prohibited.
3. Changesets is configured now, with the public-facing packages in one fixed
   version group, so that version intent accumulates during the migration and
   the first prerelease (`next` tag, Phase 6) needs no versioning retrofit.
4. If scope negotiation fails, the fallback is publishing under a scope this
   repository's owner controls (e.g. `@archinc/tweeq-*`); only `package.json`
   `name` fields and import docs change, because all internal references use
   `workspace:` ranges.

## Consequences

- Renaming before first publish is a mechanical find/replace, not a refactor.
- Examples and docs may use `@tweeq/*` imports immediately; they are honest
  because the examples install packed tarballs from the workspace.
- A `"publishConfig"`/CI guard, not human memory, enforces the no-publish rule.

## Phase 6 implementation status

The pre-ownership CI guard is active. A manual GitHub Actions prerelease
workflow is present but deliberately cannot publish the current `private`,
`0.0.0` packages. Unlocking it requires all of the following in one reviewed
release change:

1. confirmed ownership of the selected npm scope;
2. removal of `private` from only the five public packages;
3. restricted npm registry `publishConfig` on those packages;
4. a Changesets-generated `next` or `rc` version; and
5. an `NPM_SCOPE_APPROVED` secret in the protected `npm-prerelease` GitHub
   environment.

Publishing locally remains prohibited. The workflow publishes with npm
provenance and then tests clean React and Vue applications installed from the
registry at the exact prerelease version.
