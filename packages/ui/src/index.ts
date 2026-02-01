// CoDRAG UI - Shared Component Library
// This package provides the design system foundation for CoDRAG app and website

// Utilities
export { cn } from './lib/utils';

// Types
export type { StatusState, SearchResult, CodeChunk, ProjectSummary } from './types';

// Components - Status
export { StatusBadge, StatusCard, BuildProgress } from './components/status';
export type { StatusBadgeProps, StatusCardProps, BuildProgressProps } from './components/status';

// Components - Navigation
export { Sidebar, ProjectList, ProjectTabs, AppShell } from './components/navigation';
export type { SidebarProps, ProjectListProps, ProjectTabsProps, ProjectTab, AppShellProps } from './components/navigation';

// Components - Search
export { SearchInput, SearchResultRow, ChunkViewer, SearchPanel, ContextOptionsPanel, SearchResultsList, ChunkPreview, ContextOutput } from './components/search';
export type { SearchInputProps, SearchResultRowProps, ChunkViewerProps, SearchPanelProps, ContextOptionsPanelProps, SearchResultsListProps, ChunkPreviewProps, ContextOutputProps, ContextMeta } from './components/search';

// Components - Context
export { CopyButton, CitationBlock, ContextViewer } from './components/context';
export type { CopyButtonProps, CitationBlockProps, ContextViewerProps, ContextChunk } from './components/context';

// Components - Patterns (shared states)
export { EmptyState, LoadingState, ErrorState } from './components/patterns';
export type { EmptyStateProps, LoadingStateProps, ErrorStateProps } from './components/patterns';

// Components - Dashboard
export { IndexStatusCard, BuildCard } from './components/dashboard';
export type { IndexStatusCardProps, IndexStats, BuildCardProps } from './components/dashboard';

// Components - LLM
export { LLMStatusCard, ModelCard, EndpointManager, AIModelsSettings } from './components/llm';

// Components - Project
export { FolderTree, sampleFileTree } from './components/project';
export type { FolderTreeProps, TreeNode, FileStatus } from './components/project';

// API (typed client + Storybook mocking helpers)
export * from './api';
