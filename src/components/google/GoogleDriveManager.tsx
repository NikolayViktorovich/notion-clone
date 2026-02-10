import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Cloud, Upload, Download, LogOut, User, FileText, Trash2, ExternalLink } from 'lucide-react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { useStore } from '../../store/useStore';
import { InputModal } from '../ui/InputModal';
import { Notification } from '../ui/Notification';
import { useNotification } from '../../hooks/useNotification';
import { useI18n } from '../../hooks/useI18n';

export const GoogleDriveManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const { t } = useI18n();
  
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
      
      notifySuccess(`${t('googleDrive.saveTitle')} "${fileName}"!`);

    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      notifyError(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const handleLoadFromDrive = async (fileId: string) => {
    try {
      const content = await loadFromDrive(fileId);
      JSON.parse(content);
      
      notifySuccess(t('googleDrive.saveTitle'));
      
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      notifyError(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const handleListFiles = async () => {
    try {
      await listFiles();
      setShowFiles(true);
      notifyInfo(t('googleDrive.recentFiles'));
    } catch (error) {
      console.error('Error listing files:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      notifyError(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
      notifySuccess(t('googleDrive.signIn'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      notifyError(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const handleSignOut = () => {
    signOut();
    notifyInfo(t('googleDrive.signOut'));
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await deleteFromDrive(fileId);
      notifySuccess(`${t('common.delete')} "${fileName}"`);
    } catch (error) {
      console.error('Error deleting file:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      notifyError(`${t('common.error')}: ${errorMessage}`);
    }
  };

  return (
    <div className="relative">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={5000}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-hover rounded-lg text-sm font-medium transition-colors border border-border hover:bg-border text-text"
      >
        <Cloud className="w-4 h-4" />
        {t('googleDrive.title')}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <div
              className="absolute right-0 top-12 z-50 w-80 bg-background border border-border rounded-lg shadow-xl p-4"
            >
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <Cloud className="w-12 h-12 mx-auto mb-2 text-text-secondary" />
                    <h3 className="font-semibold text-text mb-1">
                      {t('googleDrive.title')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {t('googleDrive.signInPrompt')}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 special-theme-button"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    {t('googleDrive.signIn')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
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

                  <div className="space-y-2">
                    <button
                      onClick={() => setSaveModal(true)}
                      disabled={!currentPage || isLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text hover:bg-hover transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {t('googleDrive.saveCurrentPage')}
                    </button>

                    <button
                      onClick={handleListFiles}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text hover:bg-hover transition-colors disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      {t('googleDrive.myFiles')}
                    </button>
                  </div>

                  {showFiles && (
                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-text mb-2">
                        {t('googleDrive.recentFiles')}
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {files.length === 0 ? (
                          <p className="text-sm text-text-secondary text-center py-4">
                            {t('googleDrive.noFiles')}
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
                                  title={t('googleDrive.loadTooltip')}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => window.open(file.webViewLink, '_blank')}
                                  className="p-1 text-text-secondary hover:text-text transition-colors"
                                  title={t('googleDrive.openInDrive')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  className="p-1 text-text-secondary hover:text-text transition-colors"
                                  title={t('googleDrive.deleteTooltip')}
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
            </div>
          </>
        )}
      </AnimatePresence>

      <InputModal
        isOpen={saveModal}
        onClose={() => {
          setSaveModal(false);
          setFileName('');
        }}
        onConfirm={handleSaveToDrive}
        title={t('googleDrive.saveTitle')}
        description={t('googleDrive.saveDescription')}
        confirmText={t('googleDrive.saveButton')}
        placeholder={t('modal.pageName')}
        value={fileName}
        onChange={setFileName}
      />
    </div>
  );
};
