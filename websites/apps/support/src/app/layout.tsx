import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DevToolbar, SiteHeader, SiteFooter } from '@codrag/ui';

import '@codrag/ui/styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoDRAG Support',
  description: 'Support hub for CoDRAG: tickets, bugs, questions, and security reporting.',
};

const navLinks = [
  { label: 'Home', href: 'https://codrag.io' },
  { label: 'Docs', href: 'https://docs.codrag.io' },
  { label: 'Status', href: '/status' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const showDevToolbar = process.env.NODE_ENV !== 'production';

  return (
    <html lang="en" data-codrag-theme="a">
      <body className="flex flex-col min-h-screen bg-background text-text selection:bg-primary/20">
        <SiteHeader 
          productName="CoDRAG Support" 
          links={navLinks}
          actions={
            <a 
              href="mailto:support@codrag.io" 
              className="px-4 py-2 bg-surface border border-border text-text rounded-md text-sm font-medium hover:bg-surface-raised transition-colors"
            >
              Email Us
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
            email: 'support@codrag.io'
          }}
        />
        {showDevToolbar && <DevToolbar />}
      </body>
    </html>
  );
}
