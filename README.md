# regularisation-intake

A SvelteKit app with a pnpm-first developer toolchain built around:

- **mise** for local and CI toolchain orchestration
- **pnpm** for deterministic installs
- **Biome** for formatting and linting
- **svelte-check** for Svelte-aware type checking
- **Vitest** for unit tests

## Tooling

- `.node-version` is the canonical Node runtime version for local development, CI, and deploy platforms
- `package.json#engines.node` is the compatibility guardrail enforced during install
- `mise.toml` manages the developer toolchain and reads the repo's idiomatic Node version file
- `package.json#packageManager` enforces the pnpm version policy
- `netlify.toml` is the version-controlled source of truth for Netlify build configuration
- `svelte.config.js` uses the explicit Netlify adapter for production deploys
- `.npmrc` keeps pnpm policy visible in-repo
- `biome.jsonc` is the single source of truth for formatting and linting
- `pnpm-workspace.yaml` keeps the repo ready for workspace growth and narrowly approves required dependency build scripts
- GitHub Actions runs a thin CI pipeline: install, check, typecheck, test

## Bootstrap

```sh
mise install
mise x -- pnpm install --frozen-lockfile
```

This will provision the repo's declared Node and pnpm toolchain.

## Development

```sh
mise x -- pnpm dev
```

```sh
# open a browser automatically
mise x -- pnpm dev -- --open
```

## Quality gates

```sh
pnpm run check
pnpm run typecheck
pnpm test
```

`pnpm run check` runs Biome's formatter, linter, and assist checks in one pass.

## Available scripts

- `pnpm dev`
- `pnpm build`
- `pnpm install --frozen-lockfile`
- `pnpm preview`
- `pnpm format`
- `pnpm lint`
- `pnpm check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:watch`

## Lockfile discipline

Commit `pnpm-lock.yaml` whenever dependencies change. CI installs with `--frozen-lockfile`, so dependency drift gets caught immediately.

## Hosting

This repo is configured for Netlify using:

- `.node-version` for the canonical Node runtime version
- `netlify.toml` for Netlify build configuration
- `@sveltejs/adapter-netlify` for the production deployment target

## Biome with Svelte

This repo uses Biome directly on `.svelte` files.

- Biome 2.3+ can parse, format and lint Svelte files
- Biome 2.4 materially improves Svelte support
- `html.experimentalFullSupportEnabled` is enabled so embedded `<script>` and `<style>` blocks are handled consistently
- `svelte-check` remains in place because Biome is not a replacement for Svelte's project-aware type checking

## Security posture

- pnpm 10 already blocks dependency build scripts by default
- Required dependency build scripts are approved narrowly in `pnpm-workspace.yaml`
- Prefer `pnpm dlx` for one-off CLIs instead of adding throwaway dependencies
- Use `pnpm patch` / `pnpm patch-commit` for reproducible dependency patching

## Notes

- This is a single-package repo today, so Changesets and package filtering are not wired in yet
- The workspace file remains in place so the repo can grow into a monorepo cleanly
- When upgrading Biome across minor or major versions, run `pnpm exec biome migrate --write`
