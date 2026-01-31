# Component Inventory

Complete catalog of all UI components in the Halley frontend.

---

## Base Components (`ui/`)

Foundational primitives - shadcn/ui style components.

| Component | Size | Purpose | Dependencies | Needs Update |
|-----------|------|---------|--------------|--------------|
| `badge.tsx` | 1.2KB | Status/tag badges | cn | ⚠️ Limited variants |
| `button.tsx` | 1.8KB | Action buttons | cn, Slot | ✅ Adequate |
| `card.tsx` | 1.9KB | Content containers | cn | ✅ Adequate |
| `collapsible.tsx` | 2.3KB | Expandable sections | Radix Collapsible | ✅ Adequate |
| `confirm-dialog.tsx` | 3.9KB | Confirmation modals | Dialog | ⚠️ Custom, not shadcn |
| `dialog.tsx` | 2.1KB | Modal dialogs | Custom (not Radix) | ❌ Needs Radix migration |
| `dropdown-menu.tsx` | 7.3KB | Dropdown menus | Radix DropdownMenu | ✅ Adequate |
| `footer-progress.tsx` | 3.4KB | Progress bar in footer | - | ⚠️ Very specific use |
| `info-tooltip.tsx` | 4.6KB | Tooltip with info icon | - | ⚠️ Custom, not shadcn |
| `input.tsx` | 0.8KB | Text inputs | cn | ✅ Adequate |
| `label.tsx` | 0.7KB | Form labels | Radix Label | ✅ Adequate |
| `progress.tsx` | 0.8KB | Progress bars | cn | ✅ Adequate |
| `sheet.tsx` | 4.2KB | Slide-out panels | Radix Dialog | ✅ Adequate |
| `slider.tsx` | 1.5KB | Range sliders | Radix Slider | ✅ Adequate |
| `tabs.tsx` | 1.9KB | Tab navigation | Radix Tabs | ✅ Adequate |
| `textarea.tsx` | 0.8KB | Multi-line text input | cn | ✅ Adequate |

### Missing Base Components
- `select.tsx` - Native select wrapper (using raw `<select>`)
- `checkbox.tsx` - Styled checkbox (using raw `<input type="checkbox">`)
- `radio.tsx` - Styled radio buttons
- `switch.tsx` - Toggle switch
- `avatar.tsx` - User/persona avatars
- `tooltip.tsx` - Standard tooltip (not info-specific)
- `toast.tsx` - Toast notifications
- `alert.tsx` - Alert/banner messages
- `skeleton.tsx` - Loading skeletons
- `separator.tsx` - Visual dividers
- `scroll-area.tsx` - Scrollable containers

---

## Chat Components (`chat/`)

Chat interface building blocks.

| Component | Size | Purpose | API Calls | State |
|-----------|------|---------|-----------|-------|
| `ChatHeader.tsx` | 10.6KB | Conversation header with persona info | persona, conversation | Local + props |
| `ChatInput.tsx` | 7.1KB | Message input with actions | send message | Local |
| `ChatMessages.tsx` | 8.2KB | Message list rendering | - | Props |
| `ChatSidebar.tsx` | 5.2KB | Conversation list sidebar | conversations | Props |
| `ImageLightbox.tsx` | 0.9KB | Image zoom/preview | - | Local |
| `PendingImagesPreview.tsx` | 1.3KB | Queued images display | - | Props |
| `RevertConfirmDialog.tsx` | 2.2KB | Message revert confirmation | revert | Props |
| `index.ts` | 0.5KB | Barrel export | - | - |

### Chat Component Observations
- Well-organized module with barrel export
- Reasonable sizes (all < 15KB)
- Clear separation of concerns
- **Model for other component groups**

---

## Personality Components (`personality/`)

Persona personality configuration tools.

| Component | Size | Purpose | Visualization | State |
|-----------|------|---------|---------------|-------|
| `ArchetypeSelector.tsx` | 14.5KB | Archetype selection UI | Cards | Local |
| `MBTIQuadrant.tsx` | 7.4KB | MBTI quadrant visualizer | SVG | Props |
| `MBTISliders.tsx` | 8.2KB | MBTI dimension sliders | Range inputs | Props |
| `PersonalityBuilder.tsx` | 16KB | Main personality editor | Composite | Local + API |
| `PersonalityTestChat.tsx` | 7.4KB | Chat-based personality test | Chat UI | Local |
| `PolarGrid.tsx` | 5.6KB | Radar chart for traits | SVG | Props |
| `index.ts` | 0.3KB | Barrel export | - | - |

### Demo Files (can be removed from production)
- `NeurodiversityWheel.svg`
- `mbti-quadrant-demo.html`
- `polar-grid-demo.html`
- `preview-neurodiversity.html`

### Personality Component Observations
- Custom SVG visualizations (good candidate for extraction)
- Demo files should move to `/docs` or be deleted
- Reasonable component sizes

---

## Personas Components (`personas/`)

Persona management UI.

| Component | Size | Purpose | Issue |
|-----------|------|---------|-------|
| `PersonasDialog.tsx` | **116KB** | Entire persona editor | ❌ **CRITICAL: Too large** |
| `index.ts` | 0.2KB | Barrel export | - |
| `MIGRATION.md` | 3KB | Migration docs | - |

### PersonasDialog Analysis
This 116KB file is the #1 refactoring priority. It contains:
- Persona list/grid view
- Persona creation wizard
- Persona editing (all tabs)
- Body builder integration
- Bio builder integration
- Memory management
- Personality builder
- World settings
- Visual identity
- And more...

**Extraction Candidates:**
1. `PersonaListView` - Grid of persona cards
2. `PersonaCreateWizard` - New persona flow
3. `PersonaEditorTabs` - Tab container
4. `PersonaBodyTab` - Body configuration
5. `PersonaBioTab` - Bio editor
6. `PersonaMemoryTab` - Memory management
7. `PersonaPersonalityTab` - Personality config
8. `PersonaWorldTab` - World settings
9. `PersonaVisualTab` - Image/visual settings

---

## Root-Level Components

Large components at `/components/` root - many need extraction.

### Critical Size Issues (>30KB)

| Component | Size | Purpose | Action Needed |
|-----------|------|---------|---------------|
| `SettingsTabs.tsx` | **167KB** | All app settings | ❌ Split into modules |
| `ImageGenerationSettings.tsx` | **60KB** | Image gen config | ❌ Split by concern |
| `ScenarioBuilder.tsx` | **53KB** | Scenario creation | ⚠️ Consider split |
| `SidePanel.tsx` | **39KB** | Right sidebar | ⚠️ Consider split |
| `Onboarding.tsx` | **37KB** | First-run wizard | ⚠️ Step extraction |
| `ComponentLibrary.tsx` | **32KB** | Dev component preview | Keep (dev tool) |
| `StoryTab.tsx` | **28KB** | Story/context editor | ⚠️ May need split |
| `BackupSettings.tsx` | **26KB** | Backup management | Review |

### Medium Components (10-30KB)

| Component | Size | Purpose | Notes |
|-----------|------|---------|-------|
| `PersonaReferenceImages.tsx` | 23KB | Reference image manager | Image handling |
| `MemoryManagement.tsx` | 22KB | Memory viewer/editor | Complex list UI |
| `UserIdentityEditor.tsx` | 21KB | "You" profile editor | Multi-section |
| `WorldsTab.tsx` | 20KB | Global worlds manager | Recently updated |
| `SystemStatus.tsx` | 20KB | System health display | Status cards |
| `VisualIdentity.tsx` | 17KB | Avatar/visual config | Image upload |
| `BioBuilder.tsx` | 17KB | Bio generation UI | AI generation |
| `StorageSettings.tsx` | 16KB | Storage config | Settings form |
| `PersonaImageOverrides.tsx` | 14KB | Per-persona images | Image management |
| `StructuredPersonaCreator.tsx` | 12KB | Structured creation | Form wizard |
| `WorldSelectorTab.tsx` | 12KB | Per-persona world | Recently fixed |
| `EmotionalState.tsx` | 11KB | Emotion display | Visualization |
| `ChatPanel.tsx` | 11KB | Chat container | Layout component |

### Small Components (<10KB) ✅

| Component | Size | Purpose |
|-----------|------|---------|
| `PersonalityProfile.tsx` | 10KB | Profile summary |
| `ResetAppModal.tsx` | 9KB | Reset confirmation |
| `StructuredSceneCreator.tsx` | 9KB | Scene creation |
| `BackgroundTaskIndicator.tsx` | 8.7KB | Task progress |
| `ImageViewerPanel.tsx` | 8.5KB | Image preview |
| `PendingEdits.tsx` | 8.7KB | Edit queue display |
| `MemoryImportance.tsx` | 7.9KB | Importance slider |
| `OptimizationProgress.tsx` | 7.4KB | Optimization UI |
| `DeletePersonaModal.tsx` | 7KB | Delete confirmation |
| `DiscoveryCard.tsx` | 6.1KB | Discovery feature |
| `FormatHelpDialog.tsx` | 5.5KB | Formatting help |
| `TypingIndicator.tsx` | 5.5KB | Typing animation |
| `MemoryFilter.tsx` | 5.4KB | Memory filters |
| `OptimizationToast.tsx` | 5KB | Toast notification |
| `SendToChat.tsx` | 4.3KB | Send action |
| `GeneratedImage.tsx` | 4.2KB | Image display |
| `MessageBlockRenderer.tsx` | 3.9KB | Message formatting |
| `SpeakButton.tsx` | 1.1KB | TTS trigger |
| `BackendStatus.tsx` | 1.1KB | Backend health |

---

## Component Purpose Categories

### Data Display
- Chat messages, Memory lists, Persona cards, Status indicators

### Data Input
- Text inputs, Sliders, Selectors, Builders

### Layout
- Panels, Tabs, Dialogs, Sidebars

### Visualization
- Charts, Graphs, Progress bars, Avatars

### Feedback
- Toasts, Loading states, Error displays

### Navigation
- Tabs, Menus, Breadcrumbs

---

## Duplication & Overlap Analysis

### Similar Components That Should Merge
1. **Modal Patterns**: `DeletePersonaModal`, `ResetAppModal`, `FormatHelpDialog`, `RevertConfirmDialog`
   - All are confirmation/info dialogs
   - Should use single `ConfirmDialog` base

2. **Image Handling**: `GeneratedImage`, `ImageLightbox`, `ImageViewerPanel`, `PendingImagesPreview`
   - Overlapping image display logic
   - Consider unified image component system

3. **Progress/Loading**: `OptimizationProgress`, `OptimizationToast`, `TypingIndicator`, `BackgroundTaskIndicator`
   - Various progress indicators
   - Could share animation/styling

4. **Settings Forms**: Multiple settings components with similar form patterns
   - Should use shared form components

### Code Patterns That Need Standardization
1. API call patterns (fetch vs api.ts)
2. State management (local vs store)
3. Error handling display
4. Loading state representation

---

## Next Steps

1. **Extract from Giants**: Break up 100KB+ components first
2. **Standardize Base**: Add missing shadcn components
3. **Create Patterns**: Document component patterns
4. **Merge Similar**: Consolidate duplicate functionality
