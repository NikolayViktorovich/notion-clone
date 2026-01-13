import { create } from 'zustand';
import { GoogleDriveFile, GoogleAuthState, GoogleDriveConfig } from '../types/googleDrive';

interface GoogleDriveState extends GoogleAuthState {
  isLoading: boolean;
  files: GoogleDriveFile[];
  initializeAuth: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => void;
  saveToDrive: (fileName: string, content: string) => Promise<string>;
  loadFromDrive: (fileId: string) => Promise<string>;
  listFiles: () => Promise<GoogleDriveFile[]>;
  deleteFromDrive: (fileId: string) => Promise<void>;
}

const GOOGLE_DRIVE_CONFIG: GoogleDriveConfig = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'test-client-id-placeholder',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'test-api-key-placeholder', 
  scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
};

const getRedirectUri = () => {
  return `${window.location.origin}/oauth.html`;
};

export const useGoogleDrive = create<GoogleDriveState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isLoading: false,
  files: [],

  initializeAuth: async () => {
    try {
      const token = localStorage.getItem('google_access_token');
      const userData = localStorage.getItem('google_user');
      
      if (token && userData) {
        set({ 
          isAuthenticated: true, 
          accessToken: token,
          user: JSON.parse(userData)
        });
      }
    } catch (error) {
      console.error('Error initializing Google auth:', error);
    }
  },

  signIn: async () => {
    try {
      set({ isLoading: true });

      if (GOOGLE_DRIVE_CONFIG.clientId === 'test-client-id-placeholder') {
        throw new Error('Google Client ID not configured');
      }

      const redirectUri = getRedirectUri();

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_DRIVE_CONFIG.clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: GOOGLE_DRIVE_CONFIG.scope,
        include_granted_scopes: 'true',
        state: 'pass-through-value',
        prompt: 'consent',
      })}`;

      const authWindow = window.open(
        authUrl, 
        'google-auth', 
        'width=600,height=700,left=100,top=100'
      );
      
      if (!authWindow) {
        throw new Error('Popup window blocked. Please allow popups for this site.');
      }

      const accessToken = await new Promise<string>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'google-auth-success' && event.data.token) {
            window.removeEventListener('message', messageHandler);
            clearTimeout(timeoutId);
            resolve(event.data.token);
          }
          
          if (event.data.type === 'google-auth-error') {
            window.removeEventListener('message', messageHandler);
            clearTimeout(timeoutId);
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        const timeoutId = setTimeout(() => {
          if (authWindow.closed) {
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication window closed'));
          }
        }, 60000);

        window.addEventListener('message', messageHandler);
      });

      let userData;

      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          
          userData = {
            email: userInfo.email || 'user@google.com',
            name: userInfo.name || 'Google User',
            picture: userInfo.picture || undefined,
          };
        } else {
          const driveResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (driveResponse.ok) {
            const aboutData = await driveResponse.json();
            
            userData = {
              email: aboutData.user?.emailAddress || 'user@google.com',
              name: aboutData.user?.displayName || 'Google User',
              picture: aboutData.user?.photoLink || undefined,
            };
          } else {
            throw new Error('Cannot fetch user information');
          }
        }
      } catch (userInfoError) {
        userData = {
          email: 'user@google.com',
          name: 'Google User',
          picture: undefined,
        };
      }

      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_user', JSON.stringify(userData));
      
      set({
        isAuthenticated: true,
        accessToken: accessToken,
        user: userData,
        isLoading: false,
      });

    } catch (error) {
      console.error('Google sign-in error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: () => {
    const { accessToken } = get();
    if (accessToken) {
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`, {
        method: 'POST',
      }).catch(error => {
        console.error('Error revoking token:', error);
      });
    }

    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user');
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      files: [],
    });
  },

  saveToDrive: async (fileName: string, content: string): Promise<string> => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to Google Drive.');
    }

    try {
      set({ isLoading: true });

      let textContent = content;
      
      try {
        const pageData = JSON.parse(content);
        textContent = formatPageAsText(pageData);
      } catch (e) {
        console.log('Content is not JSON, using as plain text');
      }

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: createMultipartBody(fileName, textContent, 'text/plain'),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Drive API error:', response.status, errorText);
        
        if (response.status === 401) {
          get().signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 403) {
          throw new Error('No permission to save files. Please check Google Drive permissions.');
        }
        
        throw new Error(`Failed to save file: ${response.status} ${response.statusText}`);
      }

      const fileData = await response.json();
      
      set({ isLoading: false });
      return fileData.id || '';

    } catch (error) {
      set({ isLoading: false });
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      throw new Error(`Google Drive error: ${error instanceof Error ? error.message : 'Unknown error'}. File saved locally.`);
    }
  },

  loadFromDrive: async (fileId: string): Promise<string> => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to Google Drive.');
    }

    try {
      set({ isLoading: true });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Drive API error:', response.status, errorText);
        
        if (response.status === 401) {
          get().signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 404) {
          throw new Error('File not found in Google Drive');
        }
        
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      
      set({ isLoading: false });
      return content;

    } catch (error) {
      set({ isLoading: false });
      console.error('Error loading from Google Drive:', error);
      throw error;
    }
  },

  listFiles: async (): Promise<GoogleDriveFile[]> => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to Google Drive.');
    }

    try {
      set({ isLoading: true });

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
          q: "mimeType='application/json' or mimeType='text/plain'",
          fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink)',
          orderBy: 'modifiedTime desc',
          pageSize: '50'
        }), 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Drive API error:', response.status, errorText);
        
        if (response.status === 401) {
          get().signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        
        throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const files: GoogleDriveFile[] = (data.files || []).map((file: any) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        createdTime: file.createdTime || '',
        modifiedTime: file.modifiedTime || '',
        webViewLink: file.webViewLink || '',
      }));

      set({ files, isLoading: false });
      return files;

    } catch (error) {
      set({ isLoading: false });
      console.error('Error listing Google Drive files:', error);
      throw error;
    }
  },

  deleteFromDrive: async (fileId: string): Promise<void> => {
    const { accessToken } = get();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to Google Drive.');
    }

    try {
      set({ isLoading: true });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        console.error('Google Drive API error:', response.status, errorText);
        
        if (response.status === 401) {
          get().signOut();
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 404) {
          throw new Error('File not found in Google Drive');
        }
        
        throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
      }

      const { listFiles } = get();
      await listFiles();
      
      set({ isLoading: false });

    } catch (error) {
      set({ isLoading: false });
      console.error('Error deleting from Google Drive:', error);
      throw error;
    }
  },
}));

function createMultipartBody(fileName: string, content: string, mimeType: string = 'text/plain'): FormData {
  const formData = new FormData();
  
  const metadata = {
    name: `${fileName}.txt`,
    mimeType: mimeType,
  };
  
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', new Blob([content], { type: mimeType }));
  
  return formData;
}

function formatPageAsText(pageData: any): string {
  let text = '';

  text += `Название: ${pageData.title || 'Без названия'}\n`;
  text += `Создано: ${new Date(pageData.createdAt).toLocaleString('ru-RU')}\n`;
  text += `Обновлено: ${new Date(pageData.updatedAt).toLocaleString('ru-RU')}\n`;
  text += '='.repeat(50) + '\n\n';
  
  if (pageData.blocks && Array.isArray(pageData.blocks)) {
    pageData.blocks.forEach((block: any, index: number) => {
      text += `Блок ${index + 1} (${block.type}):\n`;
      
      switch (block.type) {
        case 'heading':
          text += `# ${block.content}\n\n`;
          break;
        case 'text':
          text += `${block.content}\n\n`;
          break;
        case 'todo':
          const todoStatus = block.content?.completed ? '[✓]' : '[ ]';
          text += `${todoStatus} ${block.content?.text || block.content}\n\n`;
          break;
        case 'code':
          text += '```\n';
          text += `${block.content}\n`;
          text += '```\n\n';
          break;
        case 'quote':
          text += `> ${block.content}\n\n`;
          break;
        default:
          text += `${block.content}\n\n`;
      }
      
      text += '-'.repeat(30) + '\n\n';
    });
  }

  if (!pageData.blocks || pageData.blocks.length === 0) {
    text += 'Страница пуста\n';
  }
  
  return text;
}