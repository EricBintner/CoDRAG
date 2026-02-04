import { useState, useEffect, useCallback, useMemo } from 'react'
import { Database, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import {
  IndexStatusCard,
  BuildCard,
  SearchPanel,
  ContextOptionsPanel,
  SearchResultsList,
  ChunkPreview,
  ContextOutput,
  CopyButton,
  FolderTree,
  ProjectSettingsPanel,
  AIModelsSettings,
  ModularDashboard,
  LLMStatusWidget,
  type SearchResult,
  type ContextMeta,
  type TreeNode as UiTreeNode,
  type FileStatus,
  type ProjectConfig,
  type LLMConfig,
  type SavedEndpoint,
  type EndpointTestResult,
  PANEL_REGISTRY
} from '@codrag/ui'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const API_BASE = '/api/code-index'

// Local types that extend or map to UI types if needed
interface UiConfig {
  repo_root: string
  core_roots: string[]
  working_roots: string[]
  include_globs: string[]
  exclude_globs: string[]
  max_file_bytes: number
  ollama_url: string | null
  model: string | null
  llm_config?: LLMConfig
  trace?: { enabled: boolean }
  auto_rebuild?: { enabled: boolean; debounce_ms?: number }
}

interface ContextStructuredResponse {
  context: string
  chunks: { source_path: string; section: string; score: number; truncated: boolean }[]
  total_chars: number
  estimated_tokens: number
  meta?: unknown
}

 type ApiEnvelope<T> = { success: boolean; data: T | null; error: { code: string; message: string; hint?: string } | null }

 interface LegacyStatusResponse {
   index: {
     loaded?: boolean
     index_dir?: string
     model?: string
     built_at?: string
     total_documents?: number
     embedding_dim?: number
   }
   building: boolean
   last_error: string | null
 }

interface McpConfigResponse {
  daemon_url: string
  file: string
  path_hint: string
  config: unknown
}

// Internal tree node for building the hierarchy before converting to UI props
interface InternalTreeNode {
  name: string
  key: string
  children: InternalTreeNode[]
  isLeaf: boolean
}

function buildInternalTree(roots: string[]): InternalTreeNode {
  const root: InternalTreeNode = {
    name: '(root)',
    key: '',
    children: [],
    isLeaf: false,
  }

  for (const full of roots) {
    const parts = String(full).split('/').filter(Boolean)
    let node = root
    let curKey = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      curKey = curKey ? `${curKey}/${part}` : part
      let child = node.children.find((c) => c.name === part)
      if (!child) {
        child = {
          name: part,
          key: curKey,
          children: [],
          isLeaf: false,
        }
        node.children.push(child)
      }
      node = child
    }
    node.isLeaf = true
  }

  const sortTree = (n: InternalTreeNode) => {
    n.children.sort((a, b) => a.name.localeCompare(b.name))
    n.children.forEach(sortTree)
  }
  sortTree(root)

  return root
}

function convertToUiTree(
  node: InternalTreeNode, 
  coreRoots: Set<string>, 
  workingRoots: Set<string>
): UiTreeNode {
  let status: FileStatus | undefined = undefined
  if (coreRoots.has(node.key)) status = 'indexed'
  else if (workingRoots.has(node.key)) status = 'pending'

  return {
    name: node.name,
    type: node.children.length > 0 ? 'folder' : 'file', // Simple heuristic
    status,
    children: node.children.map(child => convertToUiTree(child, coreRoots, workingRoots)),
    // We don't have chunk count readily available in roots list for folders, 
    // but could be added if availableRoots returned metadata
  }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<LegacyStatusResponse | null>(null)

  const [uiMode, setUiMode] = useState<'light' | 'dark'>('light')
  const [uiTheme, setUiTheme] = useState<string>('none')

  const [repoRoot, setRepoRoot] = useState<string>('')
  const [coreRoots, setCoreRoots] = useState<string[]>([])
  const [workingRoots, setWorkingRoots] = useState<string[]>([])
  const [coreRootsText, setCoreRootsText] = useState<string>('')

  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    include_globs: ['**/*.md', '**/*.py', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.json'],
    exclude_globs: ['**/.git/**', '**/node_modules/**', '**/__pycache__/**', '**/.venv/**', '**/dist/**', '**/build/**', '**/.next/**'],
    max_file_bytes: 400_000,
    trace: { enabled: false },
    auto_rebuild: { enabled: false, debounce_ms: 5000 },
  })

  const [configDirty, setConfigDirty] = useState(false)

  const [query, setQuery] = useState<string>('')
  const [searchK, setSearchK] = useState<number>(8)
  const [minScore, setMinScore] = useState<number>(0.15)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedChunk, setSelectedChunk] = useState<SearchResult | null>(null)

  const [contextK, setContextK] = useState<number>(5)
  const [contextMaxChars, setContextMaxChars] = useState<number>(6000)
  const [contextIncludeSources, setContextIncludeSources] = useState<boolean>(true)
  const [contextIncludeScores, setContextIncludeScores] = useState<boolean>(false)
  const [contextStructured, setContextStructured] = useState<boolean>(false)
  const [context, setContext] = useState<string>('')
  const [contextMeta, setContextMeta] = useState<ContextMeta | null>(null)

  const [buildLoading, setBuildLoading] = useState(false)

  const [availableRoots, setAvailableRoots] = useState<string[]>([])
  const [rootsFilter, setRootsFilter] = useState<string>('')
  const [includedPaths, setIncludedPaths] = useState<Set<string>>(new Set())

  const [mcpIde, setMcpIde] = useState<'cursor' | 'windsurf' | 'vscode' | 'jetbrains' | 'claude'>('cursor')
  const [mcpMode, setMcpMode] = useState<'direct' | 'auto' | 'project'>('auto')
  const [mcpProjectId, setMcpProjectId] = useState<string>('')
  const [mcpConfigLoading, setMcpConfigLoading] = useState(false)
  const [mcpConfigError, setMcpConfigError] = useState<string | null>(null)
  const [mcpConfig, setMcpConfig] = useState<McpConfigResponse | null>(null)

  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    saved_endpoints: [
      { id: 'default_ollama', name: 'Default Ollama', provider: 'ollama', url: 'http://localhost:11434' },
    ],
    embedding: { source: 'endpoint', endpoint_id: 'default_ollama', model: 'nomic-embed-text' },
    small_model: { enabled: false, endpoint_id: 'default_ollama', model: 'qwen2.5:3b' },
    large_model: { enabled: false, endpoint_id: 'default_ollama', model: 'mistral-nemo' },
    clara: { enabled: false, source: 'huggingface', remote_url: undefined },
  })

  const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({})
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({})
  const [testingSlot, setTestingSlot] = useState<'embedding' | 'small' | 'large' | 'clara' | null>(null)
  const [testResults, setTestResults] = useState<Record<string, EndpointTestResult>>({})

  const safePreview = useCallback((s: string) => {
    const t = String(s || '').trim()
    if (!t) return ''
    return t.length > 320 ? `${t.slice(0, 320)}…` : t
  }, [])

  const parseMaybeEnvelope = useCallback(async <T,>(resp: Response): Promise<T> => {
    const json = (await resp.json()) as unknown
    if (json && typeof json === 'object' && 'success' in (json as any) && 'data' in (json as any)) {
      const env = json as ApiEnvelope<T>
      if (!env.success || env.data == null) {
        const msg = env.error?.message || 'Request failed'
        throw new Error(msg)
      }
      return env.data
    }
    return json as T
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/status`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await parseMaybeEnvelope<LegacyStatusResponse>(r)
      setStatus(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status')
    }
  }, [parseMaybeEnvelope])

  const fetchAvailableRoots = useCallback(async () => {
    if (!repoRoot.trim()) return
    try {
      const r = await fetch(`${API_BASE}/available-roots?repo_root=${encodeURIComponent(repoRoot.trim())}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await parseMaybeEnvelope<{ roots: string[] }>(r)
      setAvailableRoots(Array.isArray(data.roots) ? data.roots : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch roots')
    }
  }, [parseMaybeEnvelope, repoRoot])

  const fetchMcpConfig = useCallback(async () => {
    setMcpConfigLoading(true)
    setMcpConfigError(null)
    try {
      const params = new URLSearchParams({
        ide: mcpIde,
        mode: mcpMode,
      })
      if (mcpMode === 'project') params.set('project_id', mcpProjectId.trim())

      const r = await fetch(`${API_BASE}/mcp-config?${params.toString()}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await parseMaybeEnvelope<McpConfigResponse>(r)
      setMcpConfig(data)
    } catch (e) {
      setMcpConfig(null)
      setMcpConfigError(e instanceof Error ? e.message : 'Failed to fetch MCP config')
    } finally {
      setMcpConfigLoading(false)
    }
  }, [mcpIde, mcpMode, mcpProjectId, parseMaybeEnvelope])

  const saveAdvancedConfig = useCallback(async () => {
    try {
      const parsedCoreRoots = coreRootsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      const body: Partial<UiConfig> = {
        repo_root: repoRoot,
        core_roots: parsedCoreRoots,
        working_roots: workingRoots,
        include_globs: projectConfig.include_globs,
        exclude_globs: projectConfig.exclude_globs,
        max_file_bytes: projectConfig.max_file_bytes,
        trace: projectConfig.trace,
        auto_rebuild: projectConfig.auto_rebuild,
        llm_config: llmConfig,
      }

      const r = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!r.ok) {
        const msg = await r.text()
        throw new Error(msg || `HTTP ${r.status}`)
      }
      const cfg = await parseMaybeEnvelope<UiConfig>(r)
      setRepoRoot(String(cfg.repo_root || ''))
      setCoreRoots(Array.isArray(cfg.core_roots) ? cfg.core_roots : [])
      setWorkingRoots(Array.isArray(cfg.working_roots) ? cfg.working_roots : [])
      setCoreRootsText((Array.isArray(cfg.core_roots) ? cfg.core_roots : []).join('\n'))
      if (cfg.llm_config) setLLMConfig(cfg.llm_config)
      setConfigDirty(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config')
    }
  }, [coreRootsText, llmConfig, parseMaybeEnvelope, projectConfig, repoRoot, workingRoots])

  const handleProjectConfigChange = useCallback((cfg: ProjectConfig) => {
    setProjectConfig(cfg)
    setConfigDirty(true)
  }, [])

  const handleLLMConfigChange = useCallback((cfg: LLMConfig) => {
    setLLMConfig(cfg)
    setConfigDirty(true)
  }, [])

  const handleAddEndpoint = useCallback((endpoint: Omit<SavedEndpoint, 'id'>) => {
    const id = `ep_${Date.now()}_${Math.random().toString(16).slice(2)}`
    setLLMConfig((prev) => ({
      ...prev,
      saved_endpoints: [...prev.saved_endpoints, { ...endpoint, id }],
    }))
    setConfigDirty(true)
  }, [])

  const handleEditEndpoint = useCallback((endpoint: SavedEndpoint) => {
    setLLMConfig((prev) => ({
      ...prev,
      saved_endpoints: prev.saved_endpoints.map((e) => (e.id === endpoint.id ? endpoint : e)),
    }))
    setConfigDirty(true)
  }, [])

  const handleDeleteEndpoint = useCallback((id: string) => {
    setLLMConfig((prev) => ({
      ...prev,
      saved_endpoints: prev.saved_endpoints.filter((e) => e.id !== id),
    }))
    setConfigDirty(true)
  }, [])

  const handleTestEndpoint = useCallback(async (endpoint: SavedEndpoint) => {
    const r = await fetch('/api/llm/proxy/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: endpoint.provider, url: endpoint.url, api_key: endpoint.api_key }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await parseMaybeEnvelope<{ success: boolean; message: string; models?: string[] }>(r)
    if (Array.isArray(data.models)) {
      setAvailableModels((prev) => ({ ...prev, [endpoint.id]: data.models || [] }))
    }
    return data
  }, [parseMaybeEnvelope])

  const handleFetchModels = useCallback(async (endpointId: string) => {
    const ep = llmConfig.saved_endpoints.find((e) => e.id === endpointId)
    if (!ep) return []
    setLoadingModels((prev) => ({ ...prev, [endpointId]: true }))
    try {
      const r = await fetch('/api/llm/proxy/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: ep.provider, url: ep.url, api_key: ep.api_key }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await parseMaybeEnvelope<{ models: string[] }>(r)
      const models = Array.isArray(data.models) ? data.models : []
      setAvailableModels((prev) => ({ ...prev, [endpointId]: models }))
      return models
    } finally {
      setLoadingModels((prev) => ({ ...prev, [endpointId]: false }))
    }
  }, [llmConfig.saved_endpoints, parseMaybeEnvelope])

  const handleTestModel = useCallback(async (slotType: 'embedding' | 'small' | 'large' | 'clara') => {
    if (slotType === 'clara') {
      const res = { success: false, message: 'CLaRa test is not implemented in the dashboard yet.' }
      setTestResults((prev) => ({ ...prev, clara: res }))
      return res
    }

    let endpointId: string | undefined
    let model: string | undefined
    let kind: string = 'completion'

    if (slotType === 'embedding') {
      endpointId = llmConfig.embedding.endpoint_id
      model = llmConfig.embedding.model
      kind = 'embedding'
    } else if (slotType === 'small') {
      endpointId = llmConfig.small_model.endpoint_id
      model = llmConfig.small_model.model
    } else {
      endpointId = llmConfig.large_model.endpoint_id
      model = llmConfig.large_model.model
    }

    const ep = llmConfig.saved_endpoints.find((e) => e.id === endpointId)
    if (!ep || !model) {
      const res = { success: false, message: 'Model not configured.' }
      setTestResults((prev) => ({ ...prev, [slotType]: res }))
      return res
    }

    setTestingSlot(slotType)
    try {
      const r = await fetch('/api/llm/proxy/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: ep.provider, url: ep.url, api_key: ep.api_key, model, kind }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await parseMaybeEnvelope<EndpointTestResult>(r)
      setTestResults((prev) => ({ ...prev, [slotType]: data }))
      return data
    } finally {
      setTestingSlot(null)
    }
  }, [llmConfig, parseMaybeEnvelope])

  const handleBuild = useCallback(async () => {
    if (!repoRoot.trim()) return
    setBuildLoading(true)
    try {
      const roots = [...coreRoots, ...workingRoots]
      const r = await fetch(`${API_BASE}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_root: repoRoot.trim(),
          roots: roots.length > 0 ? roots : null,
          include_globs: projectConfig.include_globs,
          exclude_globs: projectConfig.exclude_globs,
          max_file_bytes: projectConfig.max_file_bytes,
        }),
      })
      if (!r.ok) {
        const msg = await r.text()
        throw new Error(msg || `HTTP ${r.status}`)
      }
      await fetchStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Build failed')
    } finally {
      setBuildLoading(false)
    }
  }, [coreRoots, fetchStatus, projectConfig.exclude_globs, projectConfig.include_globs, projectConfig.max_file_bytes, repoRoot, workingRoots])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearchLoading(true)
    try {
      const r = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), k: searchK, min_score: minScore }),
      })
      if (!r.ok) {
        const msg = await r.text()
        throw new Error(msg || `HTTP ${r.status}`)
      }
      const data = await parseMaybeEnvelope<{ results: { doc: any; score: number }[] }>(r)
      const results = (data.results || []).map((r0) => {
        const doc = r0.doc || {}
        const span = doc.span || { start_line: 1, end_line: 1 }
        const content = String(doc.content || '')
        const out: SearchResult = {
          chunk_id: String(doc.id || ''),
          source_path: String(doc.source_path || ''),
          span: {
            start_line: Number(span.start_line || 1),
            end_line: Number(span.end_line || 1),
          },
          preview: safePreview(content),
          score: Number(r0.score || 0),
          section: doc.section ? String(doc.section) : undefined,
          content,
        }
        return out
      })
      setSearchResults(results)
      setSelectedChunk(results[0] ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }, [minScore, parseMaybeEnvelope, query, safePreview, searchK])

  const handleGetContext = useCallback(async () => {
    if (!query.trim()) return
    try {
      const r = await fetch(`${API_BASE}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          k: contextK,
          max_chars: contextMaxChars,
          include_sources: contextIncludeSources,
          include_scores: contextIncludeScores,
          min_score: minScore,
          structured: contextStructured,
        }),
      })
      if (!r.ok) {
        const msg = await r.text()
        throw new Error(msg || `HTTP ${r.status}`)
      }

      if (contextStructured) {
        const data = await parseMaybeEnvelope<ContextStructuredResponse>(r)
        setContext(String(data.context || ''))
        setContextMeta({
          chunks: data.chunks,
          total_chars: data.total_chars,
          estimated_tokens: data.estimated_tokens,
        })
      } else {
        const data = await parseMaybeEnvelope<{ context: string }>(r)
        setContext(String(data.context || ''))
        setContextMeta(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get context')
    }
  }, [contextIncludeScores, contextIncludeSources, contextK, contextMaxChars, contextStructured, minScore, parseMaybeEnvelope, query])

  const handleCopyContext = useCallback(async () => {
    if (!context) return
    try {
      await navigator.clipboard.writeText(context)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Copy failed')
    }
  }, [context])

  const handleToggleInclude = useCallback((paths: string[], action: 'add' | 'remove') => {
    setIncludedPaths((prev) => {
      const next = new Set(prev)
      for (const path of paths) {
        const normalized = String(path).replace(/^\/+/, '').replace(/\/\/+$/, '')
        if (action === 'remove') {
          next.delete(normalized)
        } else {
          next.add(normalized)
        }
      }
      const nextCore = Array.from(next)
      setCoreRoots(nextCore)
      setCoreRootsText(nextCore.join('\n'))
      setConfigDirty(true)
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (uiMode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')

    if (uiTheme === 'none') root.setAttribute('data-codrag-theme', 'a')
    else root.setAttribute('data-codrag-theme', uiTheme)
  }, [uiMode, uiTheme])

  useEffect(() => {
    setIncludedPaths(new Set([...coreRoots, ...workingRoots]))
  }, [coreRoots, workingRoots])

  const folderTreeData = useMemo(() => {
    const filtered = rootsFilter.trim()
      ? availableRoots.filter((r) => r.toLowerCase().includes(rootsFilter.trim().toLowerCase()))
      : availableRoots

    const internal = buildInternalTree(filtered)
    const coreSet = new Set(coreRoots)
    const workSet = new Set(workingRoots)
    const children = internal.children || []
    return children.map((c) => convertToUiTree(c, coreSet, workSet))
  }, [availableRoots, coreRoots, rootsFilter, workingRoots])

  useEffect(() => {
    const init = async () => {
      try {
        const r = await fetch(`${API_BASE}/config`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const cfg = await parseMaybeEnvelope<UiConfig>(r)
        setRepoRoot(String(cfg.repo_root || ''))
        const cr = Array.isArray(cfg.core_roots) ? cfg.core_roots : []
        const wr = Array.isArray(cfg.working_roots) ? cfg.working_roots : []
        setCoreRoots(cr)
        setWorkingRoots(wr)
        setCoreRootsText(cr.join('\n'))

        setProjectConfig({
          include_globs: Array.isArray(cfg.include_globs) ? cfg.include_globs : projectConfig.include_globs,
          exclude_globs: Array.isArray(cfg.exclude_globs) ? cfg.exclude_globs : projectConfig.exclude_globs,
          max_file_bytes: typeof cfg.max_file_bytes === 'number' ? cfg.max_file_bytes : projectConfig.max_file_bytes,
          trace: cfg.trace ?? projectConfig.trace,
          auto_rebuild: cfg.auto_rebuild ?? projectConfig.auto_rebuild,
        })

        if (cfg.llm_config) setLLMConfig(cfg.llm_config)

        await fetchStatus()
        if (String(cfg.repo_root || '').trim()) {
          await fetchAvailableRoots()
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load config')
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [fetchAvailableRoots, fetchStatus, parseMaybeEnvelope])

  // Dashboard panel definitions matching tremor-preview styles
  const panelContent = useMemo(() => ({
    status: (
      <div className="p-4">
        <IndexStatusCard
          stats={{
            loaded: status?.index.loaded ?? false,
            index_dir: status?.index.index_dir,
            total_documents: status?.index.total_documents,
            model: status?.index.model,
            built_at: status?.index.built_at ?? undefined,
            embedding_dim: status?.index.embedding_dim
          }}
          building={status?.building}
          lastError={status?.last_error}
          bare
        />
      </div>
    ),
    build: (
      <div className="p-4">
        <BuildCard
          repoRoot={repoRoot}
          onRepoRootChange={setRepoRoot}
          onBuild={handleBuild}
          building={buildLoading || (status?.building ?? false)}
          bare
        />
      </div>
    ),
    'llm-status': (
      <div className="p-4">
        <LLMStatusWidget
          services={[
            {
              name: 'Embedding',
              status: llmConfig.embedding.model ? 'connected' : 'not-configured',
              type: 'other',
              url: llmConfig.embedding.model
            },
            {
              name: 'Small Model',
              status: llmConfig.small_model.enabled ? 'connected' : 'disabled',
              type: 'ollama',
              url: llmConfig.small_model.model
            },
            {
              name: 'Large Model',
              status: llmConfig.large_model.enabled ? 'connected' : 'disabled',
              type: 'ollama',
              url: llmConfig.large_model.model
            },
          ]}
          bare
        />
      </div>
    ),
    search: (
      <div className="p-4">
        <SearchPanel
          query={query}
          onQueryChange={setQuery}
          k={searchK}
          onKChange={setSearchK}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          onSearch={handleSearch}
          loading={searchLoading}
          bare
        />
      </div>
    ),
    'context-options': (
      <div className="p-4">
        <ContextOptionsPanel
          k={contextK}
          onKChange={setContextK}
          maxChars={contextMaxChars}
          onMaxCharsChange={setContextMaxChars}
          includeSources={contextIncludeSources}
          onIncludeSourcesChange={setContextIncludeSources}
          includeScores={contextIncludeScores}
          onIncludeScoresChange={setContextIncludeScores}
          structured={contextStructured}
          onStructuredChange={setContextStructured}
          onGetContext={handleGetContext}
          onCopyContext={handleCopyContext}
          hasContext={!!context}
          disabled={!query.trim()}
        />
      </div>
    ),
    results: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full overflow-hidden">
        <div className="h-full overflow-y-auto min-h-0">
          <SearchResultsList
            results={searchResults}
            selectedId={selectedChunk?.chunk_id}
            onSelect={setSelectedChunk}
          />
        </div>
        <div className="h-full overflow-y-auto min-h-0 border-l border-border pl-4">
          <ChunkPreview
            content={selectedChunk?.content}
            sourcePath={selectedChunk?.source_path}
            section={selectedChunk?.section}
          />
        </div>
      </div>
    ),
    'context-output': (
      <ContextOutput
        context={context}
        meta={contextMeta}
      />
    ),
    roots: (
      <div className="p-4 space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="text-xs text-text-muted">
            core = always indexed, working = task-specific
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rootsFilter}
              onChange={(e) => setRootsFilter(e.target.value)}
              placeholder="Filter roots..."
              className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary w-32"
            />
            <button
              onClick={fetchAvailableRoots}
              className="bg-surface-raised hover:bg-surface rounded-md border border-border px-3 py-2 text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {availableRoots.length === 0 ? (
          <div className="p-4 text-sm text-text-muted text-center border border-dashed border-border-subtle rounded-lg">
            No roots found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-surface-raised min-h-0">
            <div className="p-2">
              <FolderTree
                data={folderTreeData}
                includedPaths={includedPaths}
                onToggleInclude={handleToggleInclude}
                compact
              />
            </div>
          </div>
        )}

        <details className="bg-surface-raised border border-border rounded-lg p-4 flex-shrink-0">
          <summary className="cursor-pointer text-sm text-text">IDE Integration (MCP)</summary>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={mcpIde}
                onChange={(e) => setMcpIde(e.target.value as typeof mcpIde)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="IDE"
              >
                <option value="cursor">Cursor</option>
                <option value="windsurf">Windsurf</option>
                <option value="vscode">VS Code</option>
                <option value="jetbrains">JetBrains</option>
                <option value="claude">Claude Desktop</option>
              </select>
              <select
                value={mcpMode}
                onChange={(e) => setMcpMode(e.target.value as typeof mcpMode)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="MCP Mode"
              >
                <option value="direct">Direct (no daemon)</option>
                <option value="auto">Auto (daemon mode)</option>
                <option value="project">Project (daemon mode)</option>
              </select>
              {mcpMode === 'project' && (
                <input
                  type="text"
                  value={mcpProjectId}
                  onChange={(e) => setMcpProjectId(e.target.value)}
                  placeholder="project_id"
                  className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              <button
                onClick={fetchMcpConfig}
                disabled={mcpConfigLoading || (mcpMode === 'project' && !mcpProjectId.trim())}
                className="bg-surface hover:bg-surface-raised border border-border rounded-md px-3 py-2 text-sm font-medium text-text disabled:opacity-50 transition"
              >
                {mcpConfigLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {mcpConfigError && (
              <div className="text-sm text-error">{mcpConfigError}</div>
            )}
            {mcpConfig ? (
              <div className="space-y-3">
                <div className="text-xs text-text-muted">
                  <div>Daemon URL: {mcpConfig.daemon_url}</div>
                  <div>File: {mcpConfig.file}</div>
                  <div>Location: {mcpConfig.path_hint}</div>
                </div>
                <div className="flex justify-end">
                  <CopyButton
                    text={JSON.stringify(mcpConfig.config, null, 2)}
                    label="Copy MCP Config"
                  />
                </div>
                <pre className="bg-surface border border-border rounded-md p-3 overflow-auto text-xs font-mono text-text">
                  <code>{JSON.stringify(mcpConfig.config, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="p-4 text-sm text-text-muted text-center border border-dashed border-border-subtle rounded-lg">
                {mcpMode === 'project' ? 'Enter a project_id to generate MCP config.' : 'MCP config will appear here.'}
              </div>
            )}
          </div>
        </details>
      </div>
    ),
    settings: (
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <div className="text-xs text-text-muted">Core Roots (one per line)</div>
          <textarea
            value={coreRootsText}
            onChange={(e) => setCoreRootsText(e.target.value)}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs font-mono text-text focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
          />
        </div>

        <div className="h-px bg-border" />

        <ProjectSettingsPanel
          config={projectConfig}
          onChange={handleProjectConfigChange}
          onSave={() => void saveAdvancedConfig()}
          isDirty={configDirty}
        />
      </div>
    )
  }), [
    status, buildLoading, repoRoot, query, searchK, minScore, searchLoading, searchResults, selectedChunk,
    contextK, contextMaxChars, contextIncludeSources, contextIncludeScores, contextStructured, context, contextMeta,
    rootsFilter, availableRoots, folderTreeData, includedPaths, mcpIde, mcpMode, mcpProjectId, mcpConfig, mcpConfigLoading, mcpConfigError,
    coreRootsText, projectConfig, configDirty, llmConfig, availableModels, loadingModels, testingSlot, testResults,
    setRepoRoot, handleBuild, setQuery, setSearchK, setMinScore, handleSearch, setSelectedChunk,
    setContextK, setContextMaxChars, setContextIncludeSources, setContextIncludeScores, setContextStructured, handleGetContext, handleCopyContext,
    setRootsFilter, fetchAvailableRoots, handleToggleInclude, setMcpIde, setMcpMode, setMcpProjectId, fetchMcpConfig,
    setCoreRootsText, handleProjectConfigChange, saveAdvancedConfig, handleLLMConfigChange, handleAddEndpoint, handleEditEndpoint, handleDeleteEndpoint, handleTestEndpoint, handleFetchModels, handleTestModel
  ])

  const panelDetails = useMemo(() => ({
    'llm-status': (
      <AIModelsSettings
        config={llmConfig}
        onConfigChange={handleLLMConfigChange}
        onAddEndpoint={handleAddEndpoint}
        onEditEndpoint={handleEditEndpoint}
        onDeleteEndpoint={handleDeleteEndpoint}
        onTestEndpoint={handleTestEndpoint}
        onFetchModels={handleFetchModels}
        onTestModel={handleTestModel}
        onHFDownload={() => {}}
        availableModels={availableModels}
        loadingModels={loadingModels}
        testingSlot={testingSlot}
        testResults={testResults}
      />
    ),
    'roots': (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-2">Project File Explorer</h2>
          <div className="flex gap-2">
             <input
              type="text"
              value={rootsFilter}
              onChange={(e) => setRootsFilter(e.target.value)}
              placeholder="Filter roots..."
              className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary flex-1"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
           <FolderTree
              data={folderTreeData}
              includedPaths={includedPaths}
              onToggleInclude={handleToggleInclude}
            />
        </div>
      </div>
    )
  }), [
    llmConfig, handleLLMConfigChange, handleAddEndpoint, handleEditEndpoint, handleDeleteEndpoint, handleTestEndpoint, handleFetchModels, handleTestModel, availableModels, loadingModels, testingSlot, testResults,
    rootsFilter, folderTreeData, handleToggleInclude, includedPaths
  ])

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground transition-colors duration-200">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full space-y-6">
          <ModularDashboard
            panelDefinitions={PANEL_REGISTRY}
            panelContent={panelContent}
            panelDetails={panelDetails}
            headerLeft={
              <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
                <Database className="w-6 h-6" />
                Code Index Dashboard
              </h1>
            }
            headerRight={
              <>
                <select
                  value={uiMode}
                  onChange={(e) => setUiMode(e.target.value as 'light' | 'dark')}
                  className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Mode"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <select
                  value={uiTheme}
                  onChange={(e) => setUiTheme(e.target.value)}
                  className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Visual Style"
                >
                  <option value="none">Default</option>
                  <option value="a">A: Slate Developer</option>
                  <option value="b">B: Deep Focus</option>
                  <option value="c">C: Signal Green</option>
                  <option value="d">D: Warm Craft</option>
                  <option value="e">E: Neo-Brutalist</option>
                  <option value="f">F: Swiss Minimal</option>
                  <option value="g">G: Glass-Morphic</option>
                  <option value="h">H: Retro-Futurism</option>
                  <option value="m">M: Retro Aurora</option>
                  <option value="n">N: Retro Mirage</option>
                  <option value="i">I: Studio Collage</option>
                  <option value="j">J: Yale Grid</option>
                  <option value="k">K: Inclusive Focus</option>
                  <option value="l">L: Enterprise Console</option>
                </select>
                <button
                  onClick={fetchStatus}
                  className="p-2 rounded hover:bg-surface-raised transition text-text-muted"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            }
          />

          {error && (
            <div className="bg-error-muted border border-error rounded-lg p-4 flex items-center gap-2 text-error">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-error hover:opacity-80">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
