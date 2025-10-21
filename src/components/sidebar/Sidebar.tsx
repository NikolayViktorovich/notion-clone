import { motion } from 'framer-motion';
import { Plus, Search, FileText, Trash2, MoreVertical, Download, LayoutTemplate, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/dateUtils';
import { TemplateSelector } from '../../components/comments/templates/TemplateSelector';

interface SidebarProps {
  onMobileClose?: () => void;
}

export const Sidebar = ({ onMobileClose }: SidebarProps) => {
  const { 
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
    onMobileClose?.();
  };

  const handlePageSelect = (pageId: string) => {
    setCurrentPage(pageId);
    onMobileClose?.();
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    onMobileClose?.();
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

  const handleTemplateSelect = (templateId: string) => {
    createPageFromTemplate('default', templateId);
    setShowTemplates(false);
    onMobileClose?.();
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
      <div className="w-80 bg-sidebar border-r border-border h-screen flex flex-col">
        {/* Хэдер */}
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg font-semibold text-text">
              Workspace
            </h2>
            <button
              onClick={handleCloseSidebar}
              className="p-2 hover:bg-hover rounded-lg transition-colors text-text-secondary hover:text-text"
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

          {/* Кнопки новой страницы */}
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
              <span className="text-xs text-text-secondary bg-hover px-2 py-1 rounded">
                {filteredPages.length}
              </span>
            </div>
            <div className="space-y-1">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => handlePageSelect(page.id)}
                  className={`px-3 py-2 lg:py-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all group relative ${
                    currentPage?.id === page.id 
                      ? 'bg-accent text-white shadow-sm special-theme-button'  
                      : 'hover:bg-hover text-text'
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

                  {/* Кнопка меню */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === page.id ? null : page.id);
                      }}
                      className={`p-1 rounded transition-all ${
                        currentPage?.id === page.id
                          ? 'text-gray-200 hover:bg-white hover:bg-opacity-20'
                          : 'text-text-secondary hover:bg-hover lg:opacity-0 lg:group-hover:opacity-100'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Выпадающее меню */}
                    {activeMenu === page.id && (
                      <div className="absolute right-0 top-8 z-50 w-48 bg-background border border-border rounded-lg shadow-lg py-1">
                        <button
                          onClick={(e) => handleExportPage(page, e)}
                          className="w-full px-4 py-2 text-sm text-text hover:bg-hover flex items-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Экспорт в JSON
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(page.id, page.title || 'Untitled', e)}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
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

        {/* Футер */}
        <div className="p-3 lg:p-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Страниц: {filteredPages.length}</span>
            <span className="font-medium hidden sm:inline">Notion Clone</span>
            <span className="font-medium sm:hidden">v1.0</span>
          </div>
        </div>
      </div>

      {/* Модалка страницы удаления */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, pageId: '', pageTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Удаление"
        description={`Вы уверены, что хотите удалить "${deleteModal.pageTitle}"? Это действие не может быть отменено.`}
        confirmText="Удалить"
        type="delete"
      />

      {/* Модалка для выбора шаблонов */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </>
  );
};