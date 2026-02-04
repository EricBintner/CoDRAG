import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '../primitives/Button';

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
    <Button
      onClick={handleCopy}
      variant={copied ? "outline" : "ghost"}
      size="sm"
      className={cn(
        'text-xs font-medium transition-all',
        copied 
          ? 'bg-success-muted/10 text-success border-success-muted/30 hover:bg-success-muted/20 hover:text-success' 
          : 'text-text-muted hover:text-text',
        className
      )}
      icon={copied ? Check : Copy}
    >
      {copied ? 'Copied!' : label}
    </Button>
  );
}
