---
name: Refactor React Component
description: Best practices and patterns for refactoring large React components into smaller, maintainable pieces.
---

# Refactor React Component Skill

This skill provides guidelines and patterns for breaking down complex React components.

## When to Refactor

- **Size**: File exceeds 300-400 lines.
- **Complexity**: Component handles multiple concerns (UI, data fetching, complex state).
- **Reusability**: Parts of the component could be used elsewhere.
- **Readability**: Logic is hard to follow due to nesting or length.

## Refactoring Strategies

### 1. Extract Sub-components

Identify logical sections of the UI and extract them into separate files.

**Pattern:**
Create a `_components` or `components` directory adjacent to the main page/component file.

**Example:**
- `page.tsx` (Main container)
  - `components/UserList.tsx`
  - `components/UserForm.tsx`
  - `components/UserStats.tsx`

### 2. Extract Custom Hooks

Move logic, state management, and side effects into custom hooks.

**Pattern:**
Create a `_hooks` or `hooks` directory.

**Example:**
- `useUserData.ts`: Handles data fetching (e.g., using TanStack Query).
- `useUserForm.ts`: Handles form state and validation.

### 3. Separation of Concerns (Container/Presentational)

- **Container Components**: Handle data fetching and state. Pass data as props.
- **Presentational Components**: Purely UI. Receive data and callbacks via props.

## Naming Conventions

- **Components**: PascalCase (e.g., `UserList.tsx`).
- **Hooks**: camelCase starting with `use` (e.g., `useUserData.ts`).
- **Directories**: kebab-case (e.g., `_components`).

## Step-by-Step Process

1.  **Analyze**: Identify distinct UI sections and logic blocks.
2.  **Plan**: Decide on the new directory structure and component names.
3.  **Extract UI**: Move JSX and relevant styles/props to new component files.
4.  **Extract Logic**: Move state and effects to custom hooks.
5.  **Integrate**: Import and use new components/hooks in the parent component.
6.  **Verify**: Ensure functionality remains unchanged.

## Tools

- `view_file`: Analyze current component structure.
- `write_to_file`: Create new component/hook files.
- `replace_file_content`: Update parent component to use new imports.
