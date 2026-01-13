import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';
import { useTheme, applyThemeToDocument } from './hooks/useTheme';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { EnhancedSearch } from './components/comments/search/EnhancedSearch';
import { WebClipper } from './components/web/WebClipper';
import { WebClipperButton } from './components/web/WebClipperButton';
import { OfflineStatus } from './components/ui/OfflineStatus';
import { Menu } from 'lucide-react';

function App() {
  const { workspaces, createPage, sidebarOpen, setSidebarOpen, initializeOffline } = useStore();
  const { currentTheme, themes } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

useEffect(() => {
  const theme = themes.find(t => t.id === currentTheme);
  if (theme) {
    applyThemeToDocument(theme);
  }
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
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentTheme]);

  return (
    <Router>
      <div className="flex h-screen bg-background safe-area-inset">
        {sidebarOpen && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Sidebar isSidebarOpen={sidebarOpen} />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0 w-full">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background safe-area-inset-top pt-6 lg:pt-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors text-text flex-shrink-0 mt-3"
              >
                <Menu className="w-5 h-5" />
              </button>
                  {!sidebarOpen && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="hidden lg:flex p-2 rounded-lg hover:bg-hover transition-colors text-text flex-shrink-0"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  )}
              <div className="hidden lg:block flex-1 max-w-2xl">
                <EnhancedSearch />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-3 lg:mt-0.5">
              <OfflineStatus />
              <div className="hidden sm:block">
                <WebClipperButton />
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex-1 overflow-auto w-full">
            <Routes>
              <Route path="/" element={<Editor />} />
              <Route path="/page/:pageId" element={<Editor />} />
            </Routes>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className={`fixed inset-y-0 left-0 z-50 lg:hidden w-80 max-w-[85vw] transform transition-transform duration-100 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } safe-area-inset-top`}>
          <div className="pt-4 lg:pt-0 h-full">
            <Sidebar
              isSidebarOpen={isMobileMenuOpen}
              onMobileClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>

        <WebClipper />
      </div>
    </Router>
  );
}

export default App;
