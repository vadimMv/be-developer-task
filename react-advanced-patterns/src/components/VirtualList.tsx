import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of extra items to render above/below viewport
  className?: string;
}

/**
 * VirtualList component that renders only visible items for performance
 *
 * Features:
 * - Windowing: Only renders visible items
 * - Scroll listener: Updates visible range on scroll
 * - Dynamic re-render optimization: Uses memo and careful state management
 * - Overscan: Renders extra items to prevent blank areas during fast scrolling
 *
 * @param items - Array of items to render
 * @param itemHeight - Height of each item in pixels
 * @param height - Height of the scrollable container
 * @param renderItem - Function to render each item
 * @param overscan - Number of extra items to render (default: 3)
 */
function VirtualListComponent<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Handle scroll with throttling for better performance
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Set up scroll listener with throttling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const throttledScroll = (event: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll(event);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
      }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {/* Visible items */}
        <div
          style={{
            position: 'absolute',
            top: `${startIndex * itemHeight}px`,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: `${itemHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent;
