import React, { useState } from 'react';
import { useOptimisticList } from '../hooks/useOptimisticUpdate';

interface Post {
  id: string | number;
  title: string;
  liked: boolean;
  likes: number;
}

// Simulate API calls
const simulateApiCall = <T,>(data: T, shouldFail = false): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API call failed'));
      } else {
        resolve(data);
      }
    }, 1000);
  });
};

export function OptimisticUpdateExample() {
  const initialPosts: Post[] = [
    { id: 1, title: 'Introduction to React', liked: false, likes: 10 },
    { id: 2, title: 'Advanced TypeScript', liked: false, likes: 25 },
    { id: 3, title: 'Web Performance', liked: true, likes: 42 },
  ];

  const { list, isPending, updateItem, rollback } = useOptimisticList(initialPosts);
  const [shouldFail, setShouldFail] = useState(false);

  const handleLike = async (post: Post) => {
    try {
      await updateItem(
        post.id,
        { liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 },
        () => {
          // Simulate API call
          const updatedList = list.map((p) =>
            p.id === post.id
              ? { ...p, liked: !post.liked, likes: post.liked ? p.likes - 1 : p.likes + 1 }
              : p
          );
          return simulateApiCall(updatedList, shouldFail);
        }
      );
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Optimistic UI Updates Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        UI updates instantly, then syncs with server. Toggle "Simulate Failure" to see rollback.
      </p>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
          />
          Simulate API Failure
        </label>
        {isPending && (
          <span
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            Syncing...
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {list.map((post) => (
          <div
            key={post.id}
            style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {post.likes} {post.likes === 1 ? 'like' : 'likes'}
              </p>
            </div>
            <button
              onClick={() => handleLike(post)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: post.liked ? '#ef4444' : '#e5e7eb',
                color: post.liked ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {post.liked ? '❤️ Liked' : '🤍 Like'}
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Features:</p>
        <ul style={{ marginLeft: '1.5rem', color: '#6b7280' }}>
          <li>UI updates instantly when clicking like</li>
          <li>API call happens in background</li>
          <li>Automatically rolls back on error</li>
          <li>Keeps server and client data in sync</li>
        </ul>
      </div>
    </div>
  );
}
