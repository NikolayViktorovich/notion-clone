export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  NOTIFICATION_DURATION: 3000,
  COPY_FEEDBACK: 2000,
  MODULE_LOAD_CHECK: 100,
  MODULE_LOAD_TIMEOUT: 100,
  AUTH_WINDOW_TIMEOUT: 60000,
  SYNC_RETRY_DELAY: 100,
} as const;

export const LIMITS = {
  MAX_HISTORY_STATES: 50,
  MAX_SEARCH_RESULTS: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_CONTENT_LENGTH: 5000,
  MAX_EXCERPT_LENGTH: 200,
  MAX_TITLE_LENGTH: 200,
  MIN_EDITOR_HEIGHT: 200,
  MAX_OUTPUT_HEIGHT: 320,
  DRIVE_FILES_PAGE_SIZE: 50,
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme-storage',
  GOOGLE_TOKEN: 'google_access_token',
  GOOGLE_USER: 'google_user',
  WEB_CLIPS: 'webClips',
  NOTION_PREFIX: 'notion_',
} as const;

export const DB_CONFIG = {
  NAME: 'NotionOfflineDB',
  VERSION: 1,
  STORES: {
    WORKSPACES: 'workspaces',
    PAGES: 'pages',
    BLOCKS: 'blocks',
    SYNC_QUEUE: 'syncQueue',
  },
} as const;

export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  TODO: 'todo',
  QUOTE: 'quote',
} as const;

export const DEFAULT_BLOCK_CONTENT = {
  [BLOCK_TYPES.TEXT]: '',
  [BLOCK_TYPES.HEADING]: 'Новый заголовок',
  [BLOCK_TYPES.TODO]: 'To Do',
  [BLOCK_TYPES.QUOTE]: 'Цитата',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.08,
  NORMAL: 0.1,
  SLOW: 0.15,
  BLOCK_STAGGER: 0.015,
} as const;
