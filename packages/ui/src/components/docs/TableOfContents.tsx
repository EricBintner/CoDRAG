import { cn } from '../../lib/utils';

export interface TocItem {
  title: string;
  href: string;
  level: 1 | 2 | 3;
  active?: boolean;
}

export interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  if (!items.length) return null;

  return (
    <div className={cn('text-sm', className)}>
      <h4 className="font-medium text-text mb-3">On this page</h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
            <a
              href={item.href}
              className={cn(
                'block transition-colors border-l-2 pl-3 -ml-[14px]',
                item.active
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-text-muted hover:text-text'
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
