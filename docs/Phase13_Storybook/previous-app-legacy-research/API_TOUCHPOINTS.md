# API Touchpoints

Mapping frontend components to backend API endpoints.

---

## Overview

This document maps each frontend component to its backend dependencies, helping understand the full-stack implications of component refactoring.

---

## Backend API Structure

### Route Files

| File | Prefix | Domain |
|------|--------|--------|
| `halley/api/app.py` | `/api/` | Core routes (legacy) |
| `halley_core/api/persona_routes.py` | `/api/structured/` | Persona CRUD |
| `halley_core/api/routes/worlds.py` | `/api/` | World management |
| `halley_core/api/routes/user_profile.py` | `/api/user/` | User identity |

---

## Component → API Mapping

### Chat Components

#### ChatPanel.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/conversations` | GET | List conversations |
| `/api/conversations/{id}` | GET | Load conversation |
| `/api/chat` | POST | Send message |
| `/api/temporal/stream` | GET (SSE) | Streaming response |

#### ChatInput.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Send message |
| `/api/chat/image` | POST | Send with image |

#### ChatSidebar.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/conversations` | GET | List conversations |
| `/api/conversations/{id}` | DELETE | Delete conversation |

#### ChatHeader.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/personas/{id}` | GET | Persona info |
| `/api/personas/{id}/avatar` | GET | Avatar image |

---

### Persona Components

#### PersonasDialog.tsx (CRITICAL - 15+ endpoints)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/personas` | GET | List personas |
| `/api/personas` | POST | Create persona |
| `/api/personas/{id}` | GET | Load persona |
| `/api/personas/{id}` | PUT | Update persona |
| `/api/personas/{id}` | DELETE | Delete persona |
| `/api/personas/{id}/avatar` | GET | Get avatar |
| `/api/personas/{id}/avatar` | POST | Upload avatar |
| `/api/structured/personas/{id}` | GET | Structured data |
| `/api/structured/personas/{id}` | PUT | Save structured |
| `/api/structured/personas/{id}/builder-state` | GET/PUT | Builder state |
| `/api/personas/{id}/personality` | GET/PUT | Personality |
| `/api/personas/{id}/visual-descriptor` | GET/POST | Visual descriptor |
| `/api/personas/{id}/world-settings` | GET/PUT | World settings |
| `/api/personas/{id}/knowledge-weights` | GET/PUT | Knowledge |
| `/api/persona-folders` | GET/POST/PUT/DELETE | Folders |

**Refactoring Note:** When extracting tabs, move relevant API calls with each component.

#### BioBuilder.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/structured/personas/{id}/bio` | POST | Generate bio |

#### PersonalityBuilder.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/personas/{id}/personality` | GET | Load personality |
| `/api/personas/{id}/personality` | PUT | Save personality |

#### VisualIdentity.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/personas/{id}/avatar` | GET/POST | Avatar |
| `/api/personas/{id}/visual-descriptor` | GET/POST | Descriptor |
| `/api/personas/{id}/visual-descriptor/generate` | POST | Generate |

---

### World Components

#### WorldsTab.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/worlds` | GET | List worlds |
| `/api/worlds` | POST | Create world |
| `/api/worlds/{id}` | GET | Load world |
| `/api/worlds/{id}` | PUT | Update world |
| `/api/worlds/{id}` | DELETE | Delete world |
| `/api/worlds/generate` | POST | Generate world |

#### WorldSelectorTab.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/worlds` | GET | List worlds |
| `/api/personas/{id}/world-settings` | GET | Load settings |
| `/api/personas/{id}/world-settings` | PUT | Save settings |

---

### Settings Components

#### SettingsTabs.tsx (CRITICAL - 10+ endpoints)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/settings/onboarding/status` | GET/PUT | Onboarding |
| `/api/settings/real-places` | GET/PUT | Location settings |
| `/api/settings/ui-preferences` | GET/PUT | UI prefs |
| `/api/settings/tts` | GET/PUT | TTS settings |
| `/api/settings/templates` | GET/PUT | Templates |
| `/api/models/status` | GET | Model status |
| `/api/models/config` | GET/PUT | Model config |
| `/api/backup/list` | GET | List backups |
| `/api/backup/create` | POST | Create backup |
| `/api/backup/restore` | POST | Restore backup |

**Refactoring Note:** Each settings section should own its API calls.

#### BackupSettings.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/backup/list` | GET | List backups |
| `/api/backup/create` | POST | Create backup |
| `/api/backup/restore` | POST | Restore backup |
| `/api/backup/delete` | DELETE | Delete backup |
| `/api/backup/export` | GET | Export backup |

#### StorageSettings.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/storage/stats` | GET | Storage statistics |
| `/api/storage/cleanup` | POST | Cleanup storage |

---

### Memory Components

#### MemoryManagement.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/personas/{id}/memory-v2/search` | GET | Search memories |
| `/api/personas/{id}/memory-v2` | POST | Add memory |
| `/api/personas/{id}/memory-v2/{memId}` | PUT | Update memory |
| `/api/personas/{id}/memory-v2/{memId}` | DELETE | Delete memory |

#### MemoryFilter.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| (Uses parent's API calls) | - | Filtering is client-side |

---

### Image Generation Components

#### ImageGenerationSettings.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/image/status` | GET | Generation status |
| `/api/image/generate` | POST | Start generation |
| `/api/image/queue` | GET | Queue status |
| `/api/image/cancel` | POST | Cancel generation |
| `/api/image/models` | GET | Available models |

#### GeneratedImage.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/image/{id}` | GET | Fetch image |
| `/api/image/{id}/save` | POST | Save image |

---

### User Identity Components

#### UserIdentityEditor.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/profile` | GET | Load profile |
| `/api/user/profile` | PUT | Save profile |
| `/api/user/profile/user-personas` | GET | List user personas |
| `/api/user/profile/user-personas` | POST | Create user persona |
| `/api/user/profile/user-personas/{id}` | PUT | Update user persona |
| `/api/user/profile/user-personas/{id}` | DELETE | Delete user persona |

---

### System Components

#### SystemStatus.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/models/status` | GET | Model health |
| `/api/health` | GET | Backend health |
| `/api/gpu/status` | GET | GPU status |

#### BackendStatus.tsx
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Simple health check |

---

## API Pattern Analysis

### Current Patterns

#### Pattern 1: Direct Fetch (Legacy)
```tsx
// Found in older components
const response = await fetch('/api/personas')
const data = await response.json()
```
**Issues:** No error handling, no typing, no caching

#### Pattern 2: api.ts Methods (Preferred)
```tsx
// Found in newer components
const response = await api.getPersonas()
if (response.success) { ... }
```
**Benefits:** Centralized, typed, consistent error handling

#### Pattern 3: Mixed (Problematic)
```tsx
// Some components mix both
const personas = await api.getPersonas()
const settings = await fetch('/api/settings').then(r => r.json())
```
**Issue:** Inconsistent error handling

### Recommended Pattern

```tsx
// api.ts (centralized)
export const api = {
  personas: {
    list: () => fetchJson<Persona[]>('/api/personas'),
    get: (id: string) => fetchJson<Persona>(`/api/personas/${id}`),
    create: (data: CreatePersonaInput) => postJson<Persona>('/api/personas', data),
    update: (id: string, data: UpdatePersonaInput) => putJson<Persona>(`/api/personas/${id}`, data),
    delete: (id: string) => deleteJson(`/api/personas/${id}`),
  },
  worlds: {
    list: (contentLevel?: string) => fetchJson<World[]>(`/api/worlds?content_rating=${contentLevel}`),
    // ...
  },
  // ...
}

// Component usage
const { data: personas, isLoading, error } = useQuery(['personas'], api.personas.list)
```

---

## Refactoring Implications

### When Extracting PersonasDialog

Each extracted component needs its API calls moved:

| Extracted Component | API Calls to Move |
|---------------------|-------------------|
| PersonaList | list personas, folders |
| PersonaCreateWizard | create persona, generate |
| BodyTab | builder-state, visual-descriptor |
| BioTab | bio generation |
| MemoryTab | memory-v2 endpoints |
| PersonalityTab | personality endpoints |
| WorldTab | world-settings |
| VisualTab | avatar, visual-descriptor |

### When Extracting SettingsTabs

| Extracted Component | API Calls to Move |
|---------------------|-------------------|
| GeneralSettings | onboarding, ui-preferences |
| ModelSettings | models/config, models/status |
| AppearanceSettings | ui-preferences |
| StorageSettings | storage endpoints |
| BackupSettings | backup endpoints |
| PrivacySettings | (TBD) |
| AdvancedSettings | (TBD) |
| DeveloperSettings | (TBD) |

---

## API Modernization Opportunities

### 1. Add React Query / TanStack Query
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

### 2. Consolidate Duplicate Endpoints
Some functionality is duplicated:
- `/api/personas/{id}` vs `/api/structured/personas/{id}`
- Multiple ways to update persona data

### 3. Add WebSocket for Real-time
Currently using SSE for chat streaming. Consider WebSocket for:
- Background task progress
- Multi-device sync
- Real-time memory updates

### 4. GraphQL Consideration
For complex queries (PersonasDialog needs 5+ calls), GraphQL could reduce round trips.

---

## Testing Strategy

When refactoring components with API calls:

1. **Mock API in tests**
   ```tsx
   jest.mock('@/lib/api', () => ({
     api: {
       getPersonas: jest.fn().mockResolvedValue({ success: true, personas: [] })
     }
   }))
   ```

2. **Integration test with MSW**
   ```tsx
   const server = setupServer(
     rest.get('/api/personas', (req, res, ctx) => res(ctx.json({ personas: mockPersonas })))
   )
   ```

3. **E2E test critical flows**
   - Persona creation flow
   - Settings save flow
   - Chat message flow
