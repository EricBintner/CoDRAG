import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  // API
  useApiClient,
  type ProjectListItem,
  // Navigation
  AppShell,
  Sidebar,
  ProjectList,
  // Dashboard
  IndexStatusCard,
  BuildCard,
  SearchPanel,
  ContextOptionsPanel,
  SearchResultsList,
  ChunkPreview,
  ContextOutput,
  ProjectSettingsPanel,
  ModularDashboard,
  LLMStatusWidget,
  AIModelsSettings,
  // Project
  AddProjectModal,
  FolderTreePanel,
  FolderTree,
  PinnedTextFilesPanel,
  type PinnedTextFile,
  // Watch
  WatchControlPanel,
  // Patterns
  LoadingState,
  ErrorState,
  // Primitives
  Button,
  Select,
  // Types
  type SearchResult,
  type ContextMeta,
  type ProjectConfig,
  type ProjectSummary,
  type ProjectStatus,
  type StatusState,
  type TreeNode,
  type LLMConfig,
  type SavedEndpoint,
  type EndpointTestResult,
  type WatchStatus,
  // Layout
  PANEL_REGISTRY,
} from '@codrag/ui'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// ── Constants ────────────────────────────────────────────────

const MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const THEME_OPTIONS = [
  { value: 'none', label: 'Default' },
  { value: 'a', label: 'A: Slate Developer' },
  { value: 'b', label: 'B: Deep Focus' },
  { value: 'c', label: 'C: Signal Green' },
  { value: 'd', label: 'D: Warm Craft' },
  { value: 'e', label: 'E: Neo-Brutalist' },
  { value: 'f', label: 'F: Swiss Minimal' },
  { value: 'g', label: 'G: Glass-Morphic' },
  { value: 'h', label: 'H: Retro-Futurism' },
  { value: 'm', label: 'M: Retro Aurora' },
  { value: 'n', label: 'N: Retro Mirage' },
  { value: 'i', label: 'I: Studio Collage' },
  { value: 'j', label: 'J: Yale Grid' },
  { value: 'k', label: 'K: Inclusive Focus' },
  { value: 'l', label: 'L: Enterprise Console' },
]

// ── Helpers ──────────────────────────────────────────────────

function deriveStatus(ps: ProjectStatus | null, building: boolean): StatusState {
  if (building) return 'building'
  if (!ps) return 'pending'
  if (ps.building) return 'building'
  if (ps.stale) return 'stale'
  if (ps.index.exists) return 'fresh'
  return 'pending'
}

function toProjectSummary(p: ProjectListItem, ps: ProjectStatus | null, building: boolean): ProjectSummary {
  return {
    id: p.id,
    name: p.name,
    path: p.path,
    mode: p.mode ?? 'standalone',
    status: deriveStatus(ps, building),
    chunk_count: ps?.index.total_chunks,
    last_build_at: ps?.index.last_build_at ?? undefined,
  }
}

// ── App ──────────────────────────────────────────────────────

function App() {
  const api = useApiClient()

  // ── Global state ───────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Project list ───────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [projectStatuses, setProjectStatuses] = useState<Record<string, ProjectStatus>>({})
  const [buildingProjects, setBuildingProjects] = useState<Set<string>>(new Set())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ── UI preferences ─────────────────────────────────────────
  const [uiMode, setUiMode] = useState<'light' | 'dark'>('light')
  const [uiTheme, setUiTheme] = useState<string>('none')

  // ── Search state ───────────────────────────────────────────
  const [query, setQuery] = useState<string>('')
  const [searchK, setSearchK] = useState<number>(8)
  const [minScore, setMinScore] = useState<number>(0.15)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedChunk, setSelectedChunk] = useState<SearchResult | null>(null)

  // ── Context state ──────────────────────────────────────────
  const [contextK, setContextK] = useState<number>(5)
  const [contextMaxChars, setContextMaxChars] = useState<number>(6000)
  const [contextIncludeSources, setContextIncludeSources] = useState(true)
  const [contextIncludeScores, setContextIncludeScores] = useState(false)
  const [contextStructured, setContextStructured] = useState(false)
  const [context, setContext] = useState<string>('')
  const [contextMeta, setContextMeta] = useState<ContextMeta | null>(null)

  // ── Roots state ────────────────────────────────────────────
  const [rootNames, setRootNames] = useState<string[]>([])

  // ── Pinned files state ──────────────────────────────────────
  const [pinnedPaths, setPinnedPaths] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('codrag_pinned_files')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch { return new Set() }
  })
  const [pinnedFiles, setPinnedFiles] = useState<PinnedTextFile[]>([])

  // ── Watch state ─────────────────────────────────────────────
  const [watchStatus, setWatchStatus] = useState<WatchStatus>({
    enabled: false,
    state: 'disabled',
    stale: false,
    pending: false,
  })
  const [watchLoading, setWatchLoading] = useState(false)

  // ── Settings state ─────────────────────────────────────────
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    include_globs: ['**/*.md', '**/*.py', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.json'],
    exclude_globs: ['**/.git/**', '**/node_modules/**', '**/__pycache__/**', '**/.venv/**', '**/dist/**', '**/build/**', '**/.next/**'],
    max_file_bytes: 400_000,
    trace: { enabled: false },
    auto_rebuild: { enabled: false, debounce_ms: 5000 },
  })
  const [configDirty, setConfigDirty] = useState(false)

  // ── LLM config state ───────────────────────────────────────
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

  // ── Derived ────────────────────────────────────────────────
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  )
  const projectStatus = selectedProjectId ? projectStatuses[selectedProjectId] ?? null : null
  const isBuilding = selectedProjectId ? buildingProjects.has(selectedProjectId) : false

  const projectSummaries = useMemo(
    () => projects.map((p) => toProjectSummary(p, projectStatuses[p.id] ?? null, buildingProjects.has(p.id))),
    [projects, projectStatuses, buildingProjects],
  )

  // ── Data fetching ──────────────────────────────────────────

  const refreshProjects = useCallback(async () => {
    try {
      const data = await api.listProjects()
      setProjects(data.projects)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to list projects')
    }
  }, [api])

  const refreshStatus = useCallback(async (projectId: string) => {
    try {
      const status = await api.getProjectStatus(projectId)
      setProjectStatuses((prev) => ({ ...prev, [projectId]: status }))
      if (!status.building) {
        setBuildingProjects((prev) => {
          const next = new Set(prev)
          next.delete(projectId)
          return next
        })
      }
    } catch {
      // Silently ignore status errors for background polling
    }
  }, [api])

  // ── Actions ────────────────────────────────────────────────

  const handleAddProject = useCallback(async (path: string, name: string, mode: 'standalone' | 'embedded') => {
    try {
      const data = await api.createProject({ path, name, mode })
      setProjects((prev) => [...prev, data.project])
      setSelectedProjectId(data.project.id)
      setAddModalOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add project')
    }
  }, [api])

  const handleBuild = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      setBuildingProjects((prev) => new Set(prev).add(selectedProjectId))
      await api.buildProject(selectedProjectId)
      // Poll status until build completes
      const poll = setInterval(async () => {
        const status = await api.getProjectStatus(selectedProjectId)
        setProjectStatuses((prev) => ({ ...prev, [selectedProjectId]: status }))
        if (!status.building) {
          clearInterval(poll)
          setBuildingProjects((prev) => {
            const next = new Set(prev)
            next.delete(selectedProjectId)
            return next
          })
        }
      }, 2000)
    } catch (e) {
      setBuildingProjects((prev) => {
        const next = new Set(prev)
        next.delete(selectedProjectId)
        return next
      })
      setError(e instanceof Error ? e.message : 'Build failed')
    }
  }, [api, selectedProjectId])

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !selectedProjectId) return
    setSearchLoading(true)
    try {
      const data = await api.search(selectedProjectId, {
        query: query.trim(),
        k: searchK,
        min_score: minScore,
      })
      const results: SearchResult[] = data.results.map((r) => ({
        chunk_id: r.chunk_id,
        source_path: r.source_path,
        span: r.span,
        preview: r.preview,
        score: r.score,
        section: r.section,
        content: r.content,
      }))
      setSearchResults(results)
      setSelectedChunk(results[0] ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }, [api, minScore, query, searchK, selectedProjectId])

  const handleGetContext = useCallback(async () => {
    if (!query.trim() || !selectedProjectId) return
    try {
      const data = await api.assembleContext(selectedProjectId, {
        query: query.trim(),
        k: contextK,
        max_chars: contextMaxChars,
        include_sources: contextIncludeSources,
        include_scores: contextIncludeScores,
        min_score: minScore,
        structured: contextStructured,
      })
      setContext(String(data.context || ''))
      if ('chunks' in data && data.chunks) {
        setContextMeta({
          chunks: data.chunks.map((c) => ({
            source_path: c.source_path,
            section: '',
            score: c.score ?? 0,
            truncated: false,
          })),
          total_chars: data.total_chars ?? 0,
          estimated_tokens: data.estimated_tokens ?? 0,
        })
      } else {
        setContextMeta(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get context')
    }
  }, [api, contextIncludeScores, contextIncludeSources, contextK, contextMaxChars, contextStructured, minScore, query, selectedProjectId])

  const handleCopyContext = useCallback(async () => {
    if (!context) return
    try {
      await navigator.clipboard.writeText(context)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Copy failed')
    }
  }, [context])

  // ── LLM config handlers ─────────────────────────────────────

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
    const json = await r.json()
    const data = json?.data ?? json
    if (Array.isArray(data.models)) {
      setAvailableModels((prev) => ({ ...prev, [endpoint.id]: data.models }))
    }
    return data as EndpointTestResult
  }, [])

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
      const json = await r.json()
      const data = json?.data ?? json
      const models = Array.isArray(data.models) ? data.models : []
      setAvailableModels((prev) => ({ ...prev, [endpointId]: models }))
      return models
    } finally {
      setLoadingModels((prev) => ({ ...prev, [endpointId]: false }))
    }
  }, [llmConfig.saved_endpoints])

  const handleTestModel = useCallback(async (slotType: 'embedding' | 'small' | 'large' | 'clara') => {
    if (slotType === 'clara') {
      const res: EndpointTestResult = { success: false, message: 'CLaRa test not yet implemented.' }
      setTestResults((prev) => ({ ...prev, clara: res }))
      return res
    }
    let endpointId: string | undefined
    let model: string | undefined
    let kind = 'completion'
    if (slotType === 'embedding') {
      endpointId = llmConfig.embedding.endpoint_id; model = llmConfig.embedding.model; kind = 'embedding'
    } else if (slotType === 'small') {
      endpointId = llmConfig.small_model.endpoint_id; model = llmConfig.small_model.model
    } else {
      endpointId = llmConfig.large_model.endpoint_id; model = llmConfig.large_model.model
    }
    const ep = llmConfig.saved_endpoints.find((e) => e.id === endpointId)
    if (!ep || !model) {
      const res: EndpointTestResult = { success: false, message: 'Model not configured.' }
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
      const json = await r.json()
      const data = (json?.data ?? json) as EndpointTestResult
      setTestResults((prev) => ({ ...prev, [slotType]: data }))
      return data
    } finally {
      setTestingSlot(null)
    }
  }, [llmConfig])

  const handleSaveConfig = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      await api.updateProject(selectedProjectId, {
        config: {
          include_globs: projectConfig.include_globs,
          exclude_globs: projectConfig.exclude_globs,
          max_file_bytes: projectConfig.max_file_bytes,
          trace: projectConfig.trace,
          auto_rebuild: projectConfig.auto_rebuild,
        },
      })
      setConfigDirty(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config')
    }
  }, [api, projectConfig, selectedProjectId])

  const handleProjectConfigChange = useCallback((cfg: ProjectConfig) => {
    setProjectConfig(cfg)
    setConfigDirty(true)
  }, [])

  // ── Watch handlers ──────────────────────────────────────────

  const refreshWatchStatus = useCallback(async (projId: string) => {
    try {
      const ws = await api.getWatchStatus(projId)
      setWatchStatus(ws)
    } catch {
      setWatchStatus({ enabled: false, state: 'disabled', stale: false, pending: false })
    }
  }, [api])

  const handleStartWatch = useCallback(async () => {
    if (!selectedProjectId) return
    setWatchLoading(true)
    try {
      await api.startWatch(selectedProjectId)
      await refreshWatchStatus(selectedProjectId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start watch')
    } finally {
      setWatchLoading(false)
    }
  }, [api, selectedProjectId, refreshWatchStatus])

  const handleStopWatch = useCallback(async () => {
    if (!selectedProjectId) return
    setWatchLoading(true)
    try {
      await api.stopWatch(selectedProjectId)
      await refreshWatchStatus(selectedProjectId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop watch')
    } finally {
      setWatchLoading(false)
    }
  }, [api, selectedProjectId, refreshWatchStatus])

  // ── Pinned files handlers ──────────────────────────────────

  const handlePinFile = useCallback((path: string) => {
    setPinnedPaths((prev) => {
      const next = new Set(prev)
      next.add(path)
      localStorage.setItem('codrag_pinned_files', JSON.stringify([...next]))
      return next
    })
  }, [])

  const handleUnpinFile = useCallback((fileId: string) => {
    setPinnedPaths((prev) => {
      const next = new Set(prev)
      next.delete(fileId)
      localStorage.setItem('codrag_pinned_files', JSON.stringify([...next]))
      return next
    })
    setPinnedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  // Fetch content for pinned files when paths or project change
  useEffect(() => {
    if (!selectedProjectId || pinnedPaths.size === 0) {
      setPinnedFiles([])
      return
    }
    let cancelled = false
    const fetchAll = async () => {
      const results: PinnedTextFile[] = []
      for (const path of pinnedPaths) {
        try {
          const data = await api.getProjectFileContent(selectedProjectId, path)
          if (cancelled) return
          const name = path.split('/').pop() ?? path
          results.push({ id: path, path, name, content: data.content })
        } catch {
          // skip files that fail to load
        }
      }
      if (!cancelled) setPinnedFiles(results)
    }
    void fetchAll()
    return () => { cancelled = true }
  }, [api, selectedProjectId, pinnedPaths])

  // ── Theme effect ───────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    if (uiMode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    root.setAttribute('data-codrag-theme', uiTheme === 'none' ? 'a' : uiTheme)
  }, [uiMode, uiTheme])

  // ── Init: load projects ────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await refreshProjects()
      } catch {
        // Error already set
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [refreshProjects])

  // ── Refresh status + watch when project changes ─────────────
  useEffect(() => {
    if (!selectedProjectId) return
    void refreshStatus(selectedProjectId)
    void refreshWatchStatus(selectedProjectId)
    // Fetch roots
    api.getProjectRoots(selectedProjectId).then((data) => {
      setRootNames(data.roots ?? [])
    }).catch(() => { setRootNames([]) })
    // Load project config
    api.getProject(selectedProjectId).then((data) => {
      const cfg = data.project.config
      if (cfg) {
        setProjectConfig({
          include_globs: cfg.include_globs ?? projectConfig.include_globs,
          exclude_globs: cfg.exclude_globs ?? projectConfig.exclude_globs,
          max_file_bytes: cfg.max_file_bytes ?? projectConfig.max_file_bytes,
          trace: cfg.trace ?? projectConfig.trace,
          auto_rebuild: cfg.auto_rebuild ?? projectConfig.auto_rebuild,
        })
        setConfigDirty(false)
      }
    }).catch(() => {})
    // Auto-select first project if none selected
  }, [selectedProjectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first project
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  // ── Panel content (Storybook components only) ──────────────

  const panelContent = useMemo(() => ({
    status: (
      <IndexStatusCard
        stats={{
          loaded: projectStatus?.index.exists ?? false,
          total_documents: projectStatus?.index.total_chunks,
          model: projectStatus?.index.embedding_model,
          built_at: projectStatus?.index.last_build_at ?? undefined,
          embedding_dim: projectStatus?.index.embedding_dim,
        }}
        building={isBuilding || projectStatus?.building}
        lastError={projectStatus?.index.last_error?.message ?? null}
        bare
      />
    ),
    build: (
      <BuildCard
        repoRoot={selectedProject?.path ?? ''}
        onRepoRootChange={() => {}}
        onBuild={handleBuild}
        building={isBuilding || (projectStatus?.building ?? false)}
        bare
      />
    ),
    'llm-status': (
      <LLMStatusWidget
        services={[
          {
            name: 'Embedding',
            status: 'connected',
            type: 'ollama',
            url: projectStatus?.index.embedding_model ?? 'not configured',
          },
        ]}
        bare
      />
    ),
    search: (
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
    ),
    'context-options': (
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
        bare
      />
    ),
    results: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
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
            bare
          />
        </div>
      </div>
    ),
    'context-output': (
      <ContextOutput
        context={context}
        meta={contextMeta}
        bare
      />
    ),
    roots: (
      <FolderTreePanel
        data={rootNames.map((name): TreeNode => ({ name, type: 'folder', children: [] }))}
        includedPaths={pinnedPaths}
        onToggleInclude={(paths, action) => {
          if (action === 'add') paths.forEach(handlePinFile)
          else paths.forEach(handleUnpinFile)
        }}
        onNodeClick={(_node, path) => {
          if (pinnedPaths.has(path)) handleUnpinFile(path)
          else handlePinFile(path)
        }}
        bare
      />
    ),
    'pinned-files': (
      <PinnedTextFilesPanel
        files={pinnedFiles}
        onUnpin={handleUnpinFile}
        bare
      />
    ),
    watch: (
      <WatchControlPanel
        status={watchStatus}
        onStartWatch={handleStartWatch}
        onStopWatch={handleStopWatch}
        onRebuildNow={() => selectedProjectId && void handleBuild()}
        loading={watchLoading}
        bare
      />
    ),
    settings: (
      <div className="p-4">
        <ProjectSettingsPanel
          config={projectConfig}
          onChange={handleProjectConfigChange}
          onSave={() => void handleSaveConfig()}
          isDirty={configDirty}
        />
      </div>
    ),
  }), [
    projectStatus, isBuilding, selectedProject, selectedProjectId, rootNames, pinnedPaths, pinnedFiles,
    watchStatus, watchLoading, handleStartWatch, handleStopWatch,
    query, searchK, minScore, searchLoading, searchResults, selectedChunk,
    contextK, contextMaxChars, contextIncludeSources, contextIncludeScores, contextStructured, context, contextMeta,
    projectConfig, configDirty,
    handleBuild, handleSearch, handleGetContext, handleCopyContext, handleSaveConfig, handleProjectConfigChange,
    handlePinFile, handleUnpinFile,
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
    roots: (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <FolderTree
            data={rootNames.map((name): TreeNode => ({ name, type: 'folder', children: [] }))}
            compact
          />
        </div>
      </div>
    ),
  }), [
    llmConfig, handleLLMConfigChange, handleAddEndpoint, handleEditEndpoint, handleDeleteEndpoint,
    handleTestEndpoint, handleFetchModels, handleTestModel, availableModels, loadingModels, testingSlot, testResults,
    rootNames,
  ])

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return <LoadingState message="Connecting to CoDRAG daemon..." />
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <AppShell
      sidebar={
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed((c) => !c)}
        >
          {!sidebarCollapsed && (
            <ProjectList
              projects={projectSummaries}
              selectedProjectId={selectedProjectId ?? undefined}
              onProjectSelect={setSelectedProjectId}
              onAddProject={() => setAddModalOpen(true)}
            />
          )}
        </Sidebar>
      }
    >
      {selectedProject ? (
        <div className="w-full space-y-6">
          <ModularDashboard
            panelDefinitions={PANEL_REGISTRY}
            panelContent={panelContent}
            panelDetails={panelDetails}
            headerLeft={
              <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
                {selectedProject.name}
              </h1>
            }
            headerRight={
              <div className="flex items-center gap-2">
                <Select
                  value={uiMode}
                  onChange={(e) => setUiMode(e.target.value as 'light' | 'dark')}
                  aria-label="Mode"
                  size="sm"
                  options={MODE_OPTIONS}
                />
                <Select
                  value={uiTheme}
                  onChange={(e) => setUiTheme(e.target.value)}
                  aria-label="Visual Style"
                  size="sm"
                  options={THEME_OPTIONS}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => selectedProjectId && void refreshStatus(selectedProjectId)}
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-text-muted text-lg">No project selected</p>
            <Button onClick={() => setAddModalOpen(true)}>
              Add Your First Project
            </Button>
          </div>
        </div>
      )}

      {error && (
        <ErrorState
          title="Error"
          error={{ code: 'APP_ERROR', message: error }}
          onDismiss={() => setError(null)}
        />
      )}

      <AddProjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProject}
      />
    </AppShell>
  )
}

export default App
