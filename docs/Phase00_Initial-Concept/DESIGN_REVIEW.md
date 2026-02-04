# Design Review: CoDRAG vs Original Prototypes

## Goal
Assess whether CoDRAG has maintained the core simplicity and feature set of the original "self_rag" and "code_index" prototypes, particularly regarding the "Core Roots" and "Folder Tree" selection workflow.

## Reference Implementations

### 1. The "Working" Prototype (`LinuxBrain/self_rag` & `halley_core`)
**Location:** `/Volumes/4TB-BAD/HumanAI/LinuxBrain/halley_core/api/routes/self_rag.py`
**Key Features:**
- **Simple Configuration:** A single `ui_config.json` stores `project_root`, `core_roots` (always indexed), and `working_roots` (task-specific).
- **Folder Discovery (`/available-roots`):**
  - Scans the `project_root`.
  - **Hardcoded Heuristics:** Explicitly looks for `Docs_Halley/Phase*` folders and specific system directories (`halley_core`, `code_index`).
  - Filters out hidden/ignored directories (`.git`, `node_modules`).
- **UI:** 
  - Simple HTML/JS embedded in the Python file (or separate dashboard).
  - Tree view allows toggling folders between "Core" (green) and "Working" (yellow).
  - Simple `Rebuild` button that sends the combined list of roots.

### 2. CoDRAG Current State
**Location:** `/Volumes/4TB-BAD/HumanAI/CoDRAG/src/codrag/server.py`
**Architecture Change:** Moved to a Multi-Project architecture (`ProjectRegistry`).

**Findings:**

#### ✅ What was preserved
- **Core/Working Roots Concept:** The `ui_config` structure still maintains `core_roots` and `working_roots`.
- **Folder Tree API:** The `/available-roots` endpoint exists and performs a similar discovery function.
- **Dashboard:** The React dashboard (`App.tsx`) implements the tree view and root toggling logic.

#### ⚠️ Issues & Complications

**1. Hardcoded Project-Specific Logic in Generic Tool**
The `available_roots` implementation in CoDRAG (lines 1787+) **copied the hardcoded paths** from the LinuxBrain prototype:
```python
# In CoDRAG/src/codrag/server.py
if docs_halley.exists():
    for item in sorted(docs_halley.iterdir()):
        if ... item.name.startswith("Phase"): ...
known = ["Docs_Halley/_MASTER_CROSSREFERENCE", "halley_core", ...]
```
**Critique:** CoDRAG is supposed to be a generic tool. Hardcoding `Docs_Halley` limits its usefulness for other projects. The discovery logic should be generic (just list subdirectories of the repo root, maybe respecting `.gitignore`).

**2. Complexity from Multi-Project Support**
- The original was "Single Repo, Single Config".
- CoDRAG introduces `ProjectRegistry` and project IDs.
- However, the `available_roots` endpoint in CoDRAG currently mixes concepts:
  - It accepts an optional `repo_root` query param.
  - Falls back to `_load_ui_config()` (global? or legacy single-mode?).
  - This creates ambiguity: Are we configuring a specific project or the global state?
- The Dashboard (`App.tsx`) has to manage `repoRoot` state and manually fetch `available-roots`. In the prototype, this was often implicitly just "the current project".

**3. "Core Roots" Definition**
- In the prototype, "Core Roots" were manually selected folders.
- In CoDRAG's `_default_ui_config`, it attempts to *auto-detect* core roots using the hardcoded list (`Docs_Halley...`). This removes user agency if they want to define their own core roots easily without editing config files, although the UI supports it.

## Recommendations

### 1. Generalize Folder Discovery
Remove `Docs_Halley` specific logic from `server.py`.
**Proposed Logic:**
- List all top-level directories in `repo_root`.
- Respect `exclude_globs` or `.gitignore`.
- Allow the user to drill down (lazy loading) if needed, or just stick to top-level for simplicity as per the original.

### 2. Simplify "Core Roots" Workflow
The distinction between "Core" (Always Index) and "Working" (Current Session) is excellent.
- Ensure the UI allows promoting any folder to "Core" easily.
- Stop auto-populating "Core" based on hardcoded `LinuxBrain` paths.

### 3. Project Context
Ensure `available-roots` is scoped to the **Project**.
- API should be: `GET /projects/{project_id}/files/tree` or `GET /projects/{project_id}/roots`.
- It should use the project's `path` as the base.

## Conclusion
CoDRAG is "on track" but suffers from **residue** from its extraction from LinuxBrain. It is still carrying specific hardcoded logic that should be cleaned up to be a truly generic tool. The Core/Working roots feature is present but risks being obfuscated by the new multi-project layer if not integrated cleanly into the Project object.
