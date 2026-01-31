import * as React from 'react';
import { Button } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

/**
 * CopyButton - Copy text to clipboard
 * 
 * Wireframe component - provides:
 * - Click to copy functionality
 * - Feedback state (copied confirmation)
 */
export function CopyButton({
  text,
  label = 'Copy',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="secondary"
      size="xs"
      onClick={handleCopy}
      className={cn('codrag-copy-button', className)}
    >
      {copied ? 'Copied!' : label}
    </Button>
  );
}
