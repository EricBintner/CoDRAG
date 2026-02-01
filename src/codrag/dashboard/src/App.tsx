import { useState, useEffect, useCallback } from 'react'
import { Search, Database, RefreshCw, FileText, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react'

const API_BASE = '/api/code-index'

interface IndexStats {
  loaded: boolean
  index_dir?: string
  model?: string
  built_at?: string
  total_documents?: number
  embedding_dim?: number
}

interface StatusResponse {
  index: IndexStats
  building: boolean
  last_build: Record<string, unknown> | null
  last_error: string | null
  context_defaults?: {
    k: number
    max_chars: number
  }
  config: {
    repo_root: string | null
    index_dir: string | null
    ollama_url: string | null
    model: string | null
  }
}

interface SearchResult {
  doc: {
    id: string
    source_path: string
    section: string
    content: string
  }
  score: number
}

interface ContextChunkMeta {
  source_path: string
  section: string
  score: number
  truncated: boolean
}

interface ContextStructuredResponse {
  context: string
  chunks: ContextChunkMeta[]
  total_chars: number
  estimated_tokens: number
}

function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
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
  const [contextMeta, setContextMeta] = useState<ContextStructuredResponse | null>(null)

  const [contextDefaultsLoaded, setContextDefaultsLoaded] = useState(false)

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

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const handleBuild = async () => {
    if (!repoRoot.trim()) {
      setError('Repository root is required')
      return
    }
    setBuildLoading(true)
    try {
      const res = await fetch(`${API_BASE}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_root: repoRoot }),
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Code Index Dashboard
          </h1>
          <button
            onClick={fetchStatus}
            className="p-2 rounded hover:bg-gray-800 transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Index Status
              {status?.index?.loaded ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              )}
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Loaded:</span>
                <span>{status?.index?.loaded ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Documents:</span>
                <span>{status?.index?.total_documents ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="truncate ml-2">{status?.index?.model ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Built:</span>
                <span className="truncate ml-2">
                  {status?.index?.built_at
                    ? new Date(status.index.built_at).toLocaleString()
                    : '-'}
                </span>
              </div>
              {status?.building && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building...
                </div>
              )}
              {status?.last_error && (
                <div className="text-red-400 text-xs mt-2">
                  Error: {status.last_error}
                </div>
              )}
            </div>
          </div>

          {/* Build Card */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Build Index</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Repository Root</label>
                <input
                  type="text"
                  value={repoRoot}
                  onChange={(e) => setRepoRoot(e.target.value)}
                  placeholder="/path/to/repo"
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleBuild}
                disabled={buildLoading || status?.building}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded px-4 py-2 font-medium transition flex items-center justify-center gap-2"
              >
                {(buildLoading || status?.building) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {status?.building ? 'Building...' : 'Build Index'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </h2>

          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search query..."
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={searchK}
              onChange={(e) => setSearchK(parseInt(e.target.value) || 8)}
              min={1}
              max={50}
              className="w-20 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Number of results"
            />
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value) || 0.15)}
              min={0}
              max={1}
              step={0.05}
              className="w-24 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Minimum score"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded px-4 py-2 font-medium transition flex items-center gap-2"
            >
              {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Search
            </button>
          </div>

          <div className="bg-gray-700/40 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Context Options</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGetContext}
                  disabled={!query.trim()}
                  className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded px-4 py-2 text-sm font-medium transition"
                >
                  Get Context
                </button>
                <button
                  onClick={handleCopyContext}
                  disabled={!context}
                  className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-700 disabled:cursor-not-allowed rounded px-3 py-2 text-sm font-medium transition flex items-center gap-2"
                  title="Copy context"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">k</span>
                <input
                  type="number"
                  value={contextK}
                  onChange={(e) => setContextK(parseInt(e.target.value) || 5)}
                  min={1}
                  max={50}
                  className="w-20 bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400">max_chars</span>
                <input
                  type="number"
                  value={contextMaxChars}
                  onChange={(e) => setContextMaxChars(parseInt(e.target.value) || 6000)}
                  min={200}
                  max={200000}
                  className="w-28 bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={contextIncludeSources}
                  onChange={(e) => setContextIncludeSources(e.target.checked)}
                  className="accent-blue-500"
                />
                include_sources
              </label>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={contextIncludeScores}
                  onChange={(e) => setContextIncludeScores(e.target.checked)}
                  className="accent-blue-500"
                />
                include_scores
              </label>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={contextStructured}
                  onChange={(e) => setContextStructured(e.target.checked)}
                  className="accent-blue-500"
                />
                structured
              </label>
            </div>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400">Results ({searchResults.length})</h3>
                {searchResults.map((r, i) => (
                  <div
                    key={r.doc.id}
                    onClick={() => setSelectedChunk(r)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedChunk?.doc.id === r.doc.id
                        ? 'bg-blue-900/50 border border-blue-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">#{i + 1}</span>
                      <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">
                        {r.score.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate">{r.doc.source_path}</div>
                    {r.doc.section && (
                      <div className="text-xs text-gray-400 truncate">{r.doc.section}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 rounded p-4 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {selectedChunk ? 'Chunk Content' : 'Select a result'}
                </h3>
                {selectedChunk ? (
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {selectedChunk.doc.content}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">Click a result to view its content</p>
                )}
              </div>
            </div>
          )}

          {/* Context Output */}
          {context && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Assembled Context</h3>
                {contextMeta && (
                  <div className="text-xs text-gray-500">
                    chunks={contextMeta.chunks?.length ?? 0} · chars={contextMeta.total_chars} · est_tokens={contextMeta.estimated_tokens}
                  </div>
                )}
              </div>
              <pre className="bg-gray-700 rounded p-4 text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {context}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
