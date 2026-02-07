---
description: Generate code templates (Components, Hooks, Types) using Plop.
---

# Code Generator Skill

This skill allows you to generate boilerplate code for React components, custom hooks, and type definitions using `plop`.

## Usage

You can use the `npm run gen` command followed by the generator name and options.

### Generators

#### 1. Component
Generates a React component.

```bash
npm run gen component -- --name <ComponentName> --type <functional|stateful> --dir <TargetDirectory> [--barrel]
```

- **name**: PascalCase name of the component (e.g., `MyComponent`).
- **type**: `functional` (default) or `stateful`.
- **dir**: Target directory (default: `apps/web/src/components`).
- **barrel**: (Optional) meaningful only if you want an `index.ts` file created.

**Example:**
```bash
npm run gen component -- --name UserProfile --type functional
```

#### 2. Logic (Hook)
Generates a custom hook.

```bash
npm run gen logic -- --name <HookName> --type <interaction|pure> --dir <TargetDirectory>
```

- **name**: camelCase name of the hook (e.g., `useAuth`).
- **type**: `interaction` (default) or `pure`.
- **dir**: Target directory (default: `apps/web/src/hooks`).

**Example:**
```bash
npm run gen logic -- --name useCounter --type pure
```

#### 3. Type
Generates a TypeScript interface or Zod schema.

```bash
npm run gen type -- --name <TypeName> --kind <interface|zod> --dir <TargetDirectory>
```

- **name**: Name of the type.
- **kind**: `interface` (default) or `zod`.
- **dir**: Target directory (default: `apps/web/src/types`).

**Example:**
```bash
npm run gen type -- --name UserSchema --kind zod --dir packages/db/src/schema
```

## Interactive Mode
If you run `npm run gen` without arguments, it will launch an interactive prompt to guide you through the options.

```bash
npm run gen
```
