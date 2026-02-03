# Repo Limit Enforcement: Active Project Slots

## Problem Statement
CoDRAG's pricing model relies on limiting the number of **active repositories** for Free (1 repo) and Starter (3 repos) tiers. 
Users can easily bypass this by running `codrag mcp` in multiple separate terminal windows or projects, as the MCP shim is stateless and doesn't require login.

## Solution: Centralized "Active Slots"
Instead of counting "installed" projects, we enforce limits on **concurrently active** projects at the daemon level. 
The daemon maintains a global registry of all projects on the machine (`~/.local/share/codrag/registry.db`).

### 1. The "Active" Flag
We add an `active` boolean column to the `projects` table in the registry.

- **Free Tier:** Max 1 project can have `active=true`.
- **Starter Tier:** Max 3 projects can have `active=true`.
- **Pro Tier:** Unlimited.

### 2. Behavior
- **Default State:** New projects are added as `active=true` if under the limit. If over limit, they are added as `active=false`.
- **Activation:** User must explicitly "Activate" a project (via UI or CLI) if they want to use it.
- **Deactivation:** If the limit is reached, the user must "Deactivate" an existing project to free up a slot.
- **Enforcement:**
    - Any API call to `/projects/{id}/build`, `/projects/{id}/search`, `/projects/{id}/context` for an **inactive** project returns `403 FORBIDDEN` (Code: `PROJECT_INACTIVE`).
    - The MCP server receives this error and displays a user-friendly message: *"Project is inactive. Upgrade to Starter/Pro or deactivate another project to use this one."*

### 3. Database Schema Update
```sql
ALTER TABLE projects ADD COLUMN is_active BOOLEAN DEFAULT 0;
-- Migration: Set existing projects to active up to the limit
```

### 4. API Endpoints
- `POST /projects/{id}/activate`: Sets `is_active=true`. Fails if limit exceeded.
- `POST /projects/{id}/deactivate`: Sets `is_active=false`. Always succeeds.

### 5. Why this works without login
- The enforcement happens in the **local daemon**, which has a global view of all projects on the machine.
- It doesn't matter if you run `codrag mcp` in 10 different terminals; they all talk to the same daemon.
- The daemon checks the `registry.db` and rejects requests for inactive projects.
- The user is forced to make a **conscious choice** about which projects are "hot," preventing abuse while maintaining a friction-free local experience.

## UX Implications
- **Dashboard:** Shows "Active: 1/3" counter. Inactive projects are grayed out or have an "Activate" button.
- **CLI:** `codrag list` shows active status. `codrag active <id>` command.
- **MCP:** Tool calls for inactive projects fail gracefully with instructions.

## Implementation Tasks
1.  **DB Migration:** Add `is_active` column to `ProjectRegistry`.
2.  **Logic:** Update `activate_project` method to check license tier and current count.
3.  **API:** Add activate/deactivate endpoints.
4.  **Middleware/Decorator:** Add `@require_active` check to core project routes.
5.  **UI:** Update Dashboard to reflect active/inactive state and provide toggle controls.
