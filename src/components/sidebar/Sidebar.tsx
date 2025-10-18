import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Search, FileText, Trash2, MoreVertical, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, workspaces, createPage, currentPage, setCurrentPage, deletePage } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; pageId: string; pageTitle: string }>({
    isOpen: false,
    pageId: '',
    pageTitle: ''
  });
  
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCreatePage = () => {
    createPage('default', {
      title: 'Untitled',
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
            className="w-80 bg-white border-r border-gray-100 h-screen flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* New Page Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreatePage}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Page
              </motion.button>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Pages</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
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
                            ? 'bg-black text-white shadow-sm' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">
                          {page.icon || '📄'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            currentPage?.id === page.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {page.title || 'Untitled'}
                          </p>
                          <p className={`text-xs ${
                            currentPage?.id === page.id ? 'text-gray-200' : 'text-gray-500'
                          }`}>
                            {page.updatedAt.toLocaleDateString()}
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
                                ? 'text-gray-200 hover:bg-gray-700'
                                : 'text-gray-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100'
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
                                className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                              >
                                <button
                                  onClick={(e) => handleExportPage(page, e)}
                                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Export as JSON
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(page.id, page.title || 'Untitled', e)}
                                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Page
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredPages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No pages found</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-black text-xs mt-2 hover:underline font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total pages: {filteredPages.length}</span>
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
          className="absolute top-6 left-6 p-3 bg-black text-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </motion.button>
      )}

      {/* Delete Page Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, pageId: '', pageTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Page"
        description={`Are you sure you want to delete "${deleteModal.pageTitle}"? This action cannot be undone.`}
        confirmText="Delete Page"
        type="delete"
      />
    </>
  );
};