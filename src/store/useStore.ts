import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Block, Page, Workspace, NewBlock, Comment, PageTemplate, SearchResult, SearchMatch, AppSnapshot } from '../types';
import { serializeState, deserializeState, cloneState } from '../utils/serialization';
import { offlineStorage } from '../services/offlineStorage';

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

interface AppState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentPage: Page | null;
  sidebarOpen: boolean;
  history: HistoryState;
  templates: PageTemplate[];
  offlineStatus: { isOnline: boolean; hasData: boolean };
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (pageId: string) => void;
  createPage: (workspaceId: string, page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  createBlock: (pageId: string, block: NewBlock) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newIndex: number) => void;
  undo: () => void;
  redo: () => void;
  captureHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addComment: (blockId: string, content: string, userId?: string, userName?: string) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  resolveComment: (commentId: string) => void;
  getBlockComments: (blockId: string) => Comment[];
  searchContent: (query: string) => SearchResult[];
  createPageFromTemplate: (workspaceId: string, templateId: string) => string;
  initializeOffline: () => Promise<void>;
  saveToOffline: () => Promise<void>;
  forceSync: () => Promise<void>;
}

function findPageInWorkspaces(workspaces: Workspace[], pageId: string): Page | null {
  for (const workspace of workspaces) {
    const page = workspace.pages.find(p => p.id === pageId);
    if (page) return page;
  }
  return null;
}

// НОВАЯ ФУНКЦИЯ: Получение полного снапшота состояния
function getFullAppSnapshot(state: AppState): AppSnapshot {
  return {
    workspaces: cloneState(state.workspaces),
    currentWorkspace: state.currentWorkspace ? cloneState(state.currentWorkspace) : null,
    currentPage: state.currentPage ? cloneState(state.currentPage) : null,
    sidebarOpen: state.sidebarOpen,
  };
}

// Функция для создания начального снапшота
function createInitialSnapshot(): AppSnapshot {
  return {
    workspaces: [
      {
        id: 'default',
        name: 'My Workspace',
        pages: [],
      },
    ],
    currentWorkspace: {
      id: 'default',
      name: 'My Workspace',
      pages: [],
    },
    currentPage: null,
    sidebarOpen: true,
  };
}

export const useStore = create<AppState>()(
  devtools((set, get) => {
    // Создаем начальный снапшот
    const initialSnapshot = createInitialSnapshot();
    const initialHistory = {
      past: [],
      present: serializeState(initialSnapshot),
      future: []
    };

    return {
      workspaces: initialSnapshot.workspaces,
      currentWorkspace: initialSnapshot.currentWorkspace,
      currentPage: initialSnapshot.currentPage,
      sidebarOpen: initialSnapshot.sidebarOpen,
      history: initialHistory,
      offlineStatus: { isOnline: navigator.onLine, hasData: false },
      templates: [
        {
          id: 'blank',
          name: 'Чистая страница',
          description: 'Начните с чистого листа',
          icon: '📄',
          category: 'personal',
          blocks: [],
        },
        {
          id: 'meeting-notes',
          name: 'Заметки с встречи',
          description: 'Структура для ведения минут встреч',
          icon: '📋',
          category: 'work',
          blocks: [
            {
              type: 'heading',
              content: 'Повестка дня',
            },
            {
              type: 'bullet',
              content: 'Пункт 1',
            },
            {
              type: 'bullet',
              content: 'Пункт 2',
            },
            {
              type: 'heading',
              content: 'Обсуждение',
            },
            {
              type: 'paragraph',
              content: 'Ключевые моменты обсуждения...',
            },
          ],
        },
        {
          id: 'project-plan',
          name: 'План проекта',
          description: 'Структура для планирования проекта',
          icon: '🚀',
          category: 'project',
          blocks: [
            {
              type: 'heading',
              content: 'Цели проекта',
            },
            {
              type: 'bullet',
              content: 'Основная цель',
            },
            {
              type: 'heading',
              content: 'Задачи',
            },
            {
              type: 'todo',
              content: 'Задача 1',
            },
            {
              type: 'todo',
              content: 'Задача 2',
            },
          ],
        },
        {
          id: 'weekly-plan',
          name: 'Недельный план',
          description: 'Планирование на неделю',
          icon: '📅',
          category: 'personal',
          blocks: [
            {
              type: 'heading',
              content: 'Понедельник',
            },
            {
              type: 'todo',
              content: '',
            },
            {
              type: 'heading',
              content: 'Вторник',
            },
            {
              type: 'todo',
              content: '',
            },
          ],
        },
        {
          id: 'learning-notes',
          name: 'Конспект обучения',
          description: 'Структура для ведения конспектов',
          icon: '📚',
          category: 'education',
          blocks: [
            {
              type: 'heading',
              content: 'Тема обучения',
            },
            {
              type: 'heading',
              content: 'Ключевые моменты',
            },
            {
              type: 'bullet',
              content: 'Основная концепция 1',
            },
            {
              type: 'bullet',
              content: 'Основная концепция 2',
            },
            {
              type: 'heading',
              content: 'Выводы',
            },
          ],
        },
      ],

      initializeOffline: async () => {
        try {
          const [workspaces, pages] = await Promise.all([
            offlineStorage.loadWorkspaces(),
            offlineStorage.loadPages()
          ]);

          if (workspaces.length > 0 || pages.length > 0) {
            const currentState = get();
            set({ 
              workspaces: workspaces.length > 0 ? workspaces : currentState.workspaces,
              currentWorkspace: workspaces[0] || currentState.currentWorkspace
            });
          }

          set({ offlineStatus: offlineStorage.getStatus() });
        } catch (error) {
          console.error('Error initializing offline data:', error);
        }
      },

      saveToOffline: async () => {
        const state = get();
        try {
          await Promise.all([
            offlineStorage.saveWorkspaces(state.workspaces),
            offlineStorage.savePages(state.workspaces.flatMap((w: any) => w.pages)),
            offlineStorage.saveBlocks(state.currentPage?.blocks || [])
          ]);
          
          set({ offlineStatus: offlineStorage.getStatus() });
        } catch (error) {
          console.error('Error saving to offline storage:', error);
        }
      },

      forceSync: async () => {
        await offlineStorage.forceSync();
        set({ offlineStatus: offlineStorage.getStatus() });
      },

      // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Сохраняем полное состояние
      captureHistory: () => {
        const state = get();
        const snapshot = getFullAppSnapshot(state);
        const serializedState = serializeState(snapshot);
        
        set({
          history: {
            past: [...state.history.past, state.history.present],
            present: serializedState,
            future: []
          }
        });
      },

      // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Восстанавливаем полное состояние
      undo: () => {
        const state = get();
        const { past, present, future } = state.history;
        
        if (past.length === 0) return;

        const previousStateSerialized = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        const previousState = deserializeState<AppSnapshot>(previousStateSerialized);

        // ВОССТАНАВЛИВАЕМ ВСЕ КРИТИЧЕСКИЕ СОСТОЯНИЯ
        set({
          workspaces: previousState.workspaces,
          currentWorkspace: previousState.currentWorkspace,
          currentPage: previousState.currentPage,
          sidebarOpen: previousState.sidebarOpen,
          history: {
            past: newPast,
            present: previousStateSerialized,
            future: [present, ...future]
          }
        });

        state.saveToOffline();
      },

      // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Восстанавливаем полное состояние
      redo: () => {
        const state = get();
        const { past, present, future } = state.history;
        
        if (future.length === 0) return;

        const nextStateSerialized = future[0];
        const newFuture = future.slice(1);

        const nextState = deserializeState<AppSnapshot>(nextStateSerialized);

        // ВОССТАНАВЛИВАЕМ ВСЕ КРИТИЧЕСКИЕ СОСТОЯНИЯ
        set({
          workspaces: nextState.workspaces,
          currentWorkspace: nextState.currentWorkspace,
          currentPage: nextState.currentPage,
          sidebarOpen: nextState.sidebarOpen,
          history: {
            past: [...past, present],
            present: nextStateSerialized,
            future: newFuture
          }
        });

        state.saveToOffline();
      },

      canUndo: () => {
        return get().history.past.length > 0;
      },

      canRedo: () => {
        return get().history.future.length > 0;
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setCurrentPage: (pageId) => {
        const state = get();
        const page = findPageInWorkspaces(state.workspaces, pageId);
        set({ currentPage: page || null });
      },

      createPage: (workspaceId, page) => {
        const state = get();
        state.captureHistory();

        const newPage: Page = {
          ...page,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          blocks: [],
        };

        set((state) => ({
          workspaces: state.workspaces.map(workspace =>
            workspace.id === workspaceId
              ? { ...workspace, pages: [...workspace.pages, newPage] }
              : workspace
          ),
          currentPage: newPage,
          currentWorkspace: state.workspaces.find(w => w.id === workspaceId) || state.currentWorkspace,
        }));

        state.saveToOffline();

        return newPage.id;
      },

      updatePage: (pageId, updates) => {
        const state = get();
        state.captureHistory();
        
        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page =>
              page.id === pageId
                ? { 
                    ...page, 
                    ...updates, 
                    updatedAt: new Date(),
                    createdAt: page.createdAt 
                  }
                : page
            ),
          })),
          currentPage: state.currentPage?.id === pageId
            ? { 
                ...state.currentPage, 
                ...updates, 
                updatedAt: new Date(),
                createdAt: state.currentPage.createdAt
              }
            : state.currentPage,
        }));

        state.saveToOffline();
      },

      deletePage: (pageId) => {
        const state = get();
        state.captureHistory();

        set((state) => {
          const newWorkspaces = state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.filter(page => page.id !== pageId),
          }));

          let newCurrentPage = state.currentPage;

          if (state.currentPage?.id === pageId) {
            const currentWorkspace = newWorkspaces.find(w => 
              w.pages.some(p => p.id === pageId)
            ) || newWorkspaces[0];
            newCurrentPage = currentWorkspace?.pages[0] || null;
            if (!newCurrentPage && newWorkspaces.length > 0) {
              const firstWorkspaceWithPages = newWorkspaces.find(w => w.pages.length > 0);
              newCurrentPage = firstWorkspaceWithPages?.pages[0] || null;
            }
          }

          return {
            workspaces: newWorkspaces,
            currentPage: newCurrentPage,
            currentWorkspace: newWorkspaces.find(w => w.id === state.currentWorkspace?.id) || newWorkspaces[0] || null,
          };
        });

        state.saveToOffline();
      },

      createBlock: (pageId, block) => {
        const state = get();
        state.captureHistory();

        const newBlock: Block = {
          ...block,
          id: crypto.randomUUID(),
          children: block.children || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page =>
              page.id === pageId
                ? { 
                    ...page, 
                    blocks: [...page.blocks, newBlock],
                    updatedAt: new Date()
                  }
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

        state.saveToOffline();
      },

      updateBlock: (blockId, updates) => {
        const state = get();
        state.captureHistory();

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page => ({
              ...page,
              blocks: page.blocks.map(block =>
                block.id === blockId
                  ? { 
                      ...block, 
                      ...updates, 
                      updatedAt: new Date(),
                      createdAt: block.createdAt 
                    }
                  : block
              ),
              updatedAt: new Date(),
            })),
          })),
          currentPage: state.currentPage
            ? {
                ...state.currentPage,
                blocks: state.currentPage.blocks.map(block =>
                  block.id === blockId
                    ? { 
                        ...block, 
                        ...updates, 
                        updatedAt: new Date(),
                        createdAt: block.createdAt 
                      }
                    : block
                ),
                updatedAt: new Date(),
              }
            : state.currentPage,
        }));

        state.saveToOffline();
      },

      deleteBlock: (blockId) => {
        const state = get();
        state.captureHistory();

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page => ({
              ...page,
              blocks: page.blocks.filter(block => block.id !== blockId),
              updatedAt: new Date(),
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

        state.saveToOffline();
      },

      moveBlock: (blockId: string, newIndex: number) => {
        const state = get();
        state.captureHistory();

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

        state.saveToOffline();
      },

      addComment: (blockId, content, userId = 'user1', userName = 'Current User') => {
        const state = get();
        state.captureHistory();

        const newComment: Comment = {
          id: crypto.randomUUID(),
          blockId,
          userId,
          userName,
          content,
          createdAt: new Date(),
          resolved: false,
        };

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page => ({
              ...page,
              blocks: page.blocks.map(block =>
                block.id === blockId
                  ? {
                      ...block,
                      comments: [...(block.comments || []), newComment],
                      updatedAt: new Date(),
                    }
                  : block
              ),
            })),
          })),
          currentPage: state.currentPage
            ? {
                ...state.currentPage,
                blocks: state.currentPage.blocks.map(block =>
                  block.id === blockId
                    ? {
                        ...block,
                        comments: [...(block.comments || []), newComment],
                        updatedAt: new Date(),
                      }
                    : block
                ),
              }
            : state.currentPage,
        }));

        state.saveToOffline();
      },

      updateComment: (commentId, updates) => {
        const state = get();
        state.captureHistory();

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page => ({
              ...page,
              blocks: page.blocks.map(block => ({
                ...block,
                comments: block.comments?.map(comment =>
                  comment.id === commentId
                    ? { ...comment, ...updates }
                    : comment
                ),
              })),
            })),
          })),
          currentPage: state.currentPage
            ? {
                ...state.currentPage,
                blocks: state.currentPage.blocks.map(block => ({
                  ...block,
                  comments: block.comments?.map(comment =>
                    comment.id === commentId
                      ? { ...comment, ...updates }
                      : comment
                  ),
                })),
              }
            : state.currentPage,
        }));

        state.saveToOffline();
      },

      deleteComment: (commentId) => {
        const state = get();
        state.captureHistory();

        set((state) => ({
          workspaces: state.workspaces.map(workspace => ({
            ...workspace,
            pages: workspace.pages.map(page => ({
              ...page,
              blocks: page.blocks.map(block => ({
                ...block,
                comments: block.comments?.filter(comment => comment.id !== commentId),
              })),
            })),
          })),
          currentPage: state.currentPage
            ? {
                ...state.currentPage,
                blocks: state.currentPage.blocks.map(block => ({
                  ...block,
                  comments: block.comments?.filter(comment => comment.id !== commentId),
                })),
              }
            : state.currentPage,
        }));

        state.saveToOffline();
      },

      resolveComment: (commentId) => {
        get().updateComment(commentId, { resolved: true });
      },

      getBlockComments: (blockId) => {
        const state = get();
        const block = state.currentPage?.blocks.find(b => b.id === blockId);
        return block?.comments?.filter(comment => !comment.resolved) || [];
      },

      searchContent: (query) => {
        const state = get();
        const results: SearchResult[] = [];
        
        if (!query.trim()) return results;

        const searchTerm = query.toLowerCase();
        
        state.workspaces.forEach(workspace => {
          workspace.pages.forEach(page => {
            page.blocks.forEach(block => {
              const searchInBlock = (block: Block, path: string = '') => {
                const content = block.content.toLowerCase();
                if (content.includes(searchTerm)) {
                  const matches: SearchMatch[] = [];
                  let startIndex = 0;
                  
                  while ((startIndex = content.indexOf(searchTerm, startIndex)) !== -1) {
                    matches.push({
                      text: block.content.substring(startIndex, startIndex + searchTerm.length),
                      start: startIndex,
                      end: startIndex + searchTerm.length,
                    });
                    startIndex += searchTerm.length;
                  }
                  
                  results.push({
                    pageId: page.id,
                    pageTitle: page.title,
                    blockId: block.id,
                    blockType: block.type,
                    content: block.content,
                    matches,
                  });
                }
                
                // Рекурсивно ищем в дочерних блоках
                block.children.forEach((child, index) => {
                  searchInBlock(child, `${path} > ${index}`);
                });
              };
              
              searchInBlock(block);
            });
          });
        });
        
        return results;
      },

      createPageFromTemplate: (workspaceId, templateId) => {
        const state = get();
        const template = state.templates.find(t => t.id === templateId);
        
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }

        const blocks: Block[] = template.blocks.map(newBlock => ({
          ...newBlock,
          id: crypto.randomUUID(),
          children: newBlock.children || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        return state.createPage(workspaceId, {
          title: template.name,
          icon: template.icon,
          blocks: blocks,
        });
      },
    };
  })
);