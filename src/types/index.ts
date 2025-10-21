export type BlockType = 'text' | 'heading' | 'todo' | 'code' | 'quote';

export interface Block {
  id: string;
  type: string;
  content: string;
  children: Block[];
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
  template?: string;
}

export interface Workspace {
  id: string;
  name: string;
  pages: Page[];
}

export interface NewBlock {
  type: string;
  content: string;
  children?: Block[];
}

export interface Comment {
  id: string;
  blockId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  resolved: boolean;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'personal' | 'work' | 'education' | 'project';
  blocks: NewBlock[];
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  blockId: string;
  blockType: string;
  content: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  text: string;
  start: number;
  end: number;
}

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'custom';
  colors: {
    primary: string;
    background: string;
    sidebar: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    accent: string;
    button: string;
    buttonText: string;
  };
}

export interface AppSettings {
  theme: string;
  language: string;
  fontSize: number;
  reducedMotion: boolean;
}

const initialColors = {
  light: {
    primary: '#000000',
    background: '#ffffff',
    sidebar: '#f8f9fa',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e5e5e5',
    hover: '#f5f5f5',
    accent: '#000000',
    button: '#000000',
    buttonText: '#ffffff',
  },
  dark: {
    primary: '#ffffff',
    background: '#1a1a1a',
    sidebar: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#404040',
    hover: '#363636',
    accent: '#ffffff',
    button: '#ffffff',
    buttonText: '#000000',
  },
};

