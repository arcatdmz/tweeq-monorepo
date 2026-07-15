# ADR 0001: Package naming, npm ownership, and publishing policy

Status: accepted  
Date: 2026-07-12  

## Context

The workspace uses `@tweeq/core`, `@tweeq/dom`, `@tweeq/styles`,
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
   version group so a future first prerelease (`next` tag) needs no versioning
   retrofit.
4. If scope negotiation fails, the fallback is publishing under a scope this
   repository's owner controls (e.g. `@archinc/tweeq-*`); only `package.json`
   `name` fields and import docs change, because all internal references use
   `workspace:` ranges.

## Consequences

- Renaming before first publish is a mechanical find/replace, not a refactor.
- Examples and docs may use `@tweeq/*` imports immediately; they are honest
  because the examples install packed tarballs from the workspace.
- A `"publishConfig"`/CI guard, not human memory, enforces the no-publish rule.

## Release-readiness implementation status

The pre-ownership CI guard is active. A manual GitHub Actions prerelease
workflow is present but deliberately cannot publish the current `private`,
`0.0.0` packages. Unlocking it requires all of the following in one reviewed
release change:

1. confirmed ownership of the selected npm scope;
2. removal of `private` from only the five public packages;
3. public npm registry `publishConfig` on those packages, so the documented
   unauthenticated install commands work;
4. a Changesets-generated `next` or `rc` version; and
5. an `NPM_SCOPE_APPROVED` secret in the protected `npm-release` GitHub
   environment.

Publication remains blocked until the ownership and protected-environment
requirements are satisfied.

Publishing locally remains prohibited. Each public manifest records the exact
GitHub repository URL required by npm trusted publishing. Because npm permits
one trusted publisher per package, `prerelease.yml` is the single guarded
workflow for both the `next` and `latest` dist-tags. It uses a GitHub-hosted
OIDC runner and a compatible npm CLI, retains a protected token only as a
first-publication fallback, publishes the exact archived tarballs with
provenance, and then tests clean React and Vue applications installed from the
registry at the exact version. A stable run additionally requires the
protected `STABLE_RELEASE_APPROVED` value to equal the fixed package version,
which is set only after a prerelease feedback cycle. The workflow tags the
verified commit only after both downstream registry consumers pass. Revoke the
fallback token after configuring `prerelease.yml` as the trusted publisher for
all packages.

As of 2026-07-14, the external approval boundary is intentionally not yet
provisioned: the repository has no `npm-release` environment and no
repository-level secrets or variables, while all five intended registry names
remain unpublished. After ownership is confirmed, create the protected
environment explicitly—with required reviewers and an allowed release
branch—and put `NPM_SCOPE_APPROVED`, the first-publication `NPM_TOKEN`, and the
later stable-version approval there rather than at repository scope. Do this
before the first workflow dispatch so GitHub cannot implicitly create an
unprotected environment for the job.

### Version preparation (no local publication)

Prepare the first prerelease in a reviewed release change:

```sh
pnpm exec changeset pre enter next
pnpm exec changeset version
pnpm exec changeset status
```

The fixed group must give all five public packages one
`X.Y.Z-next.N` version. After committing and pushing that generated version,
dispatch `prerelease.yml` with channel `next` and confirmation
`publish-next`. Fixes discovered during feedback receive normal Changesets and
another `changeset version` pass while pre mode remains active.

After feedback is accepted, run `pnpm exec changeset pre exit` followed by
`pnpm exec changeset version` in a reviewed stable release change. Set the
protected `STABLE_RELEASE_APPROVED` value to that exact `X.Y.Z`, then dispatch
the same workflow with channel `latest` and confirmation `publish-latest`.
These commands only edit versions/changelogs; neither command publishes.
