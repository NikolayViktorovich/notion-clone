import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Block, Page, Workspace, NewBlock } from '../types';

interface AppState {
  // State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentPage: Page | null;
  sidebarOpen: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (pageId: string) => void;
  createPage: (workspaceId: string, page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  createBlock: (pageId: string, block: NewBlock) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newIndex: number) => void;
}

export const useStore = create<AppState>()(
  devtools((set, get) => ({
    // Initial state
    workspaces: [
      {
        id: 'default',
        name: 'My Workspace',
        pages: [],
      },
    ],
    currentWorkspace: null,
    currentPage: null,
    sidebarOpen: true,

    // Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setCurrentPage: (pageId) => {
      const state = get();
      const page = state.workspaces
        .flatMap(workspace => workspace.pages)
        .find(p => p.id === pageId);
      
      set({ currentPage: page || null });
    },

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
        currentPage: newPage,
      }));

      return newPage.id;
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

    deletePage: (pageId) => {
      set((state) => {
        const newWorkspaces = state.workspaces.map(workspace => ({
          ...workspace,
          pages: workspace.pages.filter(page => page.id !== pageId),
        }));

        const newCurrentPage = state.currentPage?.id === pageId ? null : state.currentPage;

        return {
          workspaces: newWorkspaces,
          currentPage: newCurrentPage,
        };
      });
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
        currentPage: state.currentPage?.id === pageId
          ? {
              ...state.currentPage,
              blocks: [...state.currentPage.blocks, newBlock],
              updatedAt: new Date(),
            }
          : state.currentPage,
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
        currentPage: state.currentPage
          ? {
              ...state.currentPage,
              blocks: state.currentPage.blocks.map(block =>
                block.id === blockId
                  ? { ...block, ...updates, updatedAt: new Date() }
                  : block
              ),
              updatedAt: new Date(),
            }
          : state.currentPage,
      }));
    },

    deleteBlock: (blockId) => {
      set((state) => ({
        workspaces: state.workspaces.map(workspace => ({
          ...workspace,
          pages: workspace.pages.map(page => ({
            ...page,
            blocks: page.blocks.filter(block => block.id !== blockId),
          })),
        })),
        currentPage: state.currentPage
          ? {
              ...state.currentPage,
              blocks: state.currentPage.blocks.filter(block => block.id !== blockId),
              updatedAt: new Date(),
            }
          : state.currentPage,
      }));
    },

    moveBlock: (blockId: string, newIndex: number) => {
      set((state) => {
        if (!state.currentPage) return state;

        const currentIndex = state.currentPage.blocks.findIndex(block => block.id === blockId);
        if (currentIndex === -1 || currentIndex === newIndex) return state;

        const blocks = [...state.currentPage.blocks];
        const [movedBlock] = blocks.splice(currentIndex, 1);
        blocks.splice(newIndex, 0, movedBlock);

        return {
          currentPage: {
            ...state.currentPage,
            blocks,
            updatedAt: new Date(),
          },
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page =>
              page.id === state.currentPage?.id
                ? { ...page, blocks, updatedAt: new Date() }
                : page
            ),
          })),
        };
      });
    },
  }))
);