import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TextBlock } from './blocks/TextBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { SortableBlock } from './blocks/SortableBlock';
import { useState, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, List, Quote, Download } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, DndContext, DragEndEvent, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { TodoBlock } from './blocks/TodoBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { formatDate } from '../utils/dateUtils';
import { GoogleDriveManager } from './google/GoogleDriveManager';
import { Modal } from './ui/Modal';
import { UndoRedo } from './ui/UndoRedo';
import { useI18n } from '../hooks/useI18n';

export const Editor = () => {
  const { t } = useI18n();
  const { currentPage: page, updatePage, createBlock, moveBlock, deleteBlock } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showDel, setShowDel] = useState(false);
  const [delId, setDelId] = useState('');
  const [delText, setDelText] = useState('');
  
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({ id: 'editor-drop-area' });

  useEffect(() => {
    if (page) setTitle(page.title);
  }, [page]);

  useEffect(() => {
    if (editing && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length);
    }
  }, [editing]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveTitle = () => {
    if (page && title !== page.title) updatePage(page.id, { title });
    setEditing(false);
  };

  const keyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); saveTitle(); }
    if (e.key === 'Escape') { setTitle(page?.title || ''); setEditing(false); }
  };

  const addBlock = (type: 'text' | 'heading' | 'todo' | 'quote') => {
    if (!page) return;
    const content = { 
      text: '', 
      heading: t('blocks.newHeading'), 
      todo: t('blocks.todoItem'), 
      quote: t('blocks.quotePlaceholder') 
    };
    createBlock(page.id, { type, content: content[type] });
    setShowMenu(false);
  };

  const exportPage = () => {
    if (!page) return;
    const data = { title: page.title, blocks: page.blocks, createdAt: page.createdAt, updatedAt: page.updatedAt };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title || 'page'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dragStart = (e: DragStartEvent) => setDragId(e.active.id as string);

  const dragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setDragId(null);
    if (active.id !== over?.id && page) {
      const from = page.blocks.findIndex(b => b.id === active.id);
      const to = page.blocks.findIndex(b => b.id === over?.id);
      if (from !== -1 && to !== -1) moveBlock(active.id as string, to);
    }
  };

  const openDel = (id: string, text: string) => {
    setDelId(id);
    setDelText(text);
    setShowDel(true);
  };

  const closeDel = () => {
    setShowDel(false);
    setDelId('');
    setDelText('');
  };

  const confirmDel = () => {
    if (delId) { deleteBlock(delId); closeDel(); }
  };

  const types = [
    { type: 'text' as const, icon: Type, label: t('blocks.text') },
    { type: 'heading' as const, icon: Heading1, label: t('blocks.heading') },
    { type: 'todo' as const, icon: List, label: t('blocks.todo') },
    { type: 'quote' as const, icon: Quote, label: t('blocks.quote') },
  ];

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-background">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-hover rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">{t('editor.noPageSelected')}</h2>
          <p className="text-text-secondary text-sm">{t('editor.selectOrCreate')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background min-h-screen safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-8">
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between">
            <UndoRedo />
            <div className="flex items-center gap-2">
              <GoogleDriveManager />
              <button onClick={exportPage} className="flex items-center gap-1 px-2 py-2 bg-accent text-white rounded-lg text-sm hover:opacity-90 transition-colors shadow-sm special-theme-button" title={t('editor.exportPage')}>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 lg:mb-6">
          <div className="flex gap-2 flex-wrap"><UndoRedo /></div>
          <div className="flex gap-2 flex-wrap">
            <GoogleDriveManager />
            <button onClick={exportPage} className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button">
              <Download className="w-4 h-4" /><span>{t('editor.exportPage')}</span>
            </button>
          </div>
        </div>

        {page.cover && (
          <img src={page.cover} alt="Cover" className="w-full h-20 sm:h-28 md:h-36 lg:h-44 object-cover rounded-lg mb-3 sm:mb-4 lg:mb-6 border border-border" />
        )}

        <div className="flex items-start gap-4 lg:gap-4 mb-6 lg:mb-6">
          <div className="text-3xl sm:text-3xl lg:text-4xl mt-1 flex-shrink-0">{page.icon || '📄'}</div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <textarea ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} onKeyDown={keyDown} className="w-full text-2xl sm:text-2xl lg:text-4xl font-bold resize-none border-none outline-none bg-transparent leading-tight text-text placeholder-text-secondary" style={{ minHeight: '1.5em' }} rows={1} placeholder={t('editor.untitled')} />
            ) : (
              <h1 onClick={() => setEditing(true)} className="w-full text-2xl sm:text-2xl lg:text-4xl font-bold outline-none cursor-text hover:bg-hover rounded-lg px-3 lg:px-3 py-2 lg:py-2 -mx-3 lg:-mx-3 leading-tight text-text break-words">{page.title || t('editor.untitled')}</h1>
            )}
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-text-secondary text-sm mt-3">
              <span className="text-sm">{t('editor.created')}: {formatDate(page.createdAt)}</span>
              <span className="hidden xs:inline">•</span>
              <span className="text-sm">{t('editor.updated')}: {formatDate(page.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div key={page.id}>
          <DndContext collisionDetection={closestCenter} onDragStart={dragStart} onDragEnd={dragEnd}>
            <div ref={setNodeRef}>
              <SortableContext items={page.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {page.blocks.map((b, i) => (
                  <div key={b.id}>
                    <SortableBlock block={b} index={i} isDragging={dragId === b.id} onDeleteClick={openDel}>
                      {b.type === 'text' && <TextBlock block={b} />}
                      {b.type === 'heading' && <HeaderBlock block={b} level={1} />}
                      {b.type === 'todo' && <TodoBlock block={b} />}
                      {b.type === 'quote' && <QuoteBlock block={b} />}
                    </SortableBlock>
                  </div>
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>

        <div className="relative" ref={menuRef}>
          {showMenu ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 lg:gap-2 p-3 lg:p-4 bg-hover rounded-lg border border-border mb-3 lg:mb-4 animate-fade-in">
              {types.map(({ type, icon: Icon, label }) => (
                <button 
                  key={type} 
                  onClick={() => addBlock(type)} 
                  className="flex items-center gap-2 xs:gap-2 lg:gap-3 p-2 lg:p-3 bg-background rounded-lg border border-border text-text hover:border-accent transition-colors text-sm"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" /><span className="font-medium text-sm">{label}</span>
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setShowMenu(true)} className="w-full p-4 lg:p-5 border-2 border-dashed border-border rounded-lg text-text-secondary hover:text-text hover:border-accent transition-colors flex items-center justify-center gap-2 hover:bg-hover text-sm lg:text-base">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" /><span className="font-medium">{t('editor.addBlock')}</span>
            </button>
          )}
        </div>

        {page.blocks.length === 0 && !showMenu && (
          <div className="text-center py-6 lg:py-12 px-4">
            <div className="mb-3 lg:mb-4">
              <button onClick={() => setShowMenu(true)} className="px-3 py-2 lg:px-4 lg:py-3 bg-accent text-white rounded-lg text-xs lg:text-sm font-medium hover:opacity-90 transition-colors shadow-sm special-theme-button">+ {t('editor.createFirstBlock')}</button>
            </div>
            <p className="text-text-secondary text-xs">{t('editor.startCreating')}</p>
          </div>
        )}
      </div>

      <Modal isOpen={showDel} onClose={closeDel} onConfirm={confirmDel} title={`${t('common.delete')} ${delText}?`} confirmText={t('common.delete')} type="delete" />
    </div>
  );
};
