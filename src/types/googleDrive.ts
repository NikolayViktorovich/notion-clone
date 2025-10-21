export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
}

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scope: string;
}

export interface GoogleAuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
    picture?: string;
  } | null;
  accessToken: string | null;
}