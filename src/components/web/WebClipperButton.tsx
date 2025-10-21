// components/web/WebClipperButton.tsx
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useWebClipper } from '../../hooks/useWebClipper';

export const WebClipperButton = () => {
  const { openClipper } = useWebClipper();

  const handleQuickClip = () => {
    const clipData = {
      url: window.location.href,
      title: document.title,
      content: getPageContent(),
      excerpt: getPageExcerpt(),
      image: getPageImage()
    };
    
    openClipper(clipData);
  };

  const getPageContent = (): string => {
    const mainContent = document.querySelector('article') || 
                       document.querySelector('main') || 
                       document.querySelector('.content') || 
                       document.body;
    
    return mainContent.textContent?.substring(0, 2000) || 'Контент не найден';
  };

  const getPageExcerpt = (): string => {
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined;
    return description || document.title || 'Описание не найдено';
  };

  const getPageImage = (): string | undefined => {
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined;
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || undefined;
    
    return ogImage || twitterImage;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleQuickClip}
  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button"
  title="Сохранить страницу"
    >
      <Globe className="w-4 h-4" />
      Сохранить страницу
    </motion.button>
  );
};
