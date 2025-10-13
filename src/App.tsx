// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIChat } from './components/ai/AiChat';

function App() {
  const { workspaces, createPage } = useStore();
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    if (workspaces.length === 0) {
      createPage('default', {
        title: 'Welcome to Notion Clone with AI',
        icon: '🤖',
        blocks: [
          {
            id: crypto.randomUUID(),
            type: 'text' as const,
            content: 'Это блок текста. Вы можете редактировать его, а также использовать AI ассистент для улучшения!',
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            type: 'heading' as const,
            content: 'AI Ассистент',
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            type: 'text' as const,
            content: 'Нажмите на кнопку с иконкой робота в правом нижнем углу чтобы открыть AI ассистент на базе Cohere API.',
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

        {/* AI Chat Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAIChat(!showAIChat)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 border-2 border-white"
          style={{
            boxShadow: '0 4px 20px rgba(147, 51, 234, 0.4)'
          }}
        >
          <Bot className="w-6 h-6" />
        </motion.button>

        {/* AI Chat Sidebar */}
        <AnimatePresence>
          {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;