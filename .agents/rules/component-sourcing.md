# Component Sourcing & Reuse Rule

Before creating any new component in this codebase:

1. **Check Upstream Template First**:
   - **Upstream Repository**: [https://github.com/Downspice/align-ui-marketing-template](https://github.com/Downspice/align-ui-marketing-template)
   - In this project, this repository is configured as the `upstream` git remote.
   - Always verify if the requested component (or an equivalent/similar one) already exists in `upstream/main`:
     ```bash
     # Check components in upstream
     git ls-tree -r --name-only upstream/main:components
     # View upstream component implementation
     git show upstream/main:components/<path-to-component>
     ```

2. **Decision Workflow**:
   - **Exact Match Exists**: If the component exists in `upstream/main`, bring it directly into the project (or port it to `components/`) instead of writing a new one.
   - **Similar / Adaptable Component Exists**: If a component with similar functionality or layout exists (e.g., widgets, charts, selectors, cards), present it to the user and confirm before adapting or creating anew.
   - **No Component Available**: If no matching or similar component exists in `upstream/main`, **ask the user explicitly for confirmation before creating a component from scratch**.

3. **Dependency & Consistency Validation**:
   - When bringing in an upstream component, check that its required UI primitives in `components/ui/` and helper utilities in `utils/` are available and clean.

4. **Pristine Components Are Strictly Read-Only**:
   - `components/ui-pristine/` is a permanent, untouched backup of the original Align UI components.
   - **NEVER edit, modify, rename, delete, or write to any file inside `components/ui-pristine/`.**
   - Application code must never import from `components/ui-pristine/`; always import from `@/components/ui/`.
   - Any modifications or customizations must take place only in `components/ui/`.
