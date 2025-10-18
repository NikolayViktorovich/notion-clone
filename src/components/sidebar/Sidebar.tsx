import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Search, FileText, Trash2, MoreVertical, Download, LayoutTemplate } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/dateUtils';
import { TemplateSelector } from '../../components/comments/templates/TemplateSelector';

export const Sidebar = () => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    workspaces, 
    createPage, 
    currentPage, 
    setCurrentPage, 
    deletePage,
    createPageFromTemplate
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; pageId: string; pageTitle: string }>({
    isOpen: false,
    pageId: '',
    pageTitle: ''
  });
  const [showTemplates, setShowTemplates] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCreatePage = () => {
    createPage('default', {
      title: 'Без названия',
      icon: '📄',
      blocks: [],
    });
  };

  const handleDeleteClick = (pageId: string, pageTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      pageId,
      pageTitle
    });
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    deletePage(deleteModal.pageId);
    setDeleteModal({ isOpen: false, pageId: '', pageTitle: '' });
  };

  const handleExportPage = (page: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const data = {
      title: page.title,
      blocks: page.blocks,
      createdAt: page.createdAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title || 'page'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const filteredPages = workspaces.flatMap(workspace => 
    workspace.pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-80 bg-sidebar border-r border-border h-screen flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text">Workspace</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-hover rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
              
              {/* Search внутри сайдбара */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Поиск страниц..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text-secondary"
                />
              </div>

              {/* New Page Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTemplates(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-background border border-border text-text py-3 px-4 rounded-lg text-sm font-medium hover:bg-hover transition-colors"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Из шаблона
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreatePage}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Создать
                </motion.button>
              </div>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-text-secondary">Страницы</h3>
                  <span className="text-xs text-text-secondary bg-hover px-2 py-1 rounded">
                    {filteredPages.length}
                  </span>
                </div>
                <div className="space-y-1">
                  <AnimatePresence>
                    {filteredPages.map((page) => (
                      <motion.div
                        key={page.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setCurrentPage(page.id)}
                        className={`px-3 py-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all group relative ${
                          currentPage?.id === page.id 
                            ? 'bg-accent text-white shadow-sm' 
                            : 'hover:bg-hover'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">
                          {page.icon || '📄'}
                        </span>
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

                        {/* Menu Button */}
                        <div className="relative" ref={menuRef}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === page.id ? null : page.id);
                            }}
                            className={`p-1 rounded transition-all ${
                              currentPage?.id === page.id
                                ? 'text-gray-200 hover:bg-white hover:bg-opacity-20'
                                : 'text-text-secondary hover:bg-hover opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {activeMenu === page.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-8 z-50 w-48 bg-background border border-border rounded-lg shadow-lg py-1"
                              >
                                <button
                                  onClick={(e) => handleExportPage(page, e)}
                                  className="w-full px-4 py-2 text-sm text-text hover:bg-hover flex items-center gap-2 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Экспорт в JSON
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(page.id, page.title || 'Untitled', e)}
                                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                    <div className="text-center py-8 text-text-secondary">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Страницы не найдены</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-accent text-xs mt-2 hover:underline font-medium"
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
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Общее страниц: {filteredPages.length}</span>
                <span className="font-medium">Notion Clone</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(true)}
          className="absolute top-6 left-6 p-3 bg-accent text-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </motion.button>
      )}

      {/* Delete Page Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, pageId: '', pageTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удаление"
        description={`Вы уверены, что хотите удалить "${deleteModal.pageTitle}"? Это действие не может быть отменено.`}
        confirmText="Удалить"
        type="delete"
      />

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onTemplateSelect={(templateId) => {
          createPageFromTemplate('default', templateId);
        }}
      />
    </>
  );
};