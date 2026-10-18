# Project Rules & Guidelines

## Component Sourcing & Reuse

When any component is needed or requested:

1. **Check Upstream Template First**:
   - Upstream template repository: [https://github.com/Downspice/align-ui-marketing-template](https://github.com/Downspice/align-ui-marketing-template)
   - Available locally via git remote `upstream`:
     - Inspect available components: `git ls-tree -r --name-only upstream/main:components`
     - View component code: `git show upstream/main:components/<component-path>`
2. **Reuse / Bring In Existing Components**:
   - If the component (or its equivalent) exists in `upstream/main`, bring it into the project rather than writing a duplicate.
   - If a similar component exists, offer it or propose adapting it.
3. **Explicit Confirmation Before Creating**:
   - If no matching or similar component exists in the upstream template, **ask the user explicitly for confirmation before creating a new component from scratch**.
4. **Pristine Components Are Strictly Read-Only**:
   - `components/ui-pristine/` is an immutable reference backup.
   - **DO NOT modify, edit, delete, or write to files inside `components/ui-pristine/` under any circumstances.**
   - All customizable components live in `components/ui/`. Application code must only import from `@/components/ui/`.

---

## Conventions & Architecture

### 1. Naming Conventions

- **React Components / Files**: `kebab-case.tsx` (e.g., `user-profile-card.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAuthToken.ts`)
- **Utilities / Constants**: `kebab-case.ts` (e.g., `date-formatter.ts`)

### 2. Page & Feature Architecture

**Principle: Apps route; pages orchestrate; modals mutate and inspect; forms display.**

1. **Modals & Drawers as Siblings**:
   - Placed beside the page entry (`page.tsx` or feature index) named after actions: `create.tsx`, `update.tsx`, `view.tsx`, `delete.tsx`.
   - Each action file manages its modal/drawer shell, title, action buttons, queries/mutations, form management, and close/reset state.
   - `create.tsx` and `update.tsx` share field presentation via `form.tsx` (pure presentation without data fetching or URL handling).
   - Validation schemas defined in `create.tsx` and reused in `update.tsx`. `update.tsx` loads details and hydrates form fields.
   - `view.tsx` is read-only: query/loading shell with identical section layout, without submit actions.

2. **Multi-Step Wizards (`form/` Subfolder)**:
   - For multi-step wizard flows, organize under a `form/` subfolder:
     - `form/index.tsx`: Step orchestration and wiring.
     - `form/form-steps.tsx`: Steps list and definitions.
     - `*-form.tsx` and `*-summary.tsx`: Individual step form and summary views.
     - `form/types.ts`: Local form types, step values, and UI-only unions.

3. **Filters (`filters.tsx`)**:
   - Non-trivial filters live in a sibling `filters.tsx` (drawer bound to URL parameters/state).
   - Page triggers the drawer and shows active filter badges; the drawer clears only its own keys.

4. **Flat Sibling Structure**:
   - Keep siblings in the page folder (`filters.tsx`, `filters-mobile.tsx`, `tabs.tsx`) without adding premature `modals/` or `hooks/` subfolders unless the subfeature is exceptionally large.
   - Reusable UI primitives belong in `components/ui/`; the page folder glues the screen together.
