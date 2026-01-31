# Component Consolidation Roadmap

Prioritized plan for refactoring the Halley frontend.

---

## Executive Summary

The frontend has accumulated significant technical debt, with two components exceeding 100KB and several others in the 30-60KB range. This roadmap prioritizes extraction and consolidation work to make the codebase maintainable.

**Total Components:** 83
**Critical Size Issues:** 2 (280KB combined)
**High Priority Issues:** 2 (113KB combined)
**Estimated Refactoring Effort:** 6-8 weeks

---

## Priority Tiers

### Tier 0: Blocking Issues (Do First)

These prevent other work and should be addressed immediately.

| Task | Effort | Reason |
|------|--------|--------|
| Fix any runtime bugs | Ongoing | User-facing |
| Stabilize existing features | Ongoing | Don't regress |

### Tier 1: Critical Extractions (Week 1-3)

Giant components that are unmaintainable.

#### 1.1 PersonasDialog.tsx (116KB → ~10KB shell)

**Current State:** Monolithic dialog containing all persona functionality
**Target:** Thin shell component that coordinates sub-components

**Extraction Plan:**
```
Step 1: Extract PersonaList (~15KB)
  - Grid view of persona cards
  - Folder navigation
  - Create new button
  
Step 2: Extract PersonaCreateWizard (~20KB)
  - Archetype selection step
  - Basic info step
  - Generation step
  - Preview step
  
Step 3: Extract PersonaEditor (~30KB)
  - Tab container
  - Header with back button
  - Auto-save logic
  
Step 4: Extract Tab Components (~40KB total)
  - BodyTab.tsx (physicality editor)
  - BioTab.tsx (bio builder wrapper)
  - MemoryTab.tsx (memory management)
  - PersonalityTab.tsx (personality builder)
  - WorldTab.tsx (world selector)
  - VisualTab.tsx (visual identity)
  
Step 5: Create Shell (~10KB)
  - State coordination
  - Tab routing
  - Modal management
```

**Dependencies:** None (can start immediately)
**Risk:** High - Core functionality, needs careful testing

#### 1.2 SettingsTabs.tsx (167KB → ~7KB shell)

**Current State:** All app settings in one file
**Target:** Settings router with modular setting panels

**Extraction Plan:**
```
Step 1: Create settings/ directory structure
  settings/
  ├── index.ts (barrel export)
  ├── SettingsLayout.tsx (tab navigation)
  ├── GeneralSettings.tsx
  ├── ModelSettings.tsx
  ├── AppearanceSettings.tsx
  ├── StorageSettings.tsx
  ├── PrivacySettings.tsx
  ├── BackupSettings.tsx (may already exist)
  ├── AdvancedSettings.tsx
  └── DeveloperSettings.tsx
  
Step 2: Extract one section at a time
  - Start with smallest (General)
  - Move API calls with component
  - Test each extraction
  
Step 3: Reduce SettingsTabs to router
  - Import all settings components
  - Tab switching logic only
  - No direct settings code
```

**Dependencies:** None (can start immediately)
**Risk:** Medium - Less interconnected than PersonasDialog

---

### Tier 2: High Priority Extractions (Week 3-4)

Large components that should be split but aren't blocking.

#### 2.1 ImageGenerationSettings.tsx (60KB)

**Split by concern:**
```
ImageGenerationSettings/
├── index.tsx (coordinator)
├── ModelSelector.tsx
├── PromptBuilder.tsx
├── ParameterControls.tsx
├── PreviewPanel.tsx
├── QueueManagement.tsx
└── AdvancedOptions.tsx
```

#### 2.2 ScenarioBuilder.tsx (53KB)

**Split by wizard step:**
```
ScenarioBuilder/
├── index.tsx (wizard coordinator)
├── ScenarioTypeStep.tsx
├── SettingStep.tsx
├── CharactersStep.tsx
├── DetailsStep.tsx
├── PreviewStep.tsx
└── hooks/useScenarioBuilder.ts
```

---

### Tier 3: Medium Priority (Week 5-6)

Components that would benefit from splitting.

| Component | Size | Suggested Split |
|-----------|------|-----------------|
| `SidePanel.tsx` | 39KB | Split by panel type (chat info, generation, etc.) |
| `Onboarding.tsx` | 37KB | Extract each onboarding step |
| `StoryTab.tsx` | 28KB | Separate story editor from generation UI |
| `BackupSettings.tsx` | 26KB | Already extracted, may need sub-components |

---

### Tier 4: Consolidation (Week 6-7)

Merge similar components and create shared patterns.

#### 4.1 Modal Consolidation

**Current:** 5+ similar modal components
**Target:** Single reusable pattern

```tsx
// Before: Multiple similar files
DeletePersonaModal.tsx
ResetAppModal.tsx  
FormatHelpDialog.tsx
RevertConfirmDialog.tsx
confirm-dialog.tsx

// After: Unified pattern
ui/confirm-dialog.tsx (enhanced)
↳ Supports: confirm, alert, info variants
↳ Configurable: icon, title, description, actions
↳ Accessible: focus trap, keyboard nav
```

#### 4.2 Progress Indicator Consolidation

**Current:** 4 progress/loading components
**Target:** Unified progress system

```tsx
// Before
TypingIndicator.tsx
OptimizationProgress.tsx
OptimizationToast.tsx
BackgroundTaskIndicator.tsx

// After
ui/progress-indicator.tsx (variants: spinner, bar, dots)
ui/progress-toast.tsx (toast-style progress)
hooks/useBackgroundTask.ts (shared state)
```

#### 4.3 Image Component Consolidation

**Current:** 4 image-related components
**Target:** Image component system

```tsx
// Before
GeneratedImage.tsx
ImageLightbox.tsx
ImageViewerPanel.tsx
PendingImagesPreview.tsx

// After
image/
├── Image.tsx (base display)
├── ImageLightbox.tsx (zoom modal)
├── ImageGallery.tsx (multiple images)
├── ImageUpload.tsx (upload handling)
└── hooks/useImagePreview.ts
```

---

### Tier 5: Base Component Expansion (Week 7-8)

Add missing shadcn/ui components.

#### High Priority Additions

| Component | Effort | Use Cases |
|-----------|--------|-----------|
| `select.tsx` | Low | Replace native selects |
| `checkbox.tsx` | Low | Settings, filters |
| `switch.tsx` | Low | Toggle settings |
| `avatar.tsx` | Low | Personas, users |
| `tooltip.tsx` | Low | Help text everywhere |
| `toast.tsx` | Medium | Notifications |

#### Medium Priority Additions

| Component | Effort | Use Cases |
|-----------|--------|-----------|
| `alert.tsx` | Low | Inline warnings |
| `skeleton.tsx` | Low | Loading states |
| `separator.tsx` | Low | Visual dividers |
| `scroll-area.tsx` | Medium | Long lists |
| `radio-group.tsx` | Low | Single selection |
| `accordion.tsx` | Medium | Collapsible sections |

---

## Pattern Standardization

### State Management Pattern

**Current Problem:** Mix of local state, props, and stores
**Solution:** Establish clear patterns

```tsx
// Pattern 1: Local UI State (component-specific)
const [isOpen, setIsOpen] = useState(false)

// Pattern 2: Form State (react-hook-form or local)
const { register, handleSubmit } = useForm<FormData>()

// Pattern 3: Server State (API data with caching)
const { data, isLoading } = useQuery(['personas'], fetchPersonas)

// Pattern 4: Global UI State (zustand)
const { sidebarOpen, setSidebarOpen } = useUIStore()

// Pattern 5: Global App State (zustand)
const { currentPersona } = usePersonaStore()
```

### API Call Pattern

**Current Problem:** Mix of fetch() and api.ts
**Solution:** All API calls through api.ts

```tsx
// ❌ Avoid: Direct fetch
const response = await fetch('/api/personas')

// ✅ Prefer: api.ts methods
const response = await api.getPersonas()

// ✅ Future: React Query wrapper
const { data } = usePersonas()
```

### Component File Pattern

**Standard structure for extracted components:**

```
ComponentName/
├── index.tsx           # Main export
├── ComponentName.tsx   # Primary component
├── SubComponent.tsx    # Sub-components (if needed)
├── hooks.ts            # Component-specific hooks
├── types.ts            # TypeScript types
└── utils.ts            # Helper functions
```

---

## Testing Strategy

### During Extraction

1. **Before touching code:**
   - Document current behavior
   - Note all API calls
   - Screenshot current UI

2. **After each extraction:**
   - Verify same visual appearance
   - Test all interactions
   - Check API calls still work
   - Test edge cases (empty states, errors)

3. **Regression suite:**
   - Add Playwright tests for critical flows
   - Persona creation flow
   - Settings changes
   - Chat functionality

---

## Risk Mitigation

### High-Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| PersonasDialog | Breaks persona editing | Extract one tab at a time, test each |
| SettingsTabs | Settings don't save | Verify API calls preserved |
| Auto-save logic | Data loss | Keep save logic centralized |
| State sharing | Props don't flow | Use context or stores for shared state |

### Rollback Strategy

- Git branch per extraction
- Feature flags for new components
- Keep old components until verified
- Document all changes in PR

---

## Success Metrics

### Code Quality
- [ ] No component > 500 lines
- [ ] All components TypeScript strict
- [ ] No eslint warnings
- [ ] Consistent file structure

### Performance
- [ ] No increase in bundle size
- [ ] No increase in render time
- [ ] Lazy loading for heavy components

### Maintainability
- [ ] Clear component responsibilities
- [ ] Documented API for each component
- [ ] Storybook or ComponentLibrary updated

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | PersonasDialog extraction start | PersonaList, PersonaCreateWizard |
| 2 | PersonasDialog extraction finish | PersonaEditor, all tabs |
| 3 | SettingsTabs extraction | All settings modules |
| 4 | High priority splits | ImageGen, Scenario |
| 5 | Medium priority splits | SidePanel, Onboarding |
| 6 | Consolidation | Modals, Progress, Images |
| 7 | Base components | shadcn additions |
| 8 | Polish & testing | Documentation, fixes |

---

## Dependencies & Prerequisites

### Before Starting
- [ ] Design token system defined (CSS_ARCHITECTURE.md)
- [ ] Component patterns documented
- [ ] Testing strategy agreed
- [ ] PR review process established

### Tooling Needed
- [ ] ESLint rules for file size
- [ ] Import organization rules
- [ ] Component documentation template
- [ ] Playwright test framework
