# React Advanced Patterns - TypeScript Implementation

A comprehensive implementation of advanced React patterns using TypeScript, showcasing best practices for building scalable and maintainable React applications.

## Features

This project demonstrates 8 advanced React patterns:

### 1. TextField Component (Controlled/Uncontrolled)
**Location**: `src/components/TextField.tsx`

A reusable text field component that supports both controlled and uncontrolled modes with additional features:

- **Controlled mode**: Pass `value` and `onChange` props
- **Uncontrolled mode**: Pass `defaultValue` and use `ref` to access the input
- **forwardRef support**: Direct DOM access via refs
- **Debounced onChange**: Configurable debounce delay for performance optimization
- **Built-in validation**: Error display and styling

```typescript
// Controlled
<TextField value={value} onChange={setValue} />

// Uncontrolled with ref
<TextField ref={inputRef} defaultValue="default" />

// Debounced
<TextField onDebouncedChange={handleSearch} debounceMs={500} />
```

### 2. useFetchWithCache Hook
**Location**: `src/hooks/useFetchWithCache.ts`

Custom hook for data fetching with built-in caching mechanism:

- **URL-based caching**: Caches responses by URL
- **Request cancellation**: Uses AbortController to cancel requests on unmount
- **Refetch capability**: Manual refetch function for fresh data
- **Configurable cache time**: Set custom cache expiration
- **Loading, error, and data states**: Complete async state management

```typescript
const { data, loading, error, refetch } = useFetchWithCache('/api/users', {
  cacheTime: 5 * 60 * 1000, // 5 minutes
});
```

### 3. VirtualList Component
**Location**: `src/components/VirtualList.tsx`

High-performance list rendering using windowing technique:

- **Windowing**: Only renders visible items
- **Scroll optimization**: Throttled scroll listener with requestAnimationFrame
- **Overscan support**: Renders extra items to prevent blank areas
- **Memoization**: Optimized to prevent unnecessary re-renders
- **Dynamic re-rendering**: Efficient updates on scroll

```typescript
<VirtualList
  items={largeArray}
  itemHeight={60}
  height={400}
  renderItem={(item) => <div>{item.name}</div>}
  overscan={3}
/>
```

### 4. ErrorBoundary Component
**Location**: `src/components/ErrorBoundary.tsx`

React error boundary with auto-retry functionality:

- **Error catching**: Catches render errors in child components
- **Retry mechanism**: Built-in retry button
- **State reset**: Resets internal state on retry
- **Custom fallback UI**: Configurable error display
- **Error logging**: Optional error callback for logging services

```typescript
<ErrorBoundary
  fallback={<ErrorUI />}
  onRetry={resetApp}
  onError={(error, errorInfo) => logToService(error)}
>
  <App />
</ErrorBoundary>
```

### 5. Context Selector Pattern
**Location**: `src/contexts/createContextSelector.tsx`

Memoized context system that prevents unnecessary re-renders:

- **Selective subscriptions**: Components only re-render when selected state changes
- **useSyncExternalStore**: Built on React 18's concurrent features
- **Referential equality**: Efficient change detection
- **Type-safe selectors**: Full TypeScript support

```typescript
const ThemeContext = createContextSelector({ mode: 'light', color: 'blue' });

// Only re-renders when mode changes
const mode = ThemeContext.useSelector(s => s.mode);
```

### 6. Dynamic Form Engine
**Location**: `src/components/DynamicForm.tsx`

Schema-based form rendering with validation:

- **JSON configuration**: Define forms with configuration objects
- **Built-in validation**: Required, min, max, pattern, custom validators
- **Multiple field types**: Text, number, email, select, textarea, checkbox
- **Controlled state**: Internal state management
- **Type-safe**: Full TypeScript support with generics

```typescript
const fields: FieldConfig[] = [
  {
    type: 'text',
    name: 'firstName',
    label: 'First Name',
    validation: { required: true, minLength: 2 }
  },
  {
    type: 'email',
    name: 'email',
    validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
  }
];

<DynamicForm fields={fields} onSubmit={handleSubmit} />
```

### 7. useAsync Hook
**Location**: `src/hooks/useAsync.ts`

Safe async state management with cleanup:

- **Unmount safety**: Prevents state updates after unmount
- **Promise cancellation**: Cancels pending operations on cleanup
- **Parallel tasks**: Supports multiple concurrent async operations
- **Manual reset**: Reset to initial state
- **Type-safe**: Generic type support

```typescript
const { run, data, loading, error, reset } = useAsync<User>();

const fetchUser = () => {
  run(fetch('/api/user').then(r => r.json()));
};
```

### 8. Optimistic UI Updates
**Location**: `src/hooks/useOptimisticUpdate.ts`

Optimistic update pattern for better UX:

- **Instant UI updates**: Updates UI before server response
- **Automatic rollback**: Reverts changes on error
- **Sync management**: Keeps client and server data in sync
- **List operations**: Convenient methods for CRUD operations

```typescript
const { list, updateItem } = useOptimisticList(posts);

const handleLike = (post) => {
  updateItem(post.id, { liked: true }, () => api.likePost(post.id));
};
```

### 9. useWebSocket Hook
**Location**: `src/hooks/useWebSocket.ts`

WebSocket connection management with auto-reconnect:

- **Exponential backoff**: Smart reconnection strategy
- **Message queuing**: Queues messages while disconnected
- **Auto-cleanup**: Proper cleanup on unmount
- **Connection state**: Tracks connected, connecting, and error states
- **Manual controls**: Connect, disconnect, and reconnect functions

```typescript
const { send, messages, connected } = useWebSocket('ws://localhost:8080', {
  reconnect: true,
  reconnectAttempts: 5,
  onMessage: (msg) => console.log(msg),
});
```

## Project Structure

```
react-advanced-patterns/
├── src/
│   ├── components/
│   │   ├── TextField.tsx
│   │   ├── VirtualList.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── DynamicForm.tsx
│   ├── hooks/
│   │   ├── useFetchWithCache.ts
│   │   ├── useAsync.ts
│   │   ├── useOptimisticUpdate.ts
│   │   └── useWebSocket.ts
│   ├── contexts/
│   │   └── createContextSelector.tsx
│   ├── examples/
│   │   ├── TextFieldExample.tsx
│   │   ├── VirtualListExample.tsx
│   │   ├── ErrorBoundaryExample.tsx
│   │   ├── ContextSelectorExample.tsx
│   │   ├── DynamicFormExample.tsx
│   │   ├── AsyncExample.tsx
│   │   ├── OptimisticUpdateExample.tsx
│   │   └── WebSocketExample.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
cd react-advanced-patterns
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Key Concepts Demonstrated

### 1. Controlled vs Uncontrolled Components
Understanding when to use each pattern and how to support both in a single component.

### 2. Custom Hooks
Creating reusable logic with hooks, including cleanup and cancellation patterns.

### 3. Performance Optimization
- Memoization with `memo`, `useMemo`, `useCallback`
- Virtual scrolling for large lists
- Context optimization with selectors
- Debouncing for expensive operations

### 4. Error Handling
- Error boundaries for component errors
- Graceful degradation
- Retry mechanisms

### 5. Async State Management
- Safe async operations
- Loading and error states
- Request cancellation
- Optimistic updates

### 6. Real-time Communication
- WebSocket management
- Reconnection strategies
- Message queuing

### 7. Type Safety
Full TypeScript implementation with:
- Generic types
- Type inference
- Strict null checks
- Proper typing for React components and hooks

## Best Practices Demonstrated

1. **Separation of Concerns**: Components, hooks, and contexts are properly separated
2. **Reusability**: All patterns are designed to be reusable across projects
3. **Type Safety**: Comprehensive TypeScript usage
4. **Performance**: Optimization techniques throughout
5. **Error Handling**: Proper error boundaries and async error handling
6. **Cleanup**: Proper cleanup in useEffect hooks
7. **Documentation**: Extensive JSDoc comments
8. **Examples**: Complete working examples for each pattern

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Created as a comprehensive demonstration of advanced React patterns with TypeScript.
