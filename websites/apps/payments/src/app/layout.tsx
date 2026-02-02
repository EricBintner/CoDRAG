import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@codrag/ui';

import '@codrag/ui/styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoDRAG Payments',
  description: 'Purchase and manage CoDRAG licenses.',
};

const navLinks = [
  { label: 'Home', href: 'https://codrag.io' },
  { label: 'Pricing', href: 'https://codrag.io/pricing' },
  { label: 'Support', href: 'https://support.codrag.io' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-codrag-theme="a">
      <body className="flex flex-col min-h-screen bg-background text-text selection:bg-primary/20">
        <SiteHeader 
          productName="CoDRAG Payments" 
          links={navLinks}
        />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter 
          productName="CoDRAG"
          socials={{
            email: 'licenses@codrag.io'
          }}
        />
      </body>
    </html>
  );
}
