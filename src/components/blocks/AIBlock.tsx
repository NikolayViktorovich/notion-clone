import { motion } from 'framer-motion';
import { useState } from 'react';
import { Brain, Wand2, Zap, Loader } from 'lucide-react';
import { AIService } from '../../services/aiService';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';

interface AIBlockProps {
  block: Block;
}

export const AIBlock = ({ block }: AIBlockProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { updateBlock } = useStore();

  const handleAIAction = async (action: 'improve' | 'summarize' | 'expand' | 'custom') => {
    if (!block.content.trim()) return;

    setIsGenerating(true);
    
    try {
      let result = '';
      
      switch (action) {
        case 'improve':
          result = await AIService.improveText(block.content);
          break;
        case 'summarize':
          result = await AIService.summarizeText(block.content);
          break;
        case 'expand':
          result = await AIService.expandText(block.content);
          break;
        case 'custom':
          if (aiPrompt.trim()) {
            result = await AIService.generateText(aiPrompt, block.content);
          }
          break;
      }

      if (result) {
        updateBlock(block.id, { content: result });
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI action failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      {/* Основной контент блока */}
      <div className="mb-4 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">AI Assistant</span>
          {isGenerating && <Loader className="w-4 h-4 animate-spin" />}
        </div>

        {/* AI Actions */}
        <div className="flex flex-wrap gap-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAIAction('improve')}
            disabled={isGenerating || !block.content.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
          >
            <Wand2 className="w-3 h-3" />
            Improve
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAIAction('summarize')}
            disabled={isGenerating || !block.content.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            Summarize
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAIAction('expand')}
            disabled={isGenerating || !block.content.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded text-sm disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            Expand
          </motion.button>
        </div>

        {/* Custom Prompt */}
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to do something..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAIAction('custom')}
            disabled={isGenerating || !aiPrompt.trim()}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm disabled:opacity-50"
          >
            Ask AI
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};