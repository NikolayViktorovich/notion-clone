import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, CheckCircle, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Comment } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface CommentSystemProps {
  blockId: string;
}

export const CommentSystem = ({ blockId }: CommentSystemProps) => {
  const { getBlockComments, addComment, resolveComment, deleteComment } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const comments = getBlockComments(blockId);

  const handleAddComment = () => {
    if (newComment.trim()) { addComment(blockId, newComment.trim()); setNewComment(''); }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${comments.length > 0 ? 'bg-hover text-text hover:bg-border' : 'bg-hover text-text-secondary hover:bg-border'}`}>
        <MessageCircle className="w-3 h-3" /><span>{comments.length}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, x: 5, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 5, scale: 0.95 }} transition={{ duration: 0.08 }} className="absolute right-0 top-8 z-50 w-80 bg-background border border-border rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-text">Комментарии</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-hover rounded text-text-secondary"><X className="w-4 h-4" /></button>
            </div>

            <div className="max-h-64 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">Пока нет комментариев</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (<CommentItem key={comment.id} comment={comment} onResolve={() => resolveComment(comment.id)} onDelete={() => deleteComment(comment.id)} />))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Добавить комментарий..." className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-background text-text" rows={3} />
              <div className="flex justify-end mt-2">
                <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-4 py-2 bg-accent text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors special-theme-button">Добавить</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CommentItem = ({ comment, onResolve, onDelete }: { comment: Comment; onResolve: () => void; onDelete: () => void; }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onResolve} className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors" title="Пометить решенным"><CheckCircle className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Удалить комментарий"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="text-sm text-gray-700">{comment.content}</p>
    </div>
  );
};

export {};
