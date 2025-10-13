import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextBlock } from './blocks/TextBlock';
import { HeaderBlock } from './blocks/HeaderBlock';

export const Editor = () => {
  const { currentPage } = useStore();

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Select a page to start editing
          </h2>
          <p className="text-gray-400">
            Choose a page from the sidebar or create a new one
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page Cover */}
        {currentPage.cover && (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentPage.cover}
            alt="Cover"
            className="w-full h-48 object-cover rounded-lg mb-8"
          />
        )}

        {/* Page Icon and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          {currentPage.icon && (
            <span className="text-4xl">{currentPage.icon}</span>
          )}
          <h1 className="text-4xl font-bold outline-none border-none bg-transparent">
            {currentPage.title}
          </h1>
        </motion.div>

        {/* Blocks */}
        <AnimatePresence>
          {currentPage.blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              {block.type === 'text' && <TextBlock block={block} />}
              {block.type === 'heading' && (
                <HeaderBlock block={block} level={1} />
              )}
              {/* Позже добавлю остальные блочки */}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Block Button */}
        <motion.button
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
          className="w-full text-left p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          + Click to add a block...
        </motion.button>
      </div>
    </motion.div>
  );
};