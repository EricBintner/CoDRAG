# CoDRAG LLM & Model Configuration

## Overview

CoDRAG requires multiple AI models for different tasks in a tiered processing pipeline. This document specifies the model configuration system, inspired by [Halley's AI Models settings](../../../LinuxBrain/halley_core/frontend/src/components/SettingsTabs.tsx).

---

## Model Slots

CoDRAG uses **4 model slots** with distinct purposes:

| Slot | Purpose | Default Source | Required |
|------|---------|----------------|----------|
| **Embedding Model** | Vector embeddings for semantic search | `nomic-embed-text` via Ollama or HuggingFace | ✅ Yes |
| **Small Model** | Fast analysis, parsing, tagging | Ollama endpoint (e.g., `qwen3:4b`) | ⚠️ Recommended |
| **Large Model** | Complex reasoning, summaries, synthesis | Ollama endpoint (e.g., `mistral`, `qwen3:30b`) | ⚠️ Recommended |
| **CLaRa Model** | Context compression (16x) | `apple/CLaRa-7B-Instruct` via HF or endpoint | ❌ Optional |

### Tiered Processing Strategy

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. EMBEDDING MODEL (nomic-embed-text)                           │
│    - Encode query → vector                                       │
│    - Semantic search over index                                  │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SMALL MODEL (fast, 4B params)                                │
│    - Parse intent                                                │
│    - Quick relevance scoring                                     │
│    - Auto-tagging during index build                             │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. LARGE MODEL (powerful, 7B-30B+ params)                       │
│    - Per-symbol summaries (build-time)                           │
│    - Complex synthesis queries                                   │
│    - "Explain this codebase" style questions                     │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CLaRa (optional compression)                                 │
│    - Compress assembled context 16x                              │
│    - Fit more evidence in LLM context window                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Model Slot Specifications

### Slot 1: Embedding Model

**Purpose:** Generate vector embeddings for semantic search.

**Configuration Options:**
1. **Ollama Endpoint** (recommended for simplicity)
   - URL: `http://localhost:11434`
   - Model: `nomic-embed-text`
   
2. **HuggingFace Direct Download** (runs in-app with Python)
   - Repo: `nomic-ai/nomic-embed-text-v1.5`
   - One-click download button
   - Managed by CoDRAG (no external server needed)

**UI Pattern:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔢 Embedding Model                                              │
│ Vector encoding for semantic search                             │
│                                                                 │
│ ○ Use Ollama endpoint                                           │
│   Endpoint: [http://localhost:11434    ▼]                       │
│   Model:    [nomic-embed-text          ▼] [↻]                   │
│                                                                 │
│ ○ Download from HuggingFace (runs locally)                      │
│   Model: nomic-ai/nomic-embed-text-v1.5                         │
│   Status: ● Downloaded (274MB)          [Re-download]           │
│                                                                 │
│ [Test Connection]                        Active: ● Connected    │
└─────────────────────────────────────────────────────────────────┘
```

**API Contract:**
```typescript
interface EmbeddingConfig {
  source: 'ollama' | 'huggingface';
  // Ollama mode
  ollama_endpoint?: string;
  ollama_model?: string;
  // HuggingFace mode
  hf_repo_id?: string;
  hf_model_path?: string;  // Local cache path
}
```

---

### Slot 2: Small Model (Fast Analysis)

**Purpose:** Quick parsing, intent detection, auto-tagging.

**Configuration:**
- Endpoint selector (Ollama, OpenAI-compatible, Claude API)
- Model selector (populated from endpoint)

**Recommended Models:**
- `qwen3:4b-instruct` (Ollama)
- `phi-3-mini` (Ollama)
- `gpt-4o-mini` (OpenAI)

**UI Pattern:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚡ Small Model                                                   │
│ Fast analysis & parsing                                         │
│                                                                 │
│ Endpoint: [Select endpoint...         ▼]                        │
│ Model:    [Select model...            ▼] [↻]                    │
│                                                                 │
│ Status: ○ Not configured                                        │
│                                                                 │
│ [Test Connection]                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Slot 3: Large Model (Complex Reasoning)

**Purpose:** Summaries, synthesis, complex queries.

**Configuration:**
- Endpoint selector (Ollama, OpenAI-compatible, Claude API)
- Model selector (populated from endpoint)

**Recommended Models:**
- `mistral` / `mistral-nemo` (Ollama)
- `qwen3:30b-instruct` (Ollama)
- `deepseek-coder-v2` (Ollama)
- `gpt-4o` (OpenAI)
- `claude-3-5-sonnet` (Anthropic)

**UI Pattern:** Same as Small Model, different slot.

---

### Slot 4: CLaRa (Context Compression)

**Purpose:** 16x context compression for fitting more evidence in prompts.

**Configuration Options:**
1. **HuggingFace Direct Download** (runs in-app)
   - Repo: `apple/CLaRa-7B-Instruct`
   - Requires ~14GB VRAM (fp16) or unified memory
   - One-click download + auto-quantization
   
2. **Remote CLaRa Server** (runs on another machine)
   - URL: `http://192.168.x.x:8765`
   - Leverages existing [CLaRa-Remembers-It-All](../../../CLaRa-Remembers-It-All/) deployment

**UI Pattern:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🗜️ CLaRa (Context Compression)                                  │
│ Apple's 16x semantic compression                                │
│                                                                 │
│ ○ Download from HuggingFace (runs locally)                      │
│   Model: apple/CLaRa-7B-Instruct                                │
│   Status: ○ Not downloaded              [Download ~14GB]        │
│   Requirements: 14GB+ VRAM or unified memory                    │
│                                                                 │
│ ○ Use remote CLaRa server                                       │
│   URL: [http://192.168.1.x:8765        ]                        │
│   [Test Connection]  Status: ○ Not connected                    │
│                                                                 │
│ ☐ Enable compression (applies to context assembly)              │
└─────────────────────────────────────────────────────────────────┘
```

**Integration with CLaRa-Remembers-It-All:**
- CoDRAG can embed CLaRa server code directly (same Python dependencies)
- Or connect to standalone CLaRa server via HTTP
- Same API contract: `POST /compress` with `{memories: string[], query: string}`

---

## Endpoint Configuration

### Saved Endpoints

Users can save multiple endpoints for reuse across model slots.

**Supported Provider Types:**
| Provider | URL Pattern | Auth | Notes |
|----------|-------------|------|-------|
| `ollama` | `http://localhost:11434` | None | Local Ollama server |
| `openai` | `https://api.openai.com/v1` | API Key | OpenAI models |
| `openai-compatible` | Custom URL | API Key | LocalAI, vLLM, etc. |
| `anthropic` | `https://api.anthropic.com` | API Key | Claude models (BYOK) |

**UI Pattern:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔌 Saved Endpoints                                              │
│ Add endpoints for local or remote LLM servers                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ GPU Server (Ollama)                                         │ │
│ │ http://192.168.1.100:11434                    [Edit] [🗑️]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ OpenAI                                                      │ │
│ │ https://api.openai.com/v1                    [Edit] [🗑️]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ + Add Endpoint                                                  │
│                                                                 │
│ Display Name:   [Local GPU Server            ]                  │
│ Provider Type:  [Ollama                    ▼]                   │
│ Endpoint URL:   [http://localhost:11434      ]                  │
│ API Key:        [••••••••••••••••••••••••••••] (if needed)      │
│                                                                 │
│ [Test Connection]  [Save Endpoint]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Config Schema

```typescript
interface LLMConfig {
  // Embedding model
  embedding: {
    source: 'ollama' | 'huggingface';
    ollama_endpoint?: string;
    ollama_model?: string;
    hf_repo_id?: string;
    hf_downloaded?: boolean;
    hf_model_path?: string;
  };
  
  // Small model (fast)
  small_model: {
    enabled: boolean;
    endpoint_id?: string;  // Reference to saved endpoint
    model?: string;
  };
  
  // Large model (powerful)
  large_model: {
    enabled: boolean;
    endpoint_id?: string;
    model?: string;
  };
  
  // CLaRa compression
  clara: {
    enabled: boolean;
    source: 'huggingface' | 'remote';
    hf_downloaded?: boolean;
    hf_model_path?: string;
    remote_url?: string;
  };
  
  // Saved endpoints
  saved_endpoints: Array<{
    id: string;
    name: string;
    provider: 'ollama' | 'openai' | 'openai-compatible' | 'anthropic';
    url: string;
    api_key?: string;  // Encrypted at rest
  }>;
}
```

### Storage Location

```
~/.local/share/codrag/
├── config.yaml           # Global config including LLM settings
├── models/               # Downloaded HF models
│   ├── nomic-embed-text/
│   └── clara-7b/
└── ...
```

---

## Backend API

### Endpoints

```
GET  /llm/config                    Get current LLM configuration
POST /llm/config                    Update LLM configuration

GET  /llm/endpoints                 List saved endpoints
POST /llm/endpoints                 Add new endpoint
PUT  /llm/endpoints/{id}            Update endpoint
DELETE /llm/endpoints/{id}          Delete endpoint

POST /llm/endpoints/{id}/test       Test endpoint connection
GET  /llm/endpoints/{id}/models     List available models at endpoint

POST /llm/embedding/test            Test embedding model
POST /llm/small/test                Test small model
POST /llm/large/test                Test large model
POST /llm/clara/test                Test CLaRa connection

POST /llm/hf/download               Start HuggingFace model download
GET  /llm/hf/download/status        Get download progress
POST /llm/hf/delete                 Delete downloaded model
```

### HuggingFace Download Flow

```
User clicks [Download]
    │
    ▼
POST /llm/hf/download
{
  "model_type": "embedding" | "clara",
  "repo_id": "nomic-ai/nomic-embed-text-v1.5"
}
    │
    ▼
Server starts background download
Returns: { "download_id": "abc123" }
    │
    ▼
Frontend polls GET /llm/hf/download/status?id=abc123
Returns: { "progress": 0.45, "status": "downloading", "bytes_downloaded": "1.2GB" }
    │
    ▼
When complete:
{ "progress": 1.0, "status": "complete", "model_path": "~/.local/share/codrag/models/nomic-embed-text" }
```

---

## UI Implementation

### Settings Page Structure

```
Settings
├── General
├── Projects
├── AI Models  ◀── NEW TAB
│   ├── Embedding Model card
│   ├── Small Model card
│   ├── Large Model card
│   ├── CLaRa card
│   └── Saved Endpoints section
└── Advanced
```

### Component Hierarchy

```
AIModelsSettings
├── ModelCard (reusable)
│   ├── EndpointSelector
│   ├── ModelSelector
│   ├── HFDownloadButton (optional)
│   ├── TestConnectionButton
│   └── StatusBadge
├── ClaraCard (specialized)
│   ├── HFDownloadSection
│   ├── RemoteServerSection
│   └── EnableToggle
└── SavedEndpointsSection
    ├── EndpointList
    └── AddEndpointForm
```

### Reusable Components

**ModelCard Props:**
```typescript
interface ModelCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  
  // Endpoint mode
  endpoint?: string;
  endpointOptions: Endpoint[];
  onEndpointChange: (endpoint: string) => void;
  
  // Model selection
  model?: string;
  modelOptions: string[];
  onModelChange: (model: string) => void;
  onRefreshModels: () => void;
  loadingModels?: boolean;
  
  // HuggingFace mode (optional)
  hfDownloadEnabled?: boolean;
  hfRepoId?: string;
  hfDownloaded?: boolean;
  hfDownloadProgress?: number;
  onHFDownload?: () => void;
  
  // Status
  status: 'connected' | 'disconnected' | 'not-configured';
  onTest: () => void;
  testResult?: { success: boolean; message: string };
}
```

---

## Open Questions

1. **API Key Storage:** Encrypt at rest? Use system keychain?
2. **Model Download Location:** Global or per-project?
3. **Ollama Auto-Detect:** Should we auto-discover Ollama at localhost:11434?
4. **Default Models:** Should onboarding pre-select recommended models?

---

## Implementation Priority

| Priority | Task |
|----------|------|
| P0 | Embedding model config (required for core function) |
| P1 | Endpoint management UI |
| P1 | Small/Large model config |
| P2 | HuggingFace download for embeddings |
| P2 | CLaRa integration |
| P3 | Claude/OpenAI BYOK support |

---

## Related Documents

- `README.md` — Phase 04 overview
- `TRACEABILITY_AUTOMATION_STRATEGY.md` — How LLMs are used in trace augmentation
- `../../ARCHITECTURE.md` — Overall CoDRAG architecture
- `../../../CLaRa-Remembers-It-All/README.md` — CLaRa server reference implementation
