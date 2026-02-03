import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DevToolbar, SiteHeader, SiteFooter } from '@codrag/ui';

import '@codrag/ui/styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoDRAG - Local-first Code Context',
  description: 'Semantic search and trace-aware context for your codebase. Local-first, no cloud required.',
};

const navLinks = [
  { label: 'Download', href: '/download' },
  { label: 'Docs', href: 'https://docs.codrag.io' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: 'https://support.codrag.io' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const showDevToolbar = process.env.NODE_ENV !== 'production';

  return (
    <html lang="en" data-codrag-theme="a">
      <body className="flex flex-col min-h-screen bg-background text-text selection:bg-primary/20">
        <SiteHeader 
          productName="CoDRAG" 
          links={navLinks} 
          actions={
            <a 
              href="/download" 
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
            >
              Get Started
            </a>
          }
        />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter 
          productName="CoDRAG"
          socials={{
            github: 'https://github.com/EricBintner/CoDRAG',
            email: 'hello@codrag.io'
          }}
        />
        {showDevToolbar && <DevToolbar />}
      </body>
    </html>
  );
}
