import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { PageTemplate } from '../../../types';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector = ({ isOpen, onClose, onTemplateSelect }: TemplateSelectorProps) => {
  const { templates } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'personal', name: 'Личное' },
    { id: 'work', name: 'Работа' },
    { id: 'project', name: 'Проекты' },
    { id: 'education', name: 'Обучение' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: PageTemplate) => {
    onTemplateSelect(template.id);
    onClose();
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <div
            className="bg-background w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-base font-medium text-text">Шаблоны</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-hover rounded transition-colors text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border space-y-3">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded outline-none text-text placeholder-text-secondary"
              />
              
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-background text-text border border-border'
                        : 'bg-hover text-text hover:bg-border'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-text-secondary text-sm">
                  Шаблоны не найдены
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-3 border border-border rounded hover:border-accent transition-colors bg-background"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-text truncate">
                            {template.name}
                          </h3>
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {template.blocks.length} блоков
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
