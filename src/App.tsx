import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const { workspaces, createPage } = useStore();

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

  return (
    <Router>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/page/:pageId" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;