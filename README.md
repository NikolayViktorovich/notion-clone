# Notion Clone

Современный блочный редактор с поддержкой drag & drop, тем оформления и Google Drive интеграции.

![Notion Clone](https://i.postimg.cc/FHGxYWhM/Snimok-ekrana-2026-02-10-v-17-02-15.png)

**[Live Demo](https://notion-clone-chi-seven.vercel.app/)**

---

## Основной функционал

- **Блочный редактор** - текст, заголовки, todo-списки, цитаты
- **Drag & Drop** - перестановка блоков
- **Google Drive** - сохранение и загрузка страниц
- **Offline-first** - работа без интернета (IndexedDB)
- **4 темы** - светлая, темная, синяя светлая, синяя темная
- **Поиск** - по всем страницам и блокам
- **Undo/Redo** - отмена и повтор действий
- **Адаптивный дизайн** - mobile, tablet, desktop

---

## Технологии

**Frontend:** React 19, TypeScript, Zustand, Tailwind CSS, Framer Motion  
**Библиотеки:** @dnd-kit, lucide-react, react-router-dom  
**API:** Google Drive API, IndexedDB  
**Сборка:** React Scripts, Jest

---

## Быстрый старт

```bash
git clone https://github.com/NikolayViktorovich/notion-clone.git
cd notion-clone
npm install
npm start
```

Откроется на `http://localhost:3000`

---

## Google Drive (опционально)

Создайте OAuth credentials в [Google Cloud Console](https://console.cloud.google.com/) и добавьте в `.env`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
REACT_APP_GOOGLE_API_KEY=your_api_key
```

---

## Что реализовано

- Блочный редактор с 4 типами блоков  
- Drag & Drop для перестановки  
- Google OAuth 2.0 + Drive API  
- Offline-first с IndexedDB  
- Undo/Redo функциональность  
- Поиск по контенту  
- Шаблоны страниц  
- Экспорт в JSON  
- 4 темы оформления  
- Адаптивный дизайн  

---

## Production Build

```bash
npm run build
# Bundle size (gzipped): ~109 KB JS + ~6 KB CSS
```
