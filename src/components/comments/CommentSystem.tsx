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
    if (newComment.trim()) {
      addComment(blockId, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="relative">
      {/* Кнопка комментариев */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          comments.length > 0
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <MessageCircle className="w-3 h-3" />
        <span>{comments.length}</span>
      </button>

      {/* Панель комментариев */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="absolute right-0 top-8 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Комментарии</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Список комментариев */}
            <div className="max-h-64 overflow-y-auto p-4">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Пока нет комментариев
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onResolve={() => resolveComment(comment.id)}
                      onDelete={() => deleteComment(comment.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Форма нового комментария */}
            <div className="p-4 border-t border-gray-200">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CommentItem = ({ 
  comment, 
  onResolve, 
  onDelete 
}: { 
  comment: Comment;
  onResolve: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onResolve}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
            title="Пометить решенным"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Удалить комментарий"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-700">{comment.content}</p>
    </div>
  );
};

export {};