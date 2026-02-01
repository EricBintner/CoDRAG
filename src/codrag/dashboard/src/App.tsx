import { useState, useEffect, useCallback, useMemo } from 'react'
import { Database, RefreshCw, FileText, AlertCircle, Loader2, ChevronRight, ChevronDown, Folder } from 'lucide-react'
import { 
  IndexStatusCard, 
  BuildCard, 
  SearchPanel, 
  ContextOptionsPanel, 
  SearchResultsList, 
  ChunkPreview, 
  ContextOutput,
  type IndexStats,
  type SearchResult,
  type ContextMeta
} from '@codrag/ui'

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
}

interface ContextStructuredResponse {
  context: string
  chunks: { source_path: string; section: string; score: number; truncated: boolean }[]
  total_chars: number
  estimated_tokens: number
}

interface McpConfigResponse {
  daemon_url: string
  file?: string
  path_hint?: string
  config?: unknown
  configs?: unknown
}

function App() {
  const [status, setStatus] = useState<IndexStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [repoRoot, setRepoRoot] = useState('')
  const [buildLoading, setBuildLoading] = useState(false)

  const [query, setQuery] = useState('')
  const [searchK, setSearchK] = useState(8)
  const [minScore, setMinScore] = useState(0.15)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [selectedChunk, setSelectedChunk] = useState<SearchResult | null>(null)
  const [contextK, setContextK] = useState(5)
  const [contextMaxChars, setContextMaxChars] = useState(6000)
  const [contextIncludeSources, setContextIncludeSources] = useState(true)
  const [contextIncludeScores, setContextIncludeScores] = useState(false)
  const [contextStructured, setContextStructured] = useState(false)
  const [context, setContext] = useState('')
  const [contextMeta, setContextMeta] = useState<ContextMeta | null>(null)

  const [contextDefaultsLoaded, setContextDefaultsLoaded] = useState(false)

  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null)
  const [availableRoots, setAvailableRoots] = useState<string[]>([])
  const [rootsFilter, setRootsFilter] = useState('')
  const [rootsCollapsed, setRootsCollapsed] = useState<Record<string, boolean>>({})

  const [coreRootsText, setCoreRootsText] = useState('')
  const [includeGlobsText, setIncludeGlobsText] = useState('')
  const [excludeGlobsText, setExcludeGlobsText] = useState('')
  const [maxFileBytes, setMaxFileBytes] = useState(400000)

  const [mcpIde, setMcpIde] = useState('cursor')
  const [mcpMode, setMcpMode] = useState<'auto' | 'project'>('auto')
  const [mcpProjectId, setMcpProjectId] = useState('')
  const [mcpDaemonUrl, setMcpDaemonUrl] = useState('')
  const [mcpConfigFile, setMcpConfigFile] = useState('')
  const [mcpConfigPathHint, setMcpConfigPathHint] = useState('')
  const [mcpConfigJson, setMcpConfigJson] = useState('')
  const [mcpConfigLoading, setMcpConfigLoading] = useState(false)

  const [uiMode, setUiMode] = useState<'light' | 'dark'>('dark')
  const [uiTheme, setUiTheme] = useState<string>('h')

  useEffect(() => {
    try {
      const storedMode = window.localStorage.getItem('codrag_dashboard_mode')
      const storedTheme = window.localStorage.getItem('codrag_dashboard_theme')
      if (storedMode === 'light' || storedMode === 'dark') setUiMode(storedMode)
      if (storedTheme) setUiTheme(storedTheme)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', uiMode === 'dark')
    document.documentElement.setAttribute('data-theme', uiMode)

    if (uiTheme && uiTheme !== 'none') {
      document.documentElement.setAttribute('data-codrag-theme', uiTheme)
    } else {
      document.documentElement.removeAttribute('data-codrag-theme')
    }

    try {
      window.localStorage.setItem('codrag_dashboard_mode', uiMode)
      window.localStorage.setItem('codrag_dashboard_theme', uiTheme)
    } catch {
      // ignore
    }
  }, [uiMode, uiTheme])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStatus(data)
      setError(null)
      if (data.config?.repo_root && !repoRoot) {
        setRepoRoot(data.config.repo_root)
      }
      if (!contextDefaultsLoaded && data.context_defaults) {
        setContextK(data.context_defaults.k)
        setContextMaxChars(data.context_defaults.max_chars)
        setContextDefaultsLoaded(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [repoRoot, contextDefaultsLoaded])

  const fetchUiConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/config`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as UiConfig
      setUiConfig(data)
      setError(null)
      if (data.repo_root && !repoRoot) {
        setRepoRoot(data.repo_root)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch config')
    }
  }, [repoRoot])

  const saveUiConfig = useCallback(async (next: UiConfig) => {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as UiConfig
    setUiConfig(data)
    return data
  }, [])

  const fetchMcpConfig = useCallback(async () => {
    if (mcpMode === 'project' && !mcpProjectId.trim()) {
      setError("project_id is required when mode='project'")
      return
    }

    setMcpConfigLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('ide', mcpIde)
      params.set('mode', mcpMode)
      if (mcpMode === 'project') {
        params.set('project_id', mcpProjectId.trim())
      }
      const res = await fetch(`${API_BASE}/mcp-config?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as McpConfigResponse

      setMcpDaemonUrl(data.daemon_url || '')

      if (mcpIde === 'all') {
        setMcpConfigFile('multiple')
        setMcpConfigPathHint('')
        setMcpConfigJson(JSON.stringify(data.configs ?? data, null, 2))
      } else {
        setMcpConfigFile(data.file || '')
        setMcpConfigPathHint(data.path_hint || '')
        setMcpConfigJson(JSON.stringify(data.config ?? {}, null, 2))
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch MCP config')
    } finally {
      setMcpConfigLoading(false)
    }
  }, [mcpIde, mcpMode, mcpProjectId])

  const fetchAvailableRoots = useCallback(async () => {
    const root = repoRoot.trim()
    if (!root) {
      setAvailableRoots([])
      return
    }
    try {
      const url = `${API_BASE}/available-roots?repo_root=${encodeURIComponent(root)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAvailableRoots((data?.roots as string[]) || [])
    } catch (e) {
      setAvailableRoots([])
      setError(e instanceof Error ? e.message : 'Failed to fetch available roots')
    }
  }, [repoRoot])

  const tree = useMemo(() => buildTreeFromRoots(availableRoots), [availableRoots])

  useEffect(() => {
    if (!uiConfig) return
    setCoreRootsText((uiConfig.core_roots || []).join('\n'))
    setIncludeGlobsText((uiConfig.include_globs || []).join('\n'))
    setExcludeGlobsText((uiConfig.exclude_globs || []).join('\n'))
    setMaxFileBytes(uiConfig.max_file_bytes || 400000)
  }, [uiConfig])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    fetchUiConfig()
  }, [fetchUiConfig])

  useEffect(() => {
    fetchAvailableRoots()
  }, [fetchAvailableRoots])

  useEffect(() => {
    void fetchMcpConfig()
  }, [])

  const toggleRoot = async (rootKey: string, checked: boolean) => {
    if (!uiConfig) return

    const core = new Set(uiConfig.core_roots || [])
    if (!checked && core.has(rootKey)) {
      setError('Core roots cannot be unchecked. Edit Advanced Configuration to change core roots.')
      return
    }

    const working = new Set(uiConfig.working_roots || [])
    if (checked && !core.has(rootKey)) {
      working.add(rootKey)
    } else if (!checked && !core.has(rootKey)) {
      working.delete(rootKey)
    }

    const next = {
      ...uiConfig,
      repo_root: repoRoot,
      working_roots: Array.from(working),
    }
    setUiConfig(next)
    try {
      await saveUiConfig(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config')
    }
  }

  const collapseAll = () => {
    const flat: TreeNode[] = []
    flattenTree(tree, flat)
    const collapsed: Record<string, boolean> = {}
    for (const n of flat) {
      if (n.children.length > 0) {
        collapsed[n.key] = true
      }
    }
    setRootsCollapsed(collapsed)
  }

  const saveAdvancedConfig = async () => {
    if (!uiConfig) return

    const core_roots = coreRootsText
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean)
    const include_globs = includeGlobsText
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean)
    const exclude_globs = excludeGlobsText
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean)

    const next = {
      ...uiConfig,
      repo_root: repoRoot,
      core_roots,
      include_globs,
      exclude_globs,
      max_file_bytes: maxFileBytes,
    }

    try {
      await saveUiConfig(next)
      await fetchAvailableRoots()
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config')
    }
  }

  const handleBuild = async () => {
    if (!repoRoot.trim()) {
      setError('Repository root is required')
      return
    }
    setBuildLoading(true)
    try {
      let cfg = uiConfig
      if (cfg && cfg.repo_root !== repoRoot) {
        cfg = { ...cfg, repo_root: repoRoot }
        setUiConfig(cfg)
        try {
          cfg = await saveUiConfig(cfg)
        } catch {
          cfg = uiConfig
        }
      }

      const roots = cfg ? [...(cfg.core_roots || []), ...(cfg.working_roots || [])] : []
      const payload: Record<string, unknown> = { repo_root: repoRoot }
      if (roots.length > 0) payload.roots = roots
      if (cfg) {
        payload.include_globs = cfg.include_globs
        payload.exclude_globs = cfg.exclude_globs
        payload.max_file_bytes = cfg.max_file_bytes
      }

      const res = await fetch(`${API_BASE}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchStatus()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Build failed')
    } finally {
      setBuildLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearchLoading(true)
    setSelectedChunk(null)
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, k: searchK, min_score: minScore }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleGetContext = async () => {
    if (!query.trim()) return
    try {
      const structured = contextStructured
      const res = await fetch(`${API_BASE}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          k: contextK,
          max_chars: contextMaxChars,
          include_sources: contextIncludeSources,
          include_scores: contextIncludeScores,
          min_score: minScore,
          structured,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (structured) {
        const meta = data as ContextStructuredResponse
        setContext(meta.context || '')
        setContextMeta(meta)
      } else {
        setContext(data.context || '')
        setContextMeta(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Context fetch failed')
    }
  }

  const handleCopyContext = async () => {
    if (!context) return
    try {
      await navigator.clipboard.writeText(context)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Copy failed')
    }
  }

  const handleCopyMcpConfig = async () => {
    if (!mcpConfigJson) return
    try {
      await navigator.clipboard.writeText(mcpConfigJson)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Copy failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
            <div className="flex items-center gap-2">
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
                className="p-2 rounded-md hover:bg-surface-raised transition border border-transparent hover:border-border"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </header>

          {error && (
            <div className="bg-error-muted border border-error rounded-lg p-4 flex items-center gap-2 text-error">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-error hover:opacity-80">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Card */}
            <IndexStatusCard
              stats={status?.index ?? { loaded: false }}
              building={status?.building}
              lastError={status?.last_error}
            />

            {/* Build Card */}
            <BuildCard
              repoRoot={repoRoot}
              onRepoRootChange={setRepoRoot}
              onBuild={handleBuild}
              building={buildLoading || status?.building}
            />

            <div className="bg-surface border border-border rounded-lg p-6 space-y-4 lg:col-span-2 shadow-sm">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Index Roots</h2>
                  <div className="text-xs text-text-muted">
                    core = always indexed, working = task-specific
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rootsFilter}
                    onChange={(e) => setRootsFilter(e.target.value)}
                    placeholder="Filter roots..."
                    className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary w-64"
                  />
                  <button
                    onClick={collapseAll}
                    className="bg-surface-raised hover:bg-surface rounded-md border border-border px-3 py-2 text-sm font-medium transition"
                  >
                    Collapse
                  </button>
                  <button
                    onClick={fetchAvailableRoots}
                    className="bg-surface-raised hover:bg-surface rounded-md border border-border px-3 py-2 text-sm font-medium transition"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-surface-raised border border-border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {availableRoots.length === 0 ? (
                    <div className="p-4 text-sm text-text-muted">No roots found.</div>
                  ) : (
                    <div className="py-1">
                      {tree.children.map((n) => {
                        const renderNode = (node: TreeNode): JSX.Element | null => {
                          const filter = rootsFilter.trim().toLowerCase()
                          if (!nodeVisible(node, filter)) return null

                          const hasChildren = node.children.length > 0
                          const isCollapsed = !!rootsCollapsed[node.key]
                          const isCore = !!uiConfig?.core_roots?.includes(node.key)
                          const isWorking = !!uiConfig?.working_roots?.includes(node.key)
                          const isChecked = isCore || isWorking

                          return (
                            <div key={node.key}>
                              <div
                                className="flex items-center gap-2 py-1 px-2 hover:bg-surface"
                                style={{ paddingLeft: `${Math.max(0, node.depth) * 16 + 8}px` }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    hasChildren &&
                                    setRootsCollapsed((prev) => ({
                                      ...prev,
                                      [node.key]: !prev[node.key],
                                    }))
                                  }
                                  className={`w-5 h-5 flex items-center justify-center border rounded bg-surface text-xs ${
                                    hasChildren
                                      ? 'border-border hover:border-primary'
                                      : 'border-transparent opacity-50'
                                  }`}
                                  disabled={!hasChildren}
                                >
                                  {hasChildren ? (isCollapsed ? '+' : '−') : ''}
                                </button>

                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={!uiConfig || isCore}
                                  onChange={(e) => void toggleRoot(node.key, e.target.checked)}
                                  className="accent-primary"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    hasChildren &&
                                    setRootsCollapsed((prev) => ({
                                      ...prev,
                                      [node.key]: !prev[node.key],
                                    }))
                                  }
                                  className="text-left flex-1 truncate text-sm"
                                  title={node.key}
                                >
                                  {node.name}
                                </button>

                                <div className="flex items-center gap-2 text-xs">
                                  {isCore && (
                                    <span className="px-2 py-0.5 rounded-full border border-success text-success bg-success-muted">
                                      core
                                    </span>
                                  )}
                                  {isWorking && !isCore && (
                                    <span className="px-2 py-0.5 rounded-full border border-warning text-warning bg-warning-muted">
                                      working
                                    </span>
                                  )}
                                  {node.isLeaf && (
                                    <span className="px-2 py-0.5 rounded-full border border-border text-text-muted">
                                      leaf
                                    </span>
                                  )}
                                </div>
                              </div>

                              {hasChildren && !isCollapsed && node.children.map(renderNode)}
                            </div>
                          )
                        }

                        return renderNode(n)
                      })}
                />
                include_scores
              </label>

              <label className="flex items-center gap-2 text-text">
                <input
                  type="checkbox"
                  checked={contextStructured}
                  onChange={(e) => setContextStructured(e.target.checked)}
                  className="accent-primary"
                />
                structured
              </label>
            </div>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-text-muted">Results ({searchResults.length})</h3>
                {searchResults.map((r, i) => (
                  <div
                    key={r.doc.id}
                    onClick={() => setSelectedChunk(r)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedChunk?.doc.id === r.doc.id
                        ? 'bg-primary-muted border border-primary'
                        : 'bg-surface-raised border border-border hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">#{i + 1}</span>
                      <span className="text-xs bg-surface px-2 py-0.5 rounded border border-border">
                        {r.score.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate">{r.doc.source_path}</div>
                    {r.doc.section && (
                      <div className="text-xs text-text-muted truncate">{r.doc.section}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-surface-raised border border-border rounded p-4 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {selectedChunk ? 'Chunk Content' : 'Select a result'}
                </h3>
                {selectedChunk ? (
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {selectedChunk.doc.content}
                  </pre>
                ) : (
                  <p className="text-text-muted text-sm">Click a result to view its content</p>
                )}
              </div>
            </div>
          )}

          {/* Context Output */}
          {context && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-muted">Assembled Context</h3>
                {contextMeta && (
                  <div className="text-xs text-text-subtle">
                    chunks={contextMeta.chunks?.length ?? 0} · chars={contextMeta.total_chars} · est_tokens={contextMeta.estimated_tokens}
                  </div>
                )}
              </div>
              <pre className="bg-surface-raised border border-border rounded p-4 text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {context}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Folder Tree */}
      <div className="w-80 border-l border-border bg-surface flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Project Files
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <FolderTreePanel
            roots={availableRoots}
            coreRoots={uiConfig?.core_roots || []}
            workingRoots={uiConfig?.working_roots || []}
            onToggleRoot={toggleRoot}
          />
        </div>
      </div>
    </div>
  )
}

interface FolderTreePanelProps {
  roots: string[]
  coreRoots: string[]
  workingRoots: string[]
  onToggleRoot: (rootKey: string, checked: boolean) => void
}

function FolderTreePanel({ roots, coreRoots, workingRoots, onToggleRoot }: FolderTreePanelProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  interface TreeNode {
    name: string
    path: string
    children: TreeNode[]
    isLeaf: boolean
  }

  const tree = useMemo(() => {
    const root: TreeNode = { name: '(root)', path: '', children: [], isLeaf: false }

    for (const fullPath of roots) {
      const parts = String(fullPath).split('/').filter(Boolean)
      let node = root
      let curPath = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        curPath = curPath ? `${curPath}/${part}` : part
        let child = node.children.find((c) => c.name === part)
        if (!child) {
          child = { name: part, path: curPath, children: [], isLeaf: false }
          node.children.push(child)
        }
        node = child
      }
      node.isLeaf = true
    }

    const sortTree = (n: TreeNode) => {
      n.children.sort((a, b) => a.name.localeCompare(b.name))
      n.children.forEach(sortTree)
    }
    sortTree(root)

    return root
  }, [roots])

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderNode = (node: TreeNode, depth: number): JSX.Element | null => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedPaths.has(node.path)
    const isCore = coreRoots.includes(node.path)
    const isWorking = workingRoots.includes(node.path)
    const isChecked = isCore || isWorking

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-1.5 py-1 px-1 hover:bg-gray-800 rounded text-sm cursor-pointer"
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleExpand(node.path)}
            className={`w-4 h-4 flex items-center justify-center ${hasChildren ? 'text-gray-400' : 'text-transparent'}`}
          >
            {hasChildren && (isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
          </button>

          <input
            type="checkbox"
            checked={isChecked}
            disabled={isCore}
            onChange={(e) => onToggleRoot(node.path, e.target.checked)}
            className="accent-blue-500 w-3.5 h-3.5"
          />

          <Folder className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />

          <span
            className="truncate text-gray-300 flex-1"
            title={node.path}
            onClick={() => hasChildren && toggleExpand(node.path)}
          >
            {node.name}
          </span>

          {isCore && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-400 border border-green-700/50">
              core
            </span>
          )}
          {isWorking && !isCore && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-400 border border-yellow-700/50">
              working
            </span>
          )}
        </div>

        {hasChildren && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  if (roots.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 text-center">
        No folders found.<br />
        Set a repository root to see available folders.
      </div>
    )
  }

  return <div>{tree.children.map((child) => renderNode(child, 0))}</div>
}

export default App
