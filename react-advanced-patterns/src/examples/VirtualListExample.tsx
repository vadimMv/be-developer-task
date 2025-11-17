import React, { useMemo } from 'react';
import { VirtualList } from '../components/VirtualList';

interface Item {
  id: number;
  name: string;
  description: string;
}

export function VirtualListExample() {
  // Generate large dataset
  const items = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i + 1}`,
        description: `Description for item ${i + 1}`,
      })),
    []
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>VirtualList Component Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        Rendering 10,000 items efficiently using windowing. Only visible items are rendered.
      </p>

      <VirtualList
        items={items}
        itemHeight={60}
        height={400}
        renderItem={(item: Item) => (
          <div>
            <div style={{ fontWeight: 500 }}>{item.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {item.description}
            </div>
          </div>
        )}
      />

      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
        Total items: {items.length.toLocaleString()}
      </p>
    </div>
  );
}
