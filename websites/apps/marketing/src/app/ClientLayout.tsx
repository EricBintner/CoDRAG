"use client";

import type { ReactNode } from 'react';
import { SiteHeader, SiteFooter } from '@codrag/ui';

const navLinks = [
  { label: 'Download', href: '/download' },
  { label: 'Docs', href: 'https://docs.codrag.io' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: 'https://support.codrag.io' },
];

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
