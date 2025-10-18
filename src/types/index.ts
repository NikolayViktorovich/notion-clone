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
  };
}

export interface AppSettings {
  theme: string;
  language: string;
  fontSize: number;
  reducedMotion: boolean;
}