import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { EnhancedSearch } from './components/comments/search/EnhancedSearch';
import { UndoRedo } from './components/ui/UndoRedo';
import { applyThemeToDocument } from './hooks/useTheme';
import { WebClipper } from './components/web/WebClipper';
import { WebClipperButton } from './components/web/WebClipperButton';
import { AnimatePresence, motion } from 'framer-motion';
import { Loading } from './components/ui/Loading';
import { OfflineStatus } from './components/ui/OfflineStatus';

function App() {
  const { workspaces, createPage, currentPage, sidebarOpen, setSidebarOpen, initializeOffline } = useStore();
  const { currentTheme, themes } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      applyThemeToDocument(theme);
    }
  }, [currentTheme, themes]);

  useEffect(() => {
    initializeOffline();

    if (workspaces.length > 0 && workspaces[0].pages.length === 0) {
      createPage('default', {
        title: 'Welcome to Notion Clone',
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
  }, [workspaces, createPage, initializeOffline]); // Добавил workspaces в зависимости

  const handleAppLoad = () => {
    setAppLoaded(true);
  };

  return (
    <>
      <Loading onLoadComplete={handleAppLoad} />
      
      <AnimatePresence>
        {appLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Router>
              <div className="flex h-screen bg-background">
                {/* Desktop Sidebar */}
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ x: -320, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -320, opacity: 0 }}
                      transition={{ 
                        type: "tween",
                        duration: 0.2,
                        ease: "easeInOut" as const
                      }}
                      className="hidden lg:block w-80 flex-shrink-0"
                    >
                      <Sidebar />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Mobile Menu Button */}
                      <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors text-text"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>

                      {/* Desktop Menu Button */}
                      {!sidebarOpen && (
                        <button
                          onClick={() => setSidebarOpen(true)}
                          className="hidden lg:flex p-2 rounded-lg hover:bg-hover transition-colors text-text"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Enhanced Search */}
                      <div className="flex-1 max-w-2xl">
                        <EnhancedSearch />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                      {/* Offline Status */}
                      <OfflineStatus />
                      
                      {/* Page Title for mobile */}
                      {currentPage && (
                        <h1 className="text-sm font-semibold text-text lg:hidden truncate max-w-[120px]">
                          {currentPage.title}
                        </h1>
                      )}
                      
                      {/* Web Clipper Button */}
                      <div className="hidden sm:block">
                        <WebClipperButton />
                      </div>
                      
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

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  )}
                </AnimatePresence>
                
                {/* Mobile Sidebar */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div
                      initial={{ x: -320, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -320, opacity: 0 }}
                      transition={{ 
                        type: "tween",
                        duration: 0.2,
                        ease: "easeInOut" as const
                      }}
                      className="fixed inset-y-0 left-0 z-50 lg:hidden"
                    >
                      <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Web Clipper Modal */}
                <WebClipper />
              </div>
            </Router>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;