import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, workspaces } = useStore();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-80 bg-gray-50 border-r border-gray-200 h-screen flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Workspace</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mt-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto p-4">
              {workspaces.map(workspace => (
                <div key={workspace.id} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {workspace.name}
                  </h3>
                  {workspace.pages.map(page => (
                    <motion.div
                      key={page.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                      className="px-3 py-2 rounded cursor-pointer flex items-center gap-2"
                    >
                      {page.icon && <span>{page.icon}</span>}
                      <span className="text-sm">{page.title}</span>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            {/* New Page Button */}
            <div className="p-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Page
              </motion.button>
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
          className="absolute top-4 left-4 p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </motion.button>
      )}
    </>
  );
};