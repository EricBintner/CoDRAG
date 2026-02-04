// CoDRAG UI - Shared Component Library
// This package provides the design system foundation for CoDRAG app and website

// Utilities
export { cn } from './lib/utils';

// Types
export type { 
  StatusState, 
  SearchResult, 
  CodeChunk, 
  ProjectSummary, 
  ProjectConfig, 
  LLMConfig, 
  SavedEndpoint, 
  EndpointTestResult,
  ProjectStatus,
  ApiError
} from './types';

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
export { IndexStatusCard, BuildCard, IndexStatsDisplay, LLMStatusWidget } from './components/dashboard';
export type { IndexStatusCardProps, IndexStats, BuildCardProps, IndexStatsProps, StatItem, LLMStatusWidgetProps, LLMServiceStatus } from './components/dashboard';

// Components - LLM
export { ModelCard, EndpointManager, AIModelsSettings } from './components/llm';

// Components - Project
export { FolderTree, sampleFileTree, ProjectSettingsPanel, FolderTreePanel, PinnedTextFilesPanel } from './components/project';
export type { FolderTreeProps, TreeNode, FileStatus, ProjectSettingsPanelProps, FolderTreePanelProps, PinnedTextFilesPanelProps, PinnedTextFile } from './components/project';

// Components - Layout (Modular Dashboard - Phase 15)
export { PanelChrome, DashboardGrid, PanelPicker, ModularDashboard, useLayoutPersistence } from './components/layout';
export type { PanelChromeProps, DashboardGridProps, PanelPickerProps, ModularDashboardProps, PanelContentMap } from './components/layout';

// Components - Marketing & Site (Phase 12)
export { MarketingHero, FeatureBlocks } from './components/marketing';
export type { MarketingHeroProps, FeatureBlocksProps, Feature } from './components/marketing';
export { SiteHeader, SiteFooter } from './components/site';
export type { SiteHeaderProps, SiteFooterProps, NavLink, FooterSection, FooterLink } from './components/site';

// Components - Docs (Phase 12)
export { DocsLayout, DocsSidebarNav, TableOfContents } from './components/docs';
export type { DocsLayoutProps, DocsSidebarNavProps, DocNode, TableOfContentsProps, TocItem } from './components/docs';

// Layout Types (Phase 15)
export type { 
  PanelConfig, 
  DashboardLayout, 
  PanelCategory, 
  PanelDefinition, 
  PanelProps, 
  GridLayoutItem 
} from './types/layout';
export { DEFAULT_LAYOUT, LAYOUT_STORAGE_KEY, toGridLayout, fromGridLayout } from './types/layout';

// Panel Registry (Phase 15)
export { PANEL_REGISTRY, getPanelDefinition, getPanelsByCategory } from './config/panelRegistry';

// API (typed client + Storybook mocking helpers)
export * from './api';
