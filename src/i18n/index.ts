export type Language = 'ru' | 'en';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    loading: string;
    error: string;
    success: string;
  };
  editor: {
    untitled: string;
    emptyPage: string;
    addBlock: string;
    createFirstBlock: string;
    startCreating: string;
    exportPage: string;
    noPageSelected: string;
    selectOrCreate: string;
    created: string;
    updated: string;
  };
  blocks: {
    text: string;
    heading: string;
    todo: string;
    quote: string;
    emptyText: string;
    emptyHeading: string;
    emptyTodo: string;
    emptyQuote: string;
    newHeading: string;
    todoItem: string;
    quotePlaceholder: string;
    textPlaceholder: string;
  };
  sidebar: {
    newPage: string;
    search: string;
    templates: string;
    settings: string;
  };
  app: {
    welcomeTitle: string;
    welcomeText: string;
    welcomeHeading: string;
  };
  theme: {
    light: string;
    dark: string;
    blueLight: string;
    blueDark: string;
    changeTheme: string;
  };
  templates: {
    blank: string;
    blankDesc: string;
    meetingNotes: string;
    meetingNotesDesc: string;
    projectPlan: string;
    projectPlanDesc: string;
    weeklyPlan: string;
    weeklyPlanDesc: string;
    learningNotes: string;
    learningNotesDesc: string;
    agenda: string;
    item: string;
    discussion: string;
    keyPoints: string;
    projectGoals: string;
    mainGoal: string;
    tasks: string;
    task: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    learningTopic: string;
  };
  googleDrive: {
    title: string;
    signInPrompt: string;
    signIn: string;
    signOut: string;
    saveCurrentPage: string;
    myFiles: string;
    recentFiles: string;
    noFiles: string;
    saveTitle: string;
    saveDescription: string;
    saveButton: string;
    loadTooltip: string;
    openInDrive: string;
    deleteTooltip: string;
  };
  offline: {
    offline: string;
    online: string;
    syncing: string;
    synced: string;
    sync: string;
  };
  modal: {
    confirmDelete: string;
    areYouSure: string;
    save: string;
    cancel: string;
    placeholder: string;
    pageName: string;
  };
  undoRedo: {
    undo: string;
    redo: string;
  };
  search: {
    search: string;
    searchPlaceholder: string;
    noResults: string;
    tryAgain: string;
    startTyping: string;
    blockType: string;
  };
  templateCategories: {
    all: string;
    work: string;
    personal: string;
    planning: string;
    notes: string;
  };
}

const ru: Translations = {
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    search: 'Поиск',
    loading: 'Загрузка',
    error: 'Ошибка',
    success: 'Успешно',
  },
  editor: {
    untitled: 'Без названия',
    emptyPage: 'Страница не выбрана',
    addBlock: 'Добавить блок',
    createFirstBlock: 'Создайте свой первый блок',
    startCreating: 'Начните создавать свою страницу с помощью блоков контента',
    exportPage: 'Экспорт страницы',
    noPageSelected: 'Страница не выбрана',
    selectOrCreate: 'Выберите страницу на боковой панели или создайте новую',
    created: 'Создано',
    updated: 'Обновлено',
  },
  blocks: {
    text: 'Текст',
    heading: 'Заголовок',
    todo: 'To Do',
    quote: 'Цитата',
    emptyText: 'Пустой текстовый блок...',
    emptyHeading: 'Пустой заголовок...',
    emptyTodo: 'Empty todo item...',
    emptyQuote: 'Пустая цитата...',
    newHeading: 'Новый заголовок',
    todoItem: 'To Do',
    quotePlaceholder: 'Цитата...',
    textPlaceholder: 'Напишите что-нибудь...',
  },
  sidebar: {
    newPage: 'Новая страница',
    search: 'Поиск',
    templates: 'Шаблоны',
    settings: 'Настройки',
  },
  app: {
    welcomeTitle: 'Добро пожаловать в Notion Clone',
    welcomeText: 'Это простой текстовый блок. Нажмите, чтобы редактировать!',
    welcomeHeading: 'Это заголовок',
  },
  theme: {
    light: 'Светлая',
    dark: 'Тёмная',
    blueLight: 'Синяя светлая',
    blueDark: 'Синяя тёмная',
    changeTheme: 'Сменить тему',
  },
  templates: {
    blank: 'Чистая страница',
    blankDesc: 'Начните с чистого листа',
    meetingNotes: 'Заметки с встречи',
    meetingNotesDesc: 'Структура для ведения минут встреч',
    projectPlan: 'План проекта',
    projectPlanDesc: 'Структура для планирования проекта',
    weeklyPlan: 'Недельный план',
    weeklyPlanDesc: 'Планирование на неделю',
    learningNotes: 'Конспект обучения',
    learningNotesDesc: 'Структура для ведения конспектов',
    agenda: 'Повестка дня',
    item: 'Пункт',
    discussion: 'Обсуждение',
    keyPoints: 'Ключевые моменты обсуждения...',
    projectGoals: 'Цели проекта',
    mainGoal: 'Основная цель',
    tasks: 'Задачи',
    task: 'Задача',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
    learningTopic: 'Тема обучения',
  },
  googleDrive: {
    title: 'Google Drive',
    signInPrompt: 'Войдите в аккаунт Google для синхронизации',
    signIn: 'Войти в Google',
    signOut: 'Выйти',
    saveCurrentPage: 'Сохранить текущую страницу',
    myFiles: 'Мои файлы в Drive',
    recentFiles: 'Последние файлы',
    noFiles: 'Файлы не найдены',
    saveTitle: 'Сохранить в Google Drive',
    saveDescription: 'Введите название файла для сохранения в Google Drive',
    saveButton: 'Сохранить',
    loadTooltip: 'Загрузить',
    openInDrive: 'Открыть в Drive',
    deleteTooltip: 'Удалить',
  },
  offline: {
    offline: 'Оффлайн',
    online: 'Онлайн',
    syncing: 'Синхронизация...',
    synced: 'Синхронизировано',
    sync: 'Синхронизировать',
  },
  modal: {
    confirmDelete: 'Подтвердите удаление',
    areYouSure: 'Вы уверены?',
    save: 'Сохранить',
    cancel: 'Отмена',
    placeholder: 'Введите значение',
    pageName: 'Название страницы',
  },
  undoRedo: {
    undo: 'Отменить (Ctrl+Z)',
    redo: 'Повторить (Ctrl+Y)',
  },
  search: {
    search: 'Поиск...',
    searchPlaceholder: 'Поиск по всем страницам и блокам...',
    noResults: 'Ничего не найдено',
    tryAgain: 'Попробуйте изменить запрос',
    startTyping: 'Начните вводить запрос для поиска',
    blockType: 'блок',
  },
  templateCategories: {
    all: 'Все',
    work: 'Работа',
    personal: 'Личное',
    planning: 'Планирование',
    notes: 'Заметки',
  },
};

const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
  },
  editor: {
    untitled: 'Untitled',
    emptyPage: 'No page selected',
    addBlock: 'Add block',
    createFirstBlock: 'Create your first block',
    startCreating: 'Start creating your page with content blocks',
    exportPage: 'Export page',
    noPageSelected: 'No page selected',
    selectOrCreate: 'Select a page from the sidebar or create a new one',
    created: 'Created',
    updated: 'Updated',
  },
  blocks: {
    text: 'Text',
    heading: 'Heading',
    todo: 'To Do',
    quote: 'Quote',
    emptyText: 'Empty text block...',
    emptyHeading: 'Empty heading...',
    emptyTodo: 'Empty todo item...',
    emptyQuote: 'Empty quote...',
    newHeading: 'New heading',
    todoItem: 'To Do',
    quotePlaceholder: 'Quote...',
    textPlaceholder: 'Write something...',
  },
  sidebar: {
    newPage: 'New page',
    search: 'Search',
    templates: 'Templates',
    settings: 'Settings',
  },
  app: {
    welcomeTitle: 'Welcome to Notion Clone',
    welcomeText: 'This is a simple text block. Click to edit!',
    welcomeHeading: 'This is a heading',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    blueLight: 'Blue Light',
    blueDark: 'Blue Dark',
    changeTheme: 'Change theme',
  },
  templates: {
    blank: 'Blank page',
    blankDesc: 'Start with a clean slate',
    meetingNotes: 'Meeting notes',
    meetingNotesDesc: 'Structure for meeting minutes',
    projectPlan: 'Project plan',
    projectPlanDesc: 'Structure for project planning',
    weeklyPlan: 'Weekly plan',
    weeklyPlanDesc: 'Weekly planning',
    learningNotes: 'Learning notes',
    learningNotesDesc: 'Structure for taking notes',
    agenda: 'Agenda',
    item: 'Item',
    discussion: 'Discussion',
    keyPoints: 'Key discussion points...',
    projectGoals: 'Project Goals',
    mainGoal: 'Main goal',
    tasks: 'Tasks',
    task: 'Task',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    learningTopic: 'Learning Topic',
  },
  googleDrive: {
    title: 'Google Drive',
    signInPrompt: 'Sign in to Google account to sync',
    signIn: 'Sign in to Google',
    signOut: 'Sign out',
    saveCurrentPage: 'Save current page',
    myFiles: 'My files in Drive',
    recentFiles: 'Recent files',
    noFiles: 'No files found',
    saveTitle: 'Save to Google Drive',
    saveDescription: 'Enter file name to save to Google Drive',
    saveButton: 'Save',
    loadTooltip: 'Load',
    openInDrive: 'Open in Drive',
    deleteTooltip: 'Delete',
  },
  offline: {
    offline: 'Offline',
    online: 'Online',
    syncing: 'Syncing...',
    synced: 'Synced',
    sync: 'Sync',
  },
  modal: {
    confirmDelete: 'Confirm deletion',
    areYouSure: 'Are you sure?',
    save: 'Save',
    cancel: 'Cancel',
    placeholder: 'Enter value',
    pageName: 'Page name',
  },
  undoRedo: {
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
  },
  search: {
    search: 'Search...',
    searchPlaceholder: 'Search all pages and blocks...',
    noResults: 'Nothing found',
    tryAgain: 'Try changing your query',
    startTyping: 'Start typing to search',
    blockType: 'block',
  },
  templateCategories: {
    all: 'All',
    work: 'Work',
    personal: 'Personal',
    planning: 'Planning',
    notes: 'Notes',
  },
};

const translations: Record<Language, Translations> = { ru, en };

let currentLanguage: Language = 'ru';
const listeners: Set<() => void> = new Set();

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('app_language', lang);
  listeners.forEach(listener => listener());
};

export const getLanguage = (): Language => {
  const stored = localStorage.getItem('app_language') as Language;
  return stored || currentLanguage;
};

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[getLanguage()];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const useTranslation = () => {
  const lang = getLanguage();
  
  return {
    t,
    language: lang,
    setLanguage,
  };
};
