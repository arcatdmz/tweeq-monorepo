# Tweeq documentation map

- [`architecture/monorepo-migration.md`](architecture/monorepo-migration.md) is
  the active implementation plan for turning Tweeq into a shared-core
  React/Vue monorepo. New architecture work starts there.
- The Markdown pages in this directory and the helpers in `.vuepress/` are the
  original Vue documentation and research demos. They remain behavioral and
  content references until both renderer demos cover the same material.

The completed one-off React port handoff documents were removed after the port
landed. Git history retains them if historical details are needed.

Renderer migration guides:

- [`migration/vue.md`](migration/vue.md) for existing upstream Vue users;
- [`migration/react.md`](migration/react.md) for users of the pre-monorepo
  React fork.

[`api-exports.md`](api-exports.md) is generated from the built public package
entries. Refresh it with `pnpm docs:generate`; CI validates it after building
the workspace.
