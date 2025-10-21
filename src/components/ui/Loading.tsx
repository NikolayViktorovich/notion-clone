import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingProps {
  onLoadComplete: () => void;
}

export const Loading = ({ onLoadComplete }: LoadingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
      onLoadComplete();
    };

    loadData();
  }, [onLoadComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-background z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl mb-6"
            >
              📝
            </motion.div>
            
            <h1 className="text-3xl font-bold text-text mb-4">
              Notion Clone
            </h1>
            
            <div className="w-64 h-2 bg-border rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            
            <p className="text-text-secondary text-sm">
              {progress < 30 && "Загрузка workspace..."}
              {progress >= 30 && progress < 60 && "Инициализация страниц..."}
              {progress >= 60 && progress < 90 && "Подготовка редактора..."}
              {progress >= 90 && "Почти готово!"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};