import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Save, Tag, ExternalLink, Copy, Download } from 'lucide-react';
import { useWebClipper } from '../../hooks/useWebClipper';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../ui/Notification';

export const WebClipper = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const { 
    isClipperOpen, 
    currentClip, 
    isLoading,
    openClipper, 
    closeClipper, 
    saveClip 
  } = useWebClipper();
  
  const { notification, hideNotification, notifySuccess, notifyError, notifyInfo } = useNotification();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'WEB_CLIP_DATA') {
        const clipData = event.data.payload;
        openClipper(clipData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [openClipper]);

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      notifyError('Введите URL для импорта');
      return;
    }

    try {
      setIsImporting(true);
      notifyInfo('Импортируем содержимое...');

      const { importFromUrl } = useWebClipper.getState();
      const clipData = await importFromUrl(url);
      
      openClipper(clipData);
      setTitle(clipData.title || '');
      notifySuccess('Содержимое успешно импортировано!');

    } catch (error) {
      console.error('Import error:', error);
      notifyError('Ошибка при импорте содержимого');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    if (!currentClip) return;

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      await saveClip(title || currentClip.title || 'Веб-клип', tagsArray);
      
      notifySuccess('Клип успешно сохранен!');
      closeClipper();
      setUrl('');
      setTitle('');
      setTags('');

    } catch (error) {
      console.error('Save error:', error);
      notifyError('Ошибка при сохранении клипа');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = clipboardText.match(urlRegex);
      
      if (urls && urls[0]) {
        setUrl(urls[0]);
        notifyInfo('URL найден в буфере обмена');
      } else {
        const clipData = {
          url: window.location.href,
          title: 'Текст из буфера обмена',
          content: clipboardText.substring(0, 1000),
          excerpt: clipboardText.substring(0, 200) + '...'
        };
        openClipper(clipData);
        setTitle('Текст из буфера обмена');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      notifyError('Не удалось получить данные из буфера обмена');
    }
  };

  const handleQuickSave = (content: string) => {
    const clipData = {
      url: window.location.href,
      title: document.title,
      content: content,
      excerpt: content.substring(0, 200) + '...'
    };
    openClipper(clipData);
    setTitle(document.title);
  };

  if (!isClipperOpen) return null;

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={closeClipper}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-text">
                  Сохранить в Notion Clone
                </h3>
                <p className="text-sm text-text-secondary">
                  Сохраните контент из интернета
                </p>
              </div>
            </div>
            <button
              onClick={closeClipper}
              className="p-2 hover:bg-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Контент */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* URL ввод */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  URL страницы
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={handleImportFromUrl}
                    disabled={isImporting || !url.trim()}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isImporting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Импорт
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-hover rounded-lg text-text hover:bg-border transition-colors"
              >
                <Copy className="w-4 h-4" />
                Вставить из буфера обмена
              </button>
            </div>

            {/* Превью */}
            {currentClip && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Теги (через запятую)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="веб, статья, заметка"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Предпросмотр содержимого
                  </label>
                  <div className="p-4 bg-hover rounded-lg border border-border max-h-40 overflow-y-auto">
                    <p className="text-sm text-text whitespace-pre-wrap">
                      {currentClip.excerpt || currentClip.content}
                    </p>
                  </div>
                </div>

                {currentClip.url && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href={currentClip.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors truncate"
                    >
                      {currentClip.url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex justify-end gap-3 p-6 border-t border-border bg-hover">
            <button
              onClick={closeClipper}
              className="px-4 py-2 text-text bg-background border border-border rounded-lg hover:bg-border transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !currentClip}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Сохранить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};