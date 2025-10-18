import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useState } from 'react';

function App() {
  const { workspaces, createPage } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (workspaces.length === 0) {
      createPage('default', {
        title: 'Welcome to Notion Clone',
        icon: '📝',
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text' as const,
            content: 'This is a simple text block. Click to edit!',
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            type: 'heading' as const,
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
        <div className="flex h-screen bg-white">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/page/:pageId" element={<Editor />} />
          </Routes>
        </div>
      </Router>
      
      <DragOverlay>
        {activeId ? (
          <div className="opacity-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
            Dragging block...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;