import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextBlock } from './blocks/TextBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { SortableBlock } from './blocks/SortableBlock';
import { useState, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, List, Code, Quote, Download, ChevronLeft } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, DndContext, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { TodoBlock } from './blocks/TodoBlock';
import { AdvancedCodeBlock } from './blocks/AdvancedCodeBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { UndoRedo } from './ui/UndoRedo';
import { formatDate } from '../utils/dateUtils';
import { GoogleDriveManager } from './google/GoogleDriveManager';
import { useNavigate } from 'react-router-dom';

export const Editor = () => {
  const { currentPage, updatePage, createBlock, moveBlock } = useStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { setNodeRef } = useDroppable({
    id: 'editor-drop-area',
  });

  const fastTransition = {
    type: "tween" as const,
    duration: 0.08,
    ease: "easeOut" as const
  };

  const microTransition = {
    type: "tween" as const,
    duration: 0.05,
    ease: "linear" as const
  };

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
    }
  }, [currentPage]);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.setSelectionRange(
        titleRef.current.value.length,
        titleRef.current.value.length
      );
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSave = () => {
    if (currentPage && title !== currentPage.title) {
      updatePage(currentPage.id, { title });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitle(currentPage?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleAddBlock = (type: 'text' | 'heading' | 'todo' | 'code' | 'quote') => {
    if (!currentPage) return;

    const contentMap = {
      text: '',
      heading: 'Новый заголовок',
      todo: 'To Do',
      code: '// Вставьте свой код сюда',
      quote: 'Цитата'
    };

    createBlock(currentPage.id, {
      type,
      content: contentMap[type],
    });
    setShowBlockMenu(false);
  };

  const handleExportPage = () => {
    if (!currentPage) return;

    const data = {
      title: currentPage.title,
      blocks: currentPage.blocks,
      createdAt: currentPage.createdAt,
      updatedAt: currentPage.updatedAt,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.title || 'page'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id && currentPage) {
      const activeIndex = currentPage.blocks.findIndex(block => block.id === active.id);
      const overIndex = currentPage.blocks.findIndex(block => block.id === over?.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        moveBlock(active.id as string, overIndex);
      }
    }
  };

  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Текст' },
    { type: 'heading' as const, icon: Heading1, label: 'Заголовок' },
    { type: 'todo' as const, icon: List, label: 'To Do' },
    { type: 'code' as const, icon: Code, label: 'Код' },
    { type: 'quote' as const, icon: Quote, label: 'Цитата' },
  ];

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-hover rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">
            Страница не выбрана
          </h2>
          <p className="text-text-secondary">
            Выберите страницу на боковой панели или создайте новую
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="lg:hidden mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-hover rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад к страницам
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <UndoRedo />
          <div className="flex gap-2 flex-wrap">
            <GoogleDriveManager />
            <button
              onClick={handleExportPage}
              className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button flex-1 sm:flex-none justify-center"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Экспорт страницы</span>
              <span className="sm:hidden">Экспорт</span>
            </button>
          </div>
        </div>

        {/* Обложка */}
        {currentPage.cover && (
          <img
            src={currentPage.cover}
            alt="Cover"
            className="w-full h-32 sm:h-48 object-cover rounded-lg mb-6 lg:mb-8 border border-border"
          />
        )}

        {/* Иконка и заголовок страницы */}
        <div className="flex items-start gap-3 lg:gap-4 mb-8 lg:mb-12">
          <button className="text-2xl lg:text-4xl mt-1 hover:bg-hover rounded-lg p-1 lg:p-2 transition-colors text-text flex-shrink-0">
            {currentPage.icon || '📄'}
          </button>
          
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-full text-2xl lg:text-4xl font-bold resize-none border-none outline-none bg-transparent leading-tight text-text placeholder-text-secondary"
                style={{ minHeight: '1.5em' }}
                rows={1}
                placeholder="Untitled"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl lg:text-4xl font-bold outline-none cursor-text hover:bg-hover rounded-lg px-2 lg:px-3 py-1 lg:py-2 -mx-2 lg:-mx-3 leading-tight text-text break-words"
              >
                {currentPage.title || 'Untitled'}
              </h1>
            )}
            
            {/* Мета */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-text-secondary text-xs lg:text-sm mt-2">
              <span>Создано: {formatDate(currentPage.createdAt)}</span>
              <span className="hidden sm:inline">•</span>
              <span>Обновлено: {formatDate(currentPage.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Drag & Drop */}
        <div key={currentPage.id}>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div ref={setNodeRef}>
              <SortableContext 
                items={currentPage.blocks.map(block => block.id)} 
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {currentPage.blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={microTransition}
                      layout
                    >
                      <SortableBlock key={block.id} block={block} index={index} isDragging={activeId === block.id}>
                        {block.type === 'text' && <TextBlock block={block} />}
                        {block.type === 'heading' && <HeaderBlock block={block} level={1} />}
                        {block.type === 'todo' && <TodoBlock block={block} />}
                        {block.type === 'code' && <AdvancedCodeBlock block={block} />}
                        {block.type === 'quote' && <QuoteBlock block={block} />}
                      </SortableBlock>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </div>
          </DndContext>
        </div>

        {/* Добавление меню */}
        <div className="relative" ref={blockMenuRef}>
          {showBlockMenu ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fastTransition}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-4 sm:p-6 bg-hover rounded-xl border border-border mb-6"
            >
              {blockTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-background rounded-lg border border-border text-text hover:border-accent hover:shadow-sm transition-all text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <button
              onClick={() => setShowBlockMenu(true)}
              className="w-full p-4 sm:p-6 border-2 border-dashed border-border rounded-xl text-text-secondary hover:text-text hover:border-accent transition-all flex items-center justify-center gap-2 sm:gap-3 hover:bg-hover text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Добавить блок</span>
            </button>
          )}
        </div>

        {/* Пустое состояние */}
        {currentPage.blocks.length === 0 && !showBlockMenu && (
          <div className="text-center py-8 lg:py-16">
            <div className="mb-4 lg:mb-6">
              <button
                onClick={() => setShowBlockMenu(true)}
                className="px-6 py-3 lg:px-8 lg:py-4 bg-accent text-white rounded-xl text-sm lg:text-base font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button hover:scale-[1.02] active:scale-[0.98]"
              >
                + Создайте свой первый блок
              </button>
            </div>
            <p className="text-text-secondary text-xs lg:text-sm">Начните создавать свою страницу с помощью блоков контента</p>
          </div>
        )}
      </div>
    </div>
  );
};