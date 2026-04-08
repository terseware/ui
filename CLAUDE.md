# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build all projects
pnpm build                  # nx run-many -t build

# Test all projects
pnpm test                   # nx run-many -t test

# Lint all projects (with autofix)
pnpm fix                    # nx run-many -t lint --fix

# Single project commands
npx nx build ui
npx nx test ui
npx nx lint ui
npx nx serve web
npx nx serve examples

# Run a single test file
npx nx test ui -- --testPathPattern='button'
```

Test runner is Vitest with `@analogjs/vitest-angular`. Tests use `@testing-library/angular` + `@testing-library/user-event`.

## Architecture

Nx monorepo (`pnpm` workspace) with Angular 21, TypeScript 6, and Vite.

### Packages

- **`packages/ui`** — Publishable Angular component library (`@terseware/ui`). Built with ng-packagr. Each subdirectory is a secondary entry point (e.g., `@terseware/ui/menu`, `@terseware/ui/button`).
- **`apps/web`** — SSR-enabled demo app consuming the library.
- **`apps/examples`** — Client-side demo showing wrapper directive composition patterns.

### UI Library Layering

The library follows a strict **atoms → primitives → composites** hierarchy:

**Atoms** (`packages/ui/atoms/`) — Single-purpose directives that control one host attribute or ARIA property. Each atom extends `ControlledSource<T>` and uses `linkedSignal()` to bridge inputs to reactive state. Examples: `AttrRole`, `AttrType`, `TabIndex`, `Disabler`, `AriaExpanded`, `Classes`.

**Primitives** (`packages/ui/button/`, `interactive/`, `anchor/`, etc.) — Behavioral directives that compose atoms via `hostDirectives`. Examples: `Interactive` composes `Disabler` + `TabIndex`; `Button` composes `Interactive` + `AttrRole` + `AttrType`.

**Composites** (`packages/ui/menu/`, `roving-focus/`, `focus-trap/`) — Full-featured components composed from primitives. Example: `MenuTrigger` composes `Button` + `Anchor` + `AriaHasPopup` + `AriaExpanded`.

### Core Pattern: De-duplicated Host Directives (`@AutoHost`)

This is the architectural heart of the library. Angular's `hostDirectives` can create duplicate directive instances when the same directive appears at multiple composition levels. The `@AutoHost()` decorator + `AutoHostResolver` solves this:

1. `@AutoHost()` adds a `__NG_ELEMENT_ID__` factory to the class that calls `AutoHostResolver.resolve(Type)`.
2. `AutoHostResolver` maintains a `WeakMap<HTMLElement, Map<Constructor, Instance>>` — one instance per directive type per DOM element.
3. When Angular instantiates a host directive, the factory returns the cached singleton instead of creating a duplicate.

**All atoms and `HostAttributes` use `@AutoHost()`.** Any new atom or composable directive must also use it.

### Sources (`packages/ui/sources/`)

Reactive value containers used by atoms and primitives:

- **`ControlledSource<T>`** — Writable signal wrapper with `set()`, `update()`, `control()`. Used by atoms for mutable state.
- **`Source<T>`** — Read-only signal wrapper (callable via Proxy). Used for computed-only values like `Anchor`.
- **`ConcatSource<T, M>`** — Composable pre/post source arrays with abstract `merge()`. Used by `Classes` to stack CSS classes across composition layers.

### Options Pattern (`optsBuilder`)

Hierarchical configuration via DI:

```typescript
const [provideMyOpts, injectMyOpts] = optsBuilder<MyOpts>('Name', defaults, optionalMerger);
```

Returns a `[provider, injector]` tuple. Providers can be placed at any component level for hierarchical override. Supports deep merging and function-based (lazy) option values. Used by `Button`, `TerseId`, `Anchored`, etc.

### Key Utilities (`packages/ui/internal/`)

- **`injectElement()`** — Type-safe host element injection.
- **`HostAttributes`** — Reads static host attributes via `HostAttributeToken` with memoized caching. Also `@AutoHost()`-enabled.
- **`deepMerge()`** — Recursive object merge with prototype pollution protection.
- **`unwrap()` / `unwrapInject()`** — Resolves `MaybeFn<T>` values (function or direct).

## Conventions

- **Selectors**: lowercase attribute selectors (`[button]`, `[menuItem]`, `[menuTrigger]`)
- **Export as**: matches attribute name (`exportAs: 'button'`)
- **Imports**: enforce `type` keyword for type-only imports/exports (`consistent-type-imports`, `consistent-type-exports`)
- **Signals over observables**: use Angular signals, `linkedSignal()`, `computed()`, `effect()` — not RxJS for component state
- **Standalone only**: all directives/components are standalone
- **Testing**: use `@testing-library/angular` `render()` + `screen` queries + `userEvent` for interactions
