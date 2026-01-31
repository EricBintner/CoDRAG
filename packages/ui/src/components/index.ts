/**
 * CoDRAG UI Components
 * 
 * Foundational wireframe components for the CoDRAG dashboard.
 * These are structural components - styling will be applied after
 * visual direction is finalized (Phase 13).
 */

// Status Components (Phase 01-02)
export { StatusBadge } from './status/StatusBadge';
export { StatusCard } from './status/StatusCard';
export { BuildProgress } from './status/BuildProgress';

// Navigation Components (Phase 01-02)
export { Sidebar } from './navigation/Sidebar';
export { ProjectList } from './navigation/ProjectList';
export { ProjectTabs } from './navigation/ProjectTabs';
export { AppShell } from './navigation/AppShell';

// Search Components (Phase 01-02)
export { SearchInput } from './search/SearchInput';
export { SearchResultRow } from './search/SearchResultRow';
export { ChunkViewer } from './search/ChunkViewer';

// Context Components (Phase 01-02)
export { ContextViewer } from './context/ContextViewer';
export { CitationBlock } from './context/CitationBlock';
export { CopyButton } from './context/CopyButton';

// Pattern Components - Shared States (Phase 01-02)
export { EmptyState } from './patterns/EmptyState';
export { LoadingState } from './patterns/LoadingState';
export { ErrorState } from './patterns/ErrorState';

// Project Management Components (Phase 01-02)
export { AddProjectModal } from './project/AddProjectModal';
export { ProjectSettingsPanel } from './project/ProjectSettingsPanel';

// Watch/Auto-Rebuild Components (Phase 03)
export { WatchStatusIndicator } from './watch/WatchStatusIndicator';

// Trace Index Components (Phase 04)
export { TraceStatusCard } from './trace/TraceStatusCard';
export { SymbolSearchInput } from './trace/SymbolSearchInput';
export { SymbolResultRow } from './trace/SymbolResultRow';
export { NodeDetailPanel } from './trace/NodeDetailPanel';

// LLM Service Components
export { LLMStatusCard } from './llm/LLMStatusCard';

// Team & Enterprise Components (Phase 06)
export { ServerModeIndicator } from './team/ServerModeIndicator';
export { TeamConfigStatus } from './team/TeamConfigStatus';
export { EmbeddedModeIndicator } from './team/EmbeddedModeIndicator';
export { LicenseStatusCard } from './team/LicenseStatusCard';
