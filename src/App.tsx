import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { EnhancedSearch } from './components/comments/search/EnhancedSearch';
import { UndoRedo } from './components/ui/UndoRedo';

function App() {
  const { workspaces, createPage, currentPage } = useStore();
  const { currentTheme, themes } = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Применяем тему при загрузке и изменении
  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      root.setAttribute('data-theme', theme.type);
    }
  }, [currentTheme, themes]);

  useEffect(() => {
    if (workspaces.length > 0 && workspaces[0].pages.length === 0) {
      createPage('default', {
        title: 'Welcome to Notion Clone',
        icon: '📝',
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'This is a simple text block. Click to edit!',
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            type: 'heading',
            content: 'This is a heading',
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
    }
  }, [workspaces.length, createPage]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      console.log('Moved block:', active.id, 'to position of:', over?.id);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Router>
        <div className="flex h-screen bg-background">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <div className="flex items-center gap-4">
                {/* Enhanced Search in Top Bar */}
                <EnhancedSearch />
                
                {/* Page Title */}
                {currentPage && (
                  <h1 className="text-xl font-semibold text-text">
                    {currentPage.title}
                  </h1>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Undo/Redo Controls */}
                <UndoRedo />
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Editor />} />
                <Route path="/page/:pageId" element={<Editor />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
      
      <DragOverlay>
        {activeId ? (
          <div 
            className="opacity-50 rounded-lg p-4 shadow-lg border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            Dragging block...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;