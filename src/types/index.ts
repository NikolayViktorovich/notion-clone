export interface Block {
  id: string;
  type: 'text' | 'heading' | 'todo' | 'code' | 'quote' | 'ai';
  content: string;
  children: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  pages: Page[];
}
