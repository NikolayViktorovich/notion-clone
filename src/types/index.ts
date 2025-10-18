export type BlockType = 'text' | 'heading' | 'todo' | 'code' | 'quote';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  children: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export type NewBlock = Omit<Block, 'id' | 'createdAt' | 'updatedAt' | 'children'>;

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