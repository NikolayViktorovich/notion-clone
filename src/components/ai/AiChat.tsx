import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, X, Wand2, Zap, Expand, Languages, CheckCircle } from 'lucide-react';
import { AIService } from '../../services/aiService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  onClose: () => void;
}

export const AIChat = ({ onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я ваш AI-ассистент на базе Cohere AI. Готов помочь с:\n\n• ✍️ Улучшением текста\n• 📋 Суммаризацией\n• 🔍 Расширением содержания\n• ✅ Исправлением ошибок\n• 💡 Генерацией идей',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      } else {
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await AIService.generateText(input);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Извините, произошла ошибка. Пожалуйста, проверьте подключение к интернету и попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string, customText?: string) => {
    if (isLoading) return;

    const textToProcess = customText || selectedText;
    
    if (!textToProcess && action !== 'ideas') {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Пожалуйста, выделите текст в редакторе для выполнения этого действия.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const actionMessage: Message = {
      id: crypto.randomUUID(),
      content: `Запрос: ${action}${textToProcess ? `\nТекст: "${textToProcess}"` : ''}`,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsLoading(true);

    try {
      let response = '';
      switch (action) {
        case 'improve':
          response = await AIService.improveText(textToProcess);
          break;
        case 'summarize':
          response = await AIService.summarizeText(textToProcess);
          break;
        case 'expand':
          response = await AIService.expandText(textToProcess);
          break;
        case 'correct':
          response = await AIService.correctGrammar(textToProcess);
          break;
        case 'ideas':
          response = await AIService.generateText('Придумай 5 креативных идей для контента:');
          break;
        default:
          response = await AIService.generateText(action);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Quick action error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Ошибка при выполнении действия. Пожалуйста, попробуйте еще раз.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { 
      icon: <Wand2 className="w-3 h-3" />, 
      label: 'Улучшить', 
      action: 'improve',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    { 
      icon: <Zap className="w-3 h-3" />, 
      label: 'Суммаризировать', 
      action: 'summarize',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    { 
      icon: <Expand className="w-3 h-3" />, 
      label: 'Расширить', 
      action: 'expand',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    { 
      icon: <CheckCircle className="w-3 h-3" />, 
      label: 'Исправить', 
      action: 'correct',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="w-96 h-full bg-white border-l border-gray-200 flex flex-col shadow-xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Cohere AI Assistant</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Selected Text Info */}
        {selectedText && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-medium text-yellow-800">Выделенный текст:</div>
            <div className="text-yellow-700 truncate">{selectedText}</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(({ icon, label, action, color }) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading || (!selectedText && action !== 'ideas')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-purple-500" />
              <span className="text-sm text-gray-600">Cohere AI обрабатывает запрос...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2 mb-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Спросите Cohere AI или дайте задание..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="self-end p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg disabled:opacity-50 transition-opacity"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        
        {/* API Status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cohere API подключен</span>
          </div>
          <span>v1.0</span>
        </div>
      </div>
    </motion.div>
  );
};