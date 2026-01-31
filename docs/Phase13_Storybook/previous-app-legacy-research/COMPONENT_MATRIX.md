# Component Matrix

Multi-dimensional analysis grid mapping components to purposes, data flow, and refactoring needs.

---

## Dimension 1: Functional Category

### Data Display Components

| Component | Data Source | Renders | Interactivity |
|-----------|-------------|---------|---------------|
| `ChatMessages.tsx` | Props (messages[]) | Message bubbles | Click for actions |
| `MemoryManagement.tsx` | API (memories) | Memory cards | Edit, delete, filter |
| `PersonalityProfile.tsx` | Props | Profile summary | Read-only |
| `SystemStatus.tsx` | API (status) | Status cards | Refresh |
| `EmotionalState.tsx` | Props | Emotion viz | Read-only |
| `DiscoveryCard.tsx` | Props | Feature card | Click to expand |
| `BackendStatus.tsx` | API | Status badge | Read-only |
| `GeneratedImage.tsx` | Props (url) | Image | Zoom, save |

### Data Input Components

| Component | Input Type | Validation | Output |
|-----------|------------|------------|--------|
| `ChatInput.tsx` | Text + files | Length limit | Message object |
| `BioBuilder.tsx` | Text + generation | Required fields | Bio object |
| `WorldsTab.tsx` | Form fields | Concept required | World object |
| `WorldSelectorTab.tsx` | Select + text | None | Settings object |
| `UserIdentityEditor.tsx` | Multi-section form | None | User profile |
| `ScenarioBuilder.tsx` | Complex form | Multi-step | Scenario object |
| `StructuredPersonaCreator.tsx` | Wizard form | Step validation | Persona object |

### Builder/Editor Components

| Component | Subject | Capabilities | Complexity |
|-----------|---------|--------------|------------|
| `PersonasDialog.tsx` | Personas | CRUD, all tabs | ❌ Extreme |
| `SettingsTabs.tsx` | App settings | All settings | ❌ Extreme |
| `ImageGenerationSettings.tsx` | Image gen | Full config | ❌ High |
| `PersonalityBuilder.tsx` | Personality | MBTI, traits | Medium |
| `VisualIdentity.tsx` | Avatar/visuals | Upload, gen | Medium |
| `StoryTab.tsx` | Story context | Edit, generate | Medium |

### Layout Components

| Component | Layout Type | Contains | Responsive |
|-----------|-------------|----------|------------|
| `SidePanel.tsx` | Right drawer | Multi-purpose | Collapsible |
| `ChatPanel.tsx` | Main content | Chat UI | Flex |
| `ChatSidebar.tsx` | Left sidebar | Conv list | Collapsible |
| `ChatHeader.tsx` | Top bar | Persona info | Fixed |

### Feedback Components

| Component | Feedback Type | Trigger | Duration |
|-----------|---------------|---------|----------|
| `TypingIndicator.tsx` | Loading | AI responding | Until complete |
| `OptimizationToast.tsx` | Progress | Background task | Task duration |
| `OptimizationProgress.tsx` | Progress | Optimization | Task duration |
| `BackgroundTaskIndicator.tsx` | Progress | Any bg task | Task duration |

### Modal Components

| Component | Purpose | Confirmation | Destructive |
|-----------|---------|--------------|-------------|
| `DeletePersonaModal.tsx` | Confirm delete | Yes | Yes |
| `ResetAppModal.tsx` | Confirm reset | Yes | Yes |
| `FormatHelpDialog.tsx` | Info display | No | No |
| `RevertConfirmDialog.tsx` | Confirm revert | Yes | Yes |
| `confirm-dialog.tsx` | Generic confirm | Yes | Configurable |

---

## Dimension 2: Backend Integration

### API-Heavy Components

| Component | Endpoints Used | Call Frequency | Error Handling |
|-----------|----------------|----------------|----------------|
| `PersonasDialog.tsx` | 15+ endpoints | High | ⚠️ Inconsistent |
| `SettingsTabs.tsx` | 10+ endpoints | Medium | ⚠️ Inconsistent |
| `ImageGenerationSettings.tsx` | 5+ endpoints | Medium | ✅ Good |
| `MemoryManagement.tsx` | 4 endpoints | Medium | ✅ Good |
| `ChatPanel.tsx` | 3 endpoints | High | ✅ Good |
| `WorldsTab.tsx` | 4 endpoints | Low | ✅ Good |
| `SystemStatus.tsx` | 2 endpoints | Polling | ✅ Good |

### API Call Patterns

| Pattern | Components Using | Recommendation |
|---------|------------------|----------------|
| Direct fetch() | Old components | ❌ Migrate to api.ts |
| api.ts methods | New components | ✅ Standardize |
| useEffect + fetch | Most components | ⚠️ Add custom hooks |
| SWR/React Query | None | 🔮 Future consideration |

### Backend-Specific Components

| Component | Primary Backend Module | Data Type |
|-----------|------------------------|-----------|
| Chat components | `halley.api` | Messages, conversations |
| Persona components | `persona_routes.py` | Personas, settings |
| World components | `routes/worlds.py` | Worlds, world_settings |
| Image components | `vision/` | Images, generation |
| Memory components | `memory_v2/` | Memories, search |
| Settings components | Multiple | Config, preferences |

---

## Dimension 3: State Management

### Local State Only

| Component | State Complexity | Reason for Local |
|-----------|------------------|------------------|
| `ChatInput.tsx` | Low | Input field state |
| `TypingIndicator.tsx` | Low | Animation state |
| `ImageLightbox.tsx` | Low | Modal open/close |
| `FormatHelpDialog.tsx` | Low | Dialog state |
| Most ui/ components | Low | Presentational |

### Local + Props

| Component | Local State | Props | Flow Direction |
|-----------|-------------|-------|----------------|
| `ChatMessages.tsx` | Scroll position | messages | Parent → Child |
| `WorldSelectorTab.tsx` | Form fields | personaId | Bidirectional |
| `PersonalityBuilder.tsx` | Builder state | persona | Bidirectional |
| `BioBuilder.tsx` | Generation state | persona | Bidirectional |

### Store Integration

| Component | Store(s) Used | Actions Dispatched |
|-----------|---------------|-------------------|
| `ChatPanel.tsx` | chatStore | Message actions |
| `SidePanel.tsx` | chatStore | UI state |
| `PersonasDialog.tsx` | None (should use) | N/A |
| `SettingsTabs.tsx` | None (should use) | N/A |

### State Management Issues

1. **Giant components manage too much state locally**
   - PersonasDialog: 50+ useState calls
   - SettingsTabs: 30+ useState calls

2. **No shared state for related components**
   - Persona editing state not in store
   - Settings state not persisted

3. **Prop drilling in deep hierarchies**
   - Props passed 3-4 levels deep

---

## Dimension 4: Refactoring Priority

### Priority 1: Critical (100KB+)

| Component | Size | Issue | Action |
|-----------|------|-------|--------|
| `SettingsTabs.tsx` | 167KB | Unmaintainable | Split into modules |
| `PersonasDialog.tsx` | 116KB | Unmaintainable | Extract 8+ components |

### Priority 2: High (50KB+)

| Component | Size | Issue | Action |
|-----------|------|-------|--------|
| `ImageGenerationSettings.tsx` | 60KB | Too complex | Split by section |
| `ScenarioBuilder.tsx` | 53KB | Complex wizard | Extract steps |

### Priority 3: Medium (30-50KB)

| Component | Size | Issue | Action |
|-----------|------|-------|--------|
| `SidePanel.tsx` | 39KB | Multi-purpose | Split by panel type |
| `Onboarding.tsx` | 37KB | Step wizard | Extract steps |
| `ComponentLibrary.tsx` | 32KB | Dev tool | Keep (low priority) |

### Priority 4: Low (Consolidation)

| Components | Issue | Action |
|------------|-------|--------|
| Modal components (4) | Duplication | Create base modal |
| Progress components (4) | Duplication | Unify patterns |
| Image components (4) | Overlap | Create image system |

---

## Dimension 5: Visual Patterns

### Components by Visual Complexity

| Complexity | Components | Design System Needs |
|------------|------------|---------------------|
| **High** | PersonalityBuilder, ScenarioBuilder, Onboarding | Custom illustrations, complex layouts |
| **Medium** | MemoryManagement, WorldsTab, SettingsTabs | Cards, forms, lists |
| **Low** | Buttons, Inputs, Badges | Primitive tokens |

### Components with Custom Visualizations

| Component | Visualization Type | Implementation |
|-----------|-------------------|----------------|
| `MBTIQuadrant.tsx` | 2D plot | SVG |
| `PolarGrid.tsx` | Radar chart | SVG |
| `EmotionalState.tsx` | Emotion display | Custom |
| `OptimizationProgress.tsx` | Progress viz | Tailwind |

### Theme-Sensitive Components

| Component | Theme Usage | Issues |
|-----------|-------------|--------|
| All | CSS variables | ✅ Working |
| `ChatMessages.tsx` | Message bubbles | ✅ Themed |
| `PersonalityBuilder.tsx` | Charts | ⚠️ Hard-coded colors |
| SVG components | Fill/stroke | ⚠️ Need token integration |

---

## Cross-Reference Matrix

```
                    │ API │ Store │ Modal │ Form │ List │ Viz │ Size
────────────────────┼─────┼───────┼───────┼──────┼──────┼─────┼──────
PersonasDialog      │ ███ │       │  ██   │ ███  │  ██  │     │ ████
SettingsTabs        │ ██  │       │       │ ████ │  █   │     │ ████
ImageGenSettings    │ ██  │       │       │ ████ │  █   │     │ ███
ScenarioBuilder     │ █   │       │       │ ███  │      │     │ ██
ChatPanel           │ ██  │  ██   │       │  █   │  ██  │     │ █
MemoryManagement    │ ██  │       │       │  █   │ ███  │     │ █
WorldsTab           │ █   │       │       │ ██   │  ██  │     │ █
PersonalityBuilder  │ █   │       │       │ ██   │      │ ██  │ █
────────────────────┴─────┴───────┴───────┴──────┴──────┴─────┴──────
Legend: █ = Low, ██ = Medium, ███ = High, ████ = Critical
```

---

## Recommended Extraction Plan

### From PersonasDialog.tsx (116KB)

```
PersonasDialog.tsx (116KB)
├── PersonaList.tsx (~15KB)
│   └── PersonaCard.tsx (~5KB)
├── PersonaCreateWizard.tsx (~20KB)
│   ├── ArchetypeStep.tsx
│   ├── BasicInfoStep.tsx
│   └── GenerationStep.tsx
├── PersonaEditor.tsx (~30KB)
│   ├── PersonaEditorHeader.tsx
│   └── PersonaEditorTabs.tsx
├── tabs/
│   ├── BodyTab.tsx (~15KB)
│   ├── BioTab.tsx (~10KB)
│   ├── MemoryTab.tsx (~10KB)
│   ├── PersonalityTab.tsx (~8KB)
│   ├── WorldTab.tsx (~5KB)
│   └── VisualTab.tsx (~8KB)
└── PersonasDialogShell.tsx (~5KB)
```

### From SettingsTabs.tsx (167KB)

```
SettingsTabs.tsx (167KB)
├── settings/
│   ├── GeneralSettings.tsx (~20KB)
│   ├── ModelSettings.tsx (~25KB)
│   ├── AppearanceSettings.tsx (~15KB)
│   ├── StorageSettings.tsx (~20KB)
│   ├── PrivacySettings.tsx (~15KB)
│   ├── BackupSettings.tsx (~20KB)
│   ├── AdvancedSettings.tsx (~25KB)
│   └── DeveloperSettings.tsx (~20KB)
└── SettingsLayout.tsx (~7KB)
```
