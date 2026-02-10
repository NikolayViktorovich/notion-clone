import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { createElement } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface HeaderBlockProps {
  block: Block;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const HeaderBlock = ({ block, level = 1 }: HeaderBlockProps) => {
  const { t } = useI18n();
  const { updateBlock } = useStore();
  const { text, isEditing, ref, setText, setIsEditing, save, handleKeyDown } = useBlockEditor(
    block,
    (content) => updateBlock(block.id, { content })
  );

  const sizeClasses = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm',
  };

  return (
    <div className="notion-block">
      {isEditing ? (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className={`w-full resize-none border-none outline-none font-bold leading-tight bg-transparent text-text placeholder-text-secondary px-2 py-1 ${sizeClasses[level]}`}
          style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          placeholder={t('blocks.heading')}
        />
      ) : (
        createElement(
          `h${level}`,
          {
            onClick: () => setIsEditing(true),
            className: `cursor-text font-bold leading-tight min-h-[1.5em] text-text px-2 py-1 ${sizeClasses[level]}`,
            style: { wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }
          },
          text || createElement('span', { className: 'text-text-secondary' }, t('blocks.emptyHeading'))
        )
      )}
    </div>
  );
};
