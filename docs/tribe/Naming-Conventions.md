# Project Structure & Naming Conventions

This document outlines the standard conventions for our Vite + React + TypeScript project. The golden rule is **consistency**: if you are unsure how to name something, look at how it is done elsewhere in the codebase.

## 1. Project Structure

We use a **feature-based** (or hybrid) folder structure to keep related code together, supplemented by a shared directory for global items.

* **`/src/components/`**: Shared, reusable UI widgets (e.g., Buttons, Inputs).
* **`/src/features/`**: Major areas of the application (e.g., `dashboard`, `auth`). Each feature folder should contain its own specific components, hooks, and types.
* **`/src/hooks/`**: Global custom hooks.
* **`/src/utils/`**: Helper functions and utilities.

## 2. File & Folder Naming

* **Folders**: Use `lowercase` (and `kebab-case` if multiple words). 
    * *Example*: `components`, `user-profile`
* **Component Files**: Use `PascalCase`. The file name must match the component name.
    * *Example*: `UserProfile.tsx`, `Navigation.tsx`
* **Non-Component Files**: Use `camelCase` or `kebab-case` (pick one and stick to it team-wide).
    * *Example*: `apiHelpers.ts`, `format-date.ts`

## 3. Code Naming Conventions

### React & TypeScript
* **Components**: `PascalCase`. Helps React distinguish them from standard HTML elements.
    * *Example*: `const SubmitButton = () => {...}`
* **Types & Interfaces**: `PascalCase`. (Optional Team Rule: Prefix interfaces with `I`, like `IUserProps` or `IState`, to distinguish them from standard classes).
* **Custom Hooks**: Always prefix with `use` in `camelCase`.
    * *Example*: `useAuth()`, `useWindowSize()`

### Variables & Logic
* **State Variables**: Use descriptive names. For booleans, use prefixes like `is`, `has`, or `should`.
    * *Example*: `isLoading`, `hasError`, `userList`
* **Props**: Be specific. Avoid generic names like `data` or `value` if a more descriptive name exists.
    * *Example*: Use `userData` or `chartConfig`.
* **Event Handlers**: 
    * Prefix functions handling events with `handle`. 
        * *Example*: `handleClick`, `handleInputChange`
    * Prefix props passing those handlers with `on`.
        * *Example*: `<Button onClick={handleClick} />`

### Styling
* **CSS Modules**: Use `camelCase` for CSS class names so they can be easily imported and accessed via dot notation in JavaScript.
    * *Example*: `.navBar { ... }` accessed as `styles.navBar`

## 4. Required Tooling

To enforce these standards automatically, all team members must use the following tools:
1.  **Prettier**: Configured in our workspace for automatic code formatting.
2.  **Code Spell Checker**: Install the VS Code extension by Street Side Software to catch typos in variable and function names.