"use client";

import type { ReactNode } from 'react';
import { DevToolbar, DocsLayout } from '@codrag/ui';
import { docsSidebar } from '../config/docs';

import '@codrag/ui/styles';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const showDevToolbar = process.env.NODE_ENV !== 'production';

  return (
    <html lang="en" data-codrag-theme="a">
      <body className="bg-background text-text selection:bg-primary/20">
        <DocsLayout
          headerProps={{
            productName: 'CoDRAG Docs',
            links: [
              { label: 'Home', href: 'https://codrag.io' },
              { label: 'Download', href: 'https://codrag.io/download' },
              { label: 'Support', href: 'https://support.codrag.io' },
            ],
            searchPlaceholder: 'Search documentation...',
            onSearch: (query) => {
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            },
          }}
          footerProps={{
            productName: 'CoDRAG',
            socials: {
              github: 'https://github.com/EricBintner/CoDRAG',
              email: 'docs@codrag.io',
            },
          }}
          sidebarItems={docsSidebar}
        >
          {children}
        </DocsLayout>
        {showDevToolbar && <DevToolbar />}
      </body>
    </html>
  );
}
