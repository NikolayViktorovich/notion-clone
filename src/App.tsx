import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { Editor } from './components/Editor';
import { useStore } from './store/useStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme, applyThemeToDocument } from './hooks/useTheme';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { EnhancedSearch } from './components/comments/search/EnhancedSearch';
import { LanguageSwitcher } from './components/ui/LanguageSwitcher';
import { t } from './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Menu } from 'lucide-react';

function App() {
  const { createPage, sidebarOpen: open, setSidebarOpen: setOpen, initializeOffline: init } = useStore();
  const { currentTheme: theme, themes } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasInit = useRef(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);
  const toggleSidebar = useCallback(() => setOpen(true), [setOpen]);

  useEffect(() => {
    const t = themes.find(t => t.id === theme);
    if (t) applyThemeToDocument(t);
  }, [theme, themes]);

  useEffect(() => {
    const initApp = async () => {
      if (hasInit.current) return;
      hasInit.current = true;
      
      try {
        await init();
        
        const ws = useStore.getState().workspaces;
        if (ws.length > 0 && ws[0].pages.length === 0) {
          createPage('default', {
            title: t('app.welcomeTitle'),
            blocks: [
              {
                id: crypto.randomUUID(),
                type: 'text',
                content: t('app.welcomeText'),
                children: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: crypto.randomUUID(),
                type: 'heading',
                content: t('app.welcomeHeading'),
                children: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, [init, createPage]);

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex h-screen bg-background safe-area-inset">
          {open && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Sidebar isSidebarOpen={open} />
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background safe-area-inset-top pt-6 lg:pt-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={toggleMobile}
                  className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors text-text flex-shrink-0 mt-3"
                  aria-label="Toggle mobile menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                {!open && (
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-hover transition-colors text-text flex-shrink-0"
                    aria-label="Open sidebar"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                <div className="hidden lg:block flex-1 max-w-2xl">
                  <EnhancedSearch />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-3 lg:mt-0.5">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>

            <div className="flex-1 overflow-auto w-full">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Editor />} />
                  <Route path="/page/:pageId" element={<Editor />} />
                </Routes>
              </ErrorBoundary>
            </div>
          </div>

          {mobileOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMobile}
              role="button"
              aria-label="Close mobile menu"
            />
          )}
          <div 
            className={`fixed inset-y-0 left-0 z-50 lg:hidden w-80 max-w-[85vw] transform transition-transform duration-100 ease-out ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            } safe-area-inset-top`}
          >
            <div className="pt-4 lg:pt-0 h-full">
              <Sidebar
                isSidebarOpen={mobileOpen}
                onMobileClose={closeMobile}
              />
            </div>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
