import React, { useState, memo } from 'react';
import { ThemeContext, ThemeState } from '../contexts/createContextSelector';

// Component that only reads mode - will only re-render when mode changes
const ModeDisplay = memo(() => {
  const mode = ThemeContext.useSelector((s) => s.mode);
  const renderCount = React.useRef(0);
  renderCount.current++;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.375rem' }}>
      <h4>Mode Display Component</h4>
      <p>Mode: {mode}</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Render count: {renderCount.current}
      </p>
    </div>
  );
});

ModeDisplay.displayName = 'ModeDisplay';

// Component that only reads color - will only re-render when color changes
const ColorDisplay = memo(() => {
  const color = ThemeContext.useSelector((s) => s.primaryColor);
  const renderCount = React.useRef(0);
  renderCount.current++;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem' }}>
      <h4>Color Display Component</h4>
      <p>Color: <span style={{ color }}>{color}</span></p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Render count: {renderCount.current}
      </p>
    </div>
  );
});

ColorDisplay.displayName = 'ColorDisplay';

// Component that only reads fontSize - will only re-render when fontSize changes
const FontSizeDisplay = memo(() => {
  const fontSize = ThemeContext.useSelector((s) => s.fontSize);
  const renderCount = React.useRef(0);
  renderCount.current++;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#e9d5ff', borderRadius: '0.375rem' }}>
      <h4>Font Size Display Component</h4>
      <p style={{ fontSize: `${fontSize}px` }}>Font Size: {fontSize}px</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Render count: {renderCount.current}
      </p>
    </div>
  );
});

FontSizeDisplay.displayName = 'FontSizeDisplay';

export function ContextSelectorExample() {
  const [theme, setTheme] = useState<ThemeState>({
    mode: 'light',
    primaryColor: '#3b82f6',
    fontSize: 16,
  });

  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const changeColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const currentIndex = colors.indexOf(theme.primaryColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setTheme((prev) => ({ ...prev, primaryColor: colors[nextIndex] }));
  };

  const changeFontSize = () => {
    setTheme((prev) => ({
      ...prev,
      fontSize: prev.fontSize === 16 ? 20 : 16,
    }));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Context Selector Example</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
        Each component below only re-renders when its selected slice of state changes.
        Watch the render counts!
      </p>

      <ThemeContext.Provider value={theme}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={toggleMode}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Toggle Mode
          </button>
          <button
            onClick={changeColor}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Change Color
          </button>
          <button
            onClick={changeFontSize}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Change Font Size
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <ModeDisplay />
          <ColorDisplay />
          <FontSizeDisplay />
        </div>
      </ThemeContext.Provider>
    </div>
  );
}
