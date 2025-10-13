import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Block, Page, Workspace } from '../types';

interface AppState {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentPage: Page | null;
  sidebarOpen: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  createPage: (workspaceId: string, page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  createBlock: (pageId: string, block: Omit<Block, 'id' | 'children' | 'createdAt' | 'updatedAt'>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newParentId: string | null) => void;
}

export const useStore = create<AppState>()(
  devtools((set, get) => ({
    workspaces: [],
    currentWorkspace: null,
    currentPage: null,
    sidebarOpen: true,

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    createPage: (workspaceId, page) => {
      const newPage: Page = {
        ...page,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        workspaces: state.workspaces.map(workspace =>
          workspace.id === workspaceId
            ? { ...workspace, pages: [...workspace.pages, newPage] }
            : workspace
        ),
      }));
    },

    updatePage: (pageId, updates) => {
      set((state) => ({
        workspaces: state.workspaces.map(workspace => ({
          ...workspace,
          pages: workspace.pages.map(page =>
            page.id === pageId
              ? { ...page, ...updates, updatedAt: new Date() }
              : page
          ),
        })),
        currentPage: state.currentPage?.id === pageId
          ? { ...state.currentPage, ...updates, updatedAt: new Date() }
          : state.currentPage,
      }));
    },

    createBlock: (pageId, block) => {
      const newBlock: Block = {
        ...block,
        id: crypto.randomUUID(),
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        workspaces: state.workspaces.map(workspace => ({
          ...workspace,
          pages: workspace.pages.map(page =>
            page.id === pageId
              ? { ...page, blocks: [...page.blocks, newBlock] }
              : page
          ),
        })),
      }));
    },

    updateBlock: (blockId, updates) => {
      set((state) => ({
        workspaces: state.workspaces.map(workspace => ({
          ...workspace,
          pages: workspace.pages.map(page => ({
            ...page,
            blocks: page.blocks.map(block =>
              block.id === blockId
                ? { ...block, ...updates, updatedAt: new Date() }
                : block
            ),
          })),
        })),
      }));
    },

  }))
);