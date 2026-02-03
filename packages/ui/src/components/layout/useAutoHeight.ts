import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoHeightOptions {
  rowHeight: number;
  marginY: number;
  minHeight?: number;
  onHeightChange?: (gridUnits: number) => void;
}

/**
 * Hook to measure content height and convert to grid units.
 * Returns a ref to attach to the content container and the calculated grid height.
 * 
 * Grid height formula (react-grid-layout):
 *   pixelHeight = h * rowHeight + (h - 1) * marginY
 * 
 * Solving for h:
 *   h = (pixelHeight + marginY) / (rowHeight + marginY)
 */
export function useAutoHeight({
  rowHeight,
  marginY,
  minHeight = 1,
  onHeightChange,
}: UseAutoHeightOptions) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(minHeight);

  const calculateGridHeight = useCallback((contentHeight: number) => {
    // Convert pixel height to grid units, rounding up
    // Formula: h = ceil((contentHeight + marginY) / (rowHeight + marginY))
    const h = Math.ceil((contentHeight + marginY) / (rowHeight + marginY));
    return Math.max(h, minHeight);
  }, [rowHeight, marginY, minHeight]);

  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentHeight = entry.contentRect.height;
        const newGridHeight = calculateGridHeight(contentHeight);
        
        if (newGridHeight !== gridHeight) {
          setGridHeight(newGridHeight);
          onHeightChange?.(newGridHeight);
        }
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [calculateGridHeight, gridHeight, onHeightChange]);

  return { contentRef, gridHeight };
}
