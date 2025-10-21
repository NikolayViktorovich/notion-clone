import { Plus, Search, FileText, LayoutTemplate, X, MoreVertical, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/dateUtils';
import { TemplateSelector } from '../../components/comments/templates/TemplateSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onMobileClose?: () => void;
  isSidebarOpen: boolean;
}

export const Sidebar = ({ onMobileClose, isSidebarOpen }: SidebarProps) => {
  const {
    workspaces,
    createPage,
    currentPage,
    setCurrentPage,
    deletePage,
    createPageFromTemplate
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCreatePage = () => {
    const pageCount = workspaces.flatMap(w => w.pages).length + 1;
    createPage('default', {
      title: `Без названия ${pageCount}`,
      icon: '📄',
      blocks: [],
    });
    onMobileClose?.();
  };

  const handlePageSelect = (pageId: string) => {
    setCurrentPage(pageId);
    onMobileClose?.();
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (pageToDelete) {
      deletePage(pageToDelete.id);
      setPageToDelete(null);
      setActiveMenu(null);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    createPageFromTemplate('default', templateId);
    setShowTemplates(false);
    onMobileClose?.();
  };

  const handleMenuToggle = (pageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === pageId ? null : pageId);
  };

  const handleDeleteClick = (pageId: string, pageTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setPageToDelete({ id: pageId, title: pageTitle });
    setActiveMenu(null);
  };

  useState(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, );

  const filteredPages = workspaces.flatMap(workspace =>
    workspace.pages.filter(page =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      {/* Faded background для мобилки */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 lg:hidden z-40 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed lg:static inset-y-0 left-0 w-80 bg-sidebar border-r border-border h-screen flex flex-col z-50"
          >
            {/* Хэдер */}
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg font-semibold text-text">Workspace</h2>
                <button
                  onClick={() => onMobileClose?.()}
                  className="lg:hidden p-2 hover:bg-hover rounded-lg transition-colors text-text-secondary hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Поиск */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Поиск страниц..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text-secondary"
                />
              </div>

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center justify-center gap-2 bg-background border border-border text-text py-2 lg:py-3 px-4 rounded-lg text-sm font-medium hover:bg-hover transition-colors flex-1"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  <span className="hidden xs:inline">Из шаблона</span>
                  <span className="xs:hidden">Шаблон</span>
                </button>
                <button
                  onClick={handleCreatePage}
                  className="flex items-center justify-center gap-2 bg-accent text-white py-2 lg:py-3 px-4 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm special-theme-button flex-1"
                >
                  <Plus className="w-4 h-4" />
                  Создать
                </button>
              </div>
            </div>

            {/* Список страниц */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <h3 className="text-sm font-medium text-text-secondary">Страницы</h3>
                  <span className="text-xs text-text-secondary bg-hover px-2 py-1 rounded">{filteredPages.length}</span>
                </div>
                <div className="space-y-1">
                  <AnimatePresence>
                    {filteredPages.map((page) => (
                      <motion.div
                        key={page.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className={`px-3 py-2 lg:py-3 rounded-lg flex items-center gap-3 transition-all group cursor-pointer ${
                          currentPage?.id === page.id ? 'bg-accent text-white shadow-sm special-theme-button' : 'hover:bg-hover text-text'
                        }`}
                        onClick={() => handlePageSelect(page.id)}
                      >
                        <span className="text-lg flex-shrink-0">{page.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            currentPage?.id === page.id ? 'text-white' : 'text-text'
                          }`}>
                            {page.title || 'Untitled'}
                          </p>
                          <p className={`text-xs ${
                            currentPage?.id === page.id ? 'text-gray-200' : 'text-text-secondary'
                          }`}>
                            {formatDate(page.updatedAt)}
                          </p>
                        </div>
                        
                        {/* Кнопка с тремя точками */}
                        <div className="relative flex-shrink-0" ref={menuRef}>
                          <button
                            onClick={(e) => handleMenuToggle(page.id, e)}
                            className={`p-1 rounded transition-colors ${
                              currentPage?.id === page.id 
                                ? 'text-white hover:bg-white/20' 
                                : 'text-text-secondary hover:bg-hover-secondary hover:text-text'
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Выпадающее меню */}
                          <AnimatePresence>
                            {activeMenu === page.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 w-32 bg-background border border-border rounded-lg shadow-lg z-10 py-1"
                              >
                                <button
                                  onClick={(e) => handleDeleteClick(page.id, page.title, e)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-hover transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Удалить
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredPages.length === 0 && (
                    <div className="text-center py-6 lg:py-8 text-text-secondary">
                      <FileText className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-2 lg:mb-3 opacity-50" />
                      <p className="text-sm">Страницы не найдены</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-accent text-xs mt-1 lg:mt-2 hover:underline font-medium"
                        >
                          Очистить поиск
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 lg:p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Страниц: {filteredPages.length}</span>
                <span className="font-medium hidden sm:inline">Notion Clone</span>
                <span className="font-medium sm:hidden">v1.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка удаления */}
      <Modal
        isOpen={!!pageToDelete}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удаление"
        description={`Вы уверены, что хотите удалить "${pageToDelete?.title}"? Это действие не может быть отменено.`}
        confirmText="Удалить"
        type="delete"
      />

      {/* Модалка шаблонов */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </>
  );
};