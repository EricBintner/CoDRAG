import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

/**
 * CopyButton - Copy text to clipboard
 * 
 * Provides:
 * - Click to copy functionality
 * - Feedback state (copied confirmation)
 */
export function CopyButton({
  text,
  label = 'Copy',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

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
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
        'border border-border',
        copied 
          ? 'bg-success-muted/10 text-success border-success-muted/30' 
          : 'bg-surface hover:bg-surface-raised text-text-muted hover:text-text',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
