import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@codrag/ui/styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoDRAG',
  description: 'Local-first semantic code search and codebase intelligence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-codrag-theme="a">
      <body>{children}</body>
    </html>
  );
}
