import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Upload, Download, LogOut, User, FileText, Trash2, ExternalLink } from 'lucide-react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { useStore } from '../../store/useStore';
import { InputModal } from '../ui/InputModal';
import { Notification } from '../ui/Notification';
import { useNotification } from '../../hooks/useNotification';

export const GoogleDriveManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const { currentPage } = useStore();
  const {
    isAuthenticated,
    user,
    isLoading,
    files,
    signIn,
    signOut,
    saveToDrive,
    loadFromDrive,
    listFiles,
    deleteFromDrive,
  } = useGoogleDrive();

  const { notification, hideNotification, notifySuccess, notifyError, notifyInfo } = useNotification();

  const handleSaveToDrive = async (fileName: string) => {
    if (!currentPage) return;

    try {
      const pageData = {
        title: currentPage.title,
        blocks: currentPage.blocks,
        createdAt: currentPage.createdAt,
        updatedAt: currentPage.updatedAt,
      };

      const content = JSON.stringify(pageData, null, 2);
      await saveToDrive(fileName, content);
      
      setSaveModal(false);
      setFileName('');
      
      notifySuccess(`Страница "${fileName}" успешно сохранена в Google Drive!`);

    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      notifyError(`Ошибка при сохранении: ${errorMessage}`);
    }
  };

  const handleLoadFromDrive = async (fileId: string) => {
    try {
      const content = await loadFromDrive(fileId);
      const pageData = JSON.parse(content);
      
      console.log('Loaded page data:', pageData);
      notifySuccess('Страница загружена из Google Drive!');
      
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      notifyError(`Ошибка при загрузке: ${errorMessage}`);
    }
  };

  const handleListFiles = async () => {
    try {
      await listFiles();
      setShowFiles(true);
      notifyInfo('Список файлов обновлен');
    } catch (error) {
      console.error('Error listing files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      notifyError(`Ошибка при загрузке списка файлов: ${errorMessage}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
      notifySuccess('Успешный вход в Google Drive!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      notifyError(`Ошибка входа: ${errorMessage}`);
    }
  };

  const handleSignOut = () => {
    signOut();
    notifyInfo('Выход из Google Drive выполнен');
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await deleteFromDrive(fileId);
      notifySuccess(`Файл "${fileName}" удален из Google Drive`);
    } catch (error) {
      console.error('Error deleting file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      notifyError(`Ошибка при удалении: ${errorMessage}`);
    }
  };

  return (
    <div className="relative">
      {/* Кастомное уведомление */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={5000}
      />

      {/* Кнопка управления Google Drive */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-hover rounded-lg text-sm font-medium transition-colors border border-border hover:bg-border text-text"
      >
        <Cloud className="w-4 h-4" />
        Google Drive
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 z-50 w-80 bg-background border border-border rounded-lg shadow-xl p-4"
            >
              {!isAuthenticated ? (
                // Не авторизован
                <div className="space-y-3">
                  <div className="text-center">
                    <Cloud className="w-12 h-12 mx-auto mb-2 text-text-secondary" />
                    <h3 className="font-semibold text-text mb-1">
                      Google Drive
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Войдите в аккаунт Google для синхронизации
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Войти в Google
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Информация о пользователе */}
                  <div className="flex items-center gap-3 p-2 bg-hover rounded-lg">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-text-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-1 text-text-secondary hover:text-text transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Действия */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSaveModal(true)}
                      disabled={!currentPage || isLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text hover:bg-hover transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      Сохранить текущую страницу
                    </button>

                    <button
                      onClick={handleListFiles}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text hover:bg-hover transition-colors disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Мои файлы в Drive
                    </button>
                  </div>

                  {/* Список файлов */}
                  {showFiles && (
                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-text mb-2">
                        Последние файлы
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {files.length === 0 ? (
                          <p className="text-sm text-text-secondary text-center py-4">
                            Файлы не найдены
                          </p>
                        ) : (
                          files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 p-2 bg-hover rounded-lg"
                            >
                              <FileText className="w-4 h-4 text-text-secondary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text truncate">
                                  {file.name.replace('.json', '').replace('.txt', '')}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  {new Date(file.modifiedTime).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleLoadFromDrive(file.id)}
                                  className="p-1 text-text-secondary hover:text-text transition-colors"
                                  title="Загрузить"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => window.open(file.webViewLink, '_blank')}
                                  className="p-1 text-text-secondary hover:text-text transition-colors"
                                  title="Открыть в Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  className="p-1 text-text-secondary hover:text-red-600 transition-colors"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Модальное окно сохранения */}
      <InputModal
        isOpen={saveModal}
        onClose={() => {
          setSaveModal(false);
          setFileName('');
        }}
        onConfirm={handleSaveToDrive}
        title="Сохранить в Google Drive"
        description="Введите название файла для сохранения в Google Drive"
        confirmText="Сохранить"
        placeholder="Название страницы"
        value={fileName}
        onChange={setFileName}
      />
    </div>
  );
};