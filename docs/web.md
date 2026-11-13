# Web app

How `apps/web` is organized. Running it is in the app's [README](../apps/web/README.md).

## Structure

```
apps/web/src/
  main.tsx          entry: mounts the app
  app/              provider.tsx, router.tsx, and routes/ (TanStack file routes)
  components/       app-wide pieces that are not design-system material: app shell, layouts
  features/<name>/  one folder per feature, such as chat or threads
    api/            hooks that read and write backend data
    components/
    data/           recorded data the feature's api/ hooks serve, such as the demo threads
    hooks/          UI-only hooks
    utils/
  lib/              configured libraries: the Convex client, the query client
  hooks/            hooks shared by more than one feature
  utils/            helpers shared by more than one feature
  types/            types shared by more than one feature
```

- Create a folder when the first file needs it. A feature has only the subfolders it uses.
- Reusable UI belongs in `@goat-format-chatbot/design-system`. `components/` holds what only this app needs.
- Routes stay thin: they read params and render a feature's components.
- `VITE_*` variables are declared and validated in `lib/env.ts` with t3 env and read only through it. Vite's built-ins (`import.meta.env.MODE`, `BASE_URL`) are read directly. The demo build has no backend variables, so `skipValidation` turns validation off in demo mode, and only the live providers read `env`.
- Components get backend data from their feature's `api/` hooks and never call Convex. The hooks keep Convex, TanStack Query, and the demo's recorded threads out of components, so the demo build swaps one layer.

## Rules

| Rule                                                                                                  | Enforced by                         |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Imports flow one way: shared folders, then `features/`, then `app/`                                   | `no-restricted-imports`             |
| A feature never imports another feature. Code two features need moves to a shared folder              | `no-restricted-imports`             |
| Only `lib/` and `features/*/api/` import `convex`, `@convex-dev/*`, or `@goat-format-chatbot/backend` | `no-restricted-imports`             |
| `./` for files in the same folder, `@/` (mapped to `src/`) for everything else                        | `import/no-relative-parent-imports` |
| No barrel files. Import from the file that defines the thing                                          | `oxc/no-barrel-file`                |
| File names are kebab-case, except TanStack route files                                                | `unicorn/filename-case`             |

The rules live in the `apps/web` overrides of `.oxlintrc.json`. Later overrides replace earlier `no-restricted-imports` settings, so each folder's override lists every pattern it needs.

## Adding a feature

`features/**` fails closed: a new feature cannot import its own files until it has its own pair of overrides. Add them after the existing `apps/web` overrides in `.oxlintrc.json`, with the feature's name in place of `chat`:

```jsonc
{
  "files": ["apps/web/src/features/chat/**"],
  "excludeFiles": ["apps/web/src/features/chat/api/**"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          { "group": ["convex", "convex/**", "@convex-dev/**", "@goat-format-chatbot/backend", "@goat-format-chatbot/backend/**"], "message": "..." },
          { "group": ["@/features/**", "!@/features/chat/**"], "message": "..." },
          { "group": ["@/app/**"], "message": "..." }
        ]
      }
    ]
  }
},
{
  "files": ["apps/web/src/features/chat/api/**"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          { "group": ["@/features/**", "!@/features/chat/**"], "message": "..." },
          { "group": ["@/app/**"], "message": "..." }
        ]
      }
    ]
  }
}
```

Copy the messages from the existing overrides.
