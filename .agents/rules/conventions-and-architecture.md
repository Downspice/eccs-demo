# Conventions & Architecture

## 1. Naming Conventions

Consistency is enforced to keep the repository structured and searchable:

- **React Components / Files**: `kebab-case.tsx`  
  _Example: `user-profile-card.tsx`_
- **Hooks**: `useCamelCase.ts`  
  _Example: `useAuthToken.ts`_
- **Utilities / Constants**: `kebab-case.ts`  
  _Example: `date-formatter.ts`_

---

## 2. Page & Feature Architecture

Organization philosophy: **Apps route; pages orchestrate; modals mutate and inspect; forms display.**

### 2.1 File & Modal Structure Beside the Page
- Modals/Drawers live as separate sibling files beside the feature entry point (`page.tsx` or feature index), named after the action they perform:
  - `create.tsx`
  - `update.tsx`
  - `view.tsx`
  - `delete.tsx`, `cancel.tsx`, etc.
- Each action file represents the full modal or drawer: shell from design system / UI primitives, title, footer actions, queries/mutations, form management, notifications, and close/reset behavior.
- **Do not duplicate field markup**:
  - `create.tsx` and `update.tsx` should render a shared presentation form `form.tsx`.
  - `form.tsx` is pure presentation: it only handles fields, sections, and layout grids (no data-fetching, no URL state).
  - Validation schemas originate in `create.tsx` and get reused in `update.tsx`.
  - `update.tsx` handles the detail query/data loading and hydrates the form when data arrives.
- `view.tsx` is the read-only counterpart: detail query, loading state on the shell, identical section layout to the form, but without submit actions or edit controls.

### 2.2 Multi-Step Flows & Wizards (`form/` Subfolder)
- When a flow is a multi-step wizard rather than a flat form, organize it into a `form/` subfolder:
  - `form/index.tsx`: Step orchestration and wiring.
  - `form/form-steps.tsx`: Step enumeration and definitions.
  - Step files: `*-form.tsx` and `*-summary.tsx` for each step.
  - `form/types.ts`: Local form-specific TypeScript types (values for each step, UI-only unions, intermediate wizard state).
- Keep domain/API types separate; use local `types.ts` only when describing UI-specific state not modeled by the backend API.

### 2.3 Filters (`filters.tsx`)
- Non-trivial filters live in their own sibling file: `filters.tsx` (typically a drawer bound to URL search params / state).
- The page triggers the filters drawer and displays an active filter badge when criteria are applied.
- The drawer only resets/clears the keys it owns.

### 2.4 Flat Sibling Structure
- Keep supporting feature components as siblings in the page/feature folder:
  - `filters.tsx`, `filters-mobile.tsx`, `tabs.tsx`, etc.
- Avoid prematurely creating nested `modals/` or `hooks/` subfolders unless a feature is genuinely large (e.g., complex analytics widgets, dedicated subflows).
- Reusable UI primitives live in `components/ui/`; the page folder acts as the glue orchestrating the screen.

---

## 3. Forms & Validation (Formik + Yup)

All forms across the application MUST use **Formik** for state management and **Yup** for validation schemas:

- **Yup Validation Schema**:
  - Defined in `create.tsx` using `yup.object({ ... })` and exported for reuse in `update.tsx`.
  - Every input field must have explicit validation (types, required messages, string lengths, boundaries).
- **Formik in Action Modals (`create.tsx` & `update.tsx`)**:
  - `create.tsx`: Initializes Formik with blank `initialValues`, applies `validationSchema`, and triggers creation mutation in `onSubmit`.
  - `update.tsx`: Initializes Formik with `enableReinitialize: true`, hydrates from active item/query data, applies the same `validationSchema`, and triggers update mutation in `onSubmit`.
- **Field Presentation in `form.tsx`**:
  - `form.tsx` renders fields, sections, and grids using Formik state (`values`, `errors`, `touched`, `handleChange`, `handleBlur`, `setFieldValue`).
  - Displays inline validation error messages beneath inputs when `touched[fieldName] && errors[fieldName]`.
  - Pass `hasError={Boolean(touched[fieldName] && errors[fieldName])}` to input components for visual error states.

