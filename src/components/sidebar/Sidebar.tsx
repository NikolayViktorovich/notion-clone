import { Plus, Search, FileText, LayoutTemplate, X, MoreVertical, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/dateUtils';
import { TemplateSelector } from '../../components/comments/templates/TemplateSelector';
import { AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onMobileClose?: () => void;
  isSidebarOpen: boolean;
}

export const Sidebar = ({ onMobileClose: closeMobile, isSidebarOpen: open }: SidebarProps) => {
  const { workspaces: ws, createPage, currentPage: page, setCurrentPage: setPage, deletePage, createPageFromTemplate: fromTemplate } = useStore();
  const [search, setSearch] = useState('');
  const [delPage, setDelPage] = useState<{ id: string; title: string } | null>(null);
  const [showTpl, setShowTpl] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const addPage = () => {
    const count = ws.flatMap(w => w.pages).length + 1;
    createPage('default', { title: `Без названия ${count}`, icon: '📄', blocks: [] });
    closeMobile?.();
  };

  const selectPage = (id: string) => {
    setPage(id);
    closeMobile?.();
    setMenu(null);
  };

  const confirmDel = () => {
    if (delPage) { deletePage(delPage.id); setDelPage(null); setMenu(null); }
  };

  const selectTpl = (id: string) => {
    fromTemplate('default', id);
    setShowTpl(false);
    closeMobile?.();
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(menu === id ? null : id);
  };

  const clickDel = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDelPage({ id, title });
    setMenu(null);
  };

  useState(() => {
    const click = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, );

  const pages = ws.flatMap(w => w.pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 lg:hidden z-40 bg-black/40 backdrop-blur-sm" onClick={closeMobile} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <div className="fixed lg:static inset-y-0 left-0 w-80 bg-sidebar border-r border-border h-screen flex flex-col z-50">
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg font-semibold text-text">Workspace</h2>
                <button onClick={() => closeMobile?.()} className="lg:hidden p-2 hover:bg-hover rounded-lg transition-colors text-text-secondary hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input type="text" placeholder="Поиск страниц..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 lg:py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text-secondary" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => setShowTpl(true)} className="flex items-center justify-center gap-2 bg-background border border-border text-text py-2 lg:py-3 px-4 rounded-lg text-sm font-medium hover:bg-hover transition-colors flex-1">
                  <LayoutTemplate className="w-4 h-4" />
                  <span className="hidden xs:inline">Из шаблона</span>
                  <span className="xs:hidden">Шаблон</span>
                </button>
                <button onClick={addPage} className="flex items-center justify-center gap-2 bg-accent text-white py-2 lg:py-3 px-4 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm special-theme-button flex-1">
                  <Plus className="w-4 h-4" />Создать
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <h3 className="text-sm font-medium text-text-secondary">Страницы</h3>
                  <span className="text-xs text-text-secondary bg-hover px-2 py-1 rounded">{pages.length}</span>
                </div>
                <div className="space-y-1">
                  <AnimatePresence>
                    {pages.map((p) => (
                      <div key={p.id} className={`px-3 py-2 lg:py-3 rounded-lg flex items-center gap-3 transition-all group cursor-pointer ${page?.id === p.id ? 'bg-accent shadow-sm special-theme-button' : 'hover:bg-hover text-text'}`} onClick={() => selectPage(p.id)}>
                        <span className="text-lg flex-shrink-0">{p.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${page?.id === p.id ? '' : 'text-text'}`}>{p.title || 'Untitled'}</p>
                          <p className={`text-xs ${page?.id === p.id ? 'opacity-70' : 'text-text-secondary'}`}>{formatDate(p.updatedAt)}</p>
                        </div>
                        <div className="relative flex-shrink-0" ref={menuRef}>
                          <button onClick={(e) => toggleMenu(p.id, e)} className={`p-1 rounded transition-colors ${page?.id === p.id ? 'opacity-70 hover:opacity-100' : 'text-text-secondary hover:bg-hover-secondary hover:text-text'}`}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {menu === p.id && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-background border border-border rounded-lg shadow-lg z-10 py-1">
                                <button onClick={(e) => clickDel(p.id, p.title, e)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-hover transition-colors">
                                  <Trash2 className="w-3 h-3" />Удалить
                                </button>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </AnimatePresence>
                  {pages.length === 0 && (
                    <div className="text-center py-6 lg:py-8 text-text-secondary">
                      <FileText className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 opacity-50" />
                      <p className="text-sm">Страницы не найдены</p>
                      {search && <button onClick={() => setSearch('')} className="text-accent text-xs mt-1 lg:mt-2 hover:underline font-medium">Очистить поиск</button>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 lg:p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Страниц: {pages.length}</span>
                <span className="font-medium hidden sm:inline">Notion Clone</span>
                <span className="font-medium sm:hidden">v1.0</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <Modal isOpen={!!delPage} onClose={() => setDelPage(null)} onConfirm={confirmDel} title="Удалить страницу?" description={delPage?.title} confirmText="Удалить" type="delete" />
      <TemplateSelector isOpen={showTpl} onClose={() => setShowTpl(false)} onTemplateSelect={selectTpl} />
    </>
  );
};
