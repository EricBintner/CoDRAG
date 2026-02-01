# Component Refactor Plan

## Overview

This document outlines the plan to reconcile:
1. **`packages/ui`** — Wireframe Storybook components (Tremor-based)
2. **`src/codrag/dashboard`** — Actual running app with monolithic `App.tsx`
3. **`docs/Phase13_Storybook/theme-examples/tremor-preview`** — Visual prototypes

## Current State

### packages/ui (Storybook)
- Wireframe components using Tremor UI
- Theme system via CSS variables (`data-codrag-theme`)
- 12 theme variations available in Storybook toolbar
- Components exist but not integrated with actual app

### src/codrag/dashboard
- Monolithic `App.tsx` (~495 lines)
- Hardcoded Tailwind classes (gray-800, blue-600, etc.)
- Lucide icons
- API calls to `/api/code-index/*`
- Functional but not componentized

## Extraction Plan

### Phase 1: Core Dashboard Components

Extract from `src/codrag/dashboard/src/App.tsx`:

| Component | Source Lines | packages/ui Path | Notes |
|-----------|--------------|------------------|-------|
| `IndexStatusCard` | 227-270 | `components/dashboard/IndexStatusCard.tsx` | Shows loaded/documents/model/built status |
| `BuildCard` | 272-299 | `components/dashboard/BuildCard.tsx` | Repo root input + build button |
| `SearchPanel` | 302-345 | `components/search/SearchPanel.tsx` | Query input, k, minScore, search button |
| `ContextOptionsPanel` | 347-425 | `components/context/ContextOptionsPanel.tsx` | k, max_chars, checkboxes |
| `SearchResultsList` | 428-453 | Already have `SearchResultRow` | Map existing component |
| `ChunkPreview` | 456-468 | Already have `ChunkViewer` | Map existing component |
| `ContextOutput` | 472-486 | Already have `ContextViewer` | Map existing component |

### Phase 2: Reconcile Existing Components

| Existing in packages/ui | Dashboard Equivalent | Action |
|------------------------|---------------------|--------|
| `StatusCard` | Index Status section | Extend props, align styling |
| `SearchInput` | Query input | Already compatible |
| `SearchResultRow` | Results list items | Add onClick selection |
| `ChunkViewer` | Chunk content panel | Already compatible |
| `ContextViewer` | Context output | Add metadata display |
| `CopyButton` | Copy context button | Already compatible |

### Phase 3: Theme Integration

1. Components should use CSS variables instead of hardcoded colors:
   ```tsx
   // Before (hardcoded)
   className="bg-gray-800 text-white"
   
   // After (theme-aware)
   className="bg-[hsl(var(--surface))] text-[hsl(var(--text))]"
   ```

2. Or use Tremor's built-in theming which respects dark mode.

3. For new components, prefer Tremor primitives (Card, Badge, Button) which already handle theming.

## App Integration Strategy

### Option A: Consume packages/ui in dashboard (Recommended)
1. Add `@codrag/ui` as dependency in `src/codrag/dashboard/package.json`
2. Import components: `import { StatusCard, SearchInput } from '@codrag/ui'`
3. Replace inline JSX with component usage
4. Theme controlled via `data-codrag-theme` attribute on root

### Option B: Shared styles only
1. Import only styles: `import '@codrag/ui/styles'`
2. Keep dashboard components inline but use CSS variables
3. Gradually migrate to shared components

## Theme Toggle in App

For runtime theme switching in the actual app:

```tsx
// In app settings or header
const [theme, setTheme] = useState<string>('a');

useEffect(() => {
  document.documentElement.setAttribute('data-codrag-theme', theme);
}, [theme]);

// Theme selector UI
<select value={theme} onChange={e => setTheme(e.target.value)}>
  <option value="a">Slate Developer</option>
  <option value="k">Deep Space</option>
  ...
</select>
```

## Priority Order

1. ✅ Theme system wired into Storybook (done)
2. ✅ Extract `IndexStatusCard` and `BuildCard` (done)
3. ✅ Extract `SearchPanel` and `ContextOptionsPanel` (done)
4. 🔲 Wire dashboard to consume `@codrag/ui`
5. 🔲 Add theme selector to app settings

## File Structure Target

```
packages/ui/src/components/
├── context/           # ContextViewer, CopyButton, CitationBlock
├── dashboard/         # IndexStatusCard, BuildCard
│   ├── IndexStatusCard.tsx  ✅
│   ├── BuildCard.tsx        ✅
│   └── index.ts
├── llm/               # LLMStatusCard, ModelCard, EndpointManager, AIModelsSettings
├── navigation/        # AppShell, Sidebar, ProjectTabs
├── patterns/          # EmptyState, LoadingState, ErrorState
├── search/            # SearchInput, SearchResultRow, ChunkViewer, SearchPanel, ContextOptionsPanel
│   ├── SearchPanel.tsx          ✅
│   ├── ContextOptionsPanel.tsx  ✅
│   └── ...
├── status/            # StatusCard, StatusBadge, BuildProgress
├── trace/             # TraceStatusCard
└── watch/             # WatchStatusIndicator
```
