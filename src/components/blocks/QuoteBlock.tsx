import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { useI18n } from '../../hooks/useI18n';

interface QuoteBlockProps {
  block: Block;
}

export const QuoteBlock = ({ block }: QuoteBlockProps) => {
  const { t } = useI18n();
  const { updateBlock } = useStore();
  const { text, isEditing, ref, setText, setIsEditing, save, handleKeyDown } = useBlockEditor(
    block,
    (content) => updateBlock(block.id, { content })
  );

  return (
    <div className="notion-block">
      <div className="border-l-4 border-accent pl-4 py-1 ml-2">
        {isEditing ? (
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-none outline-none text-base italic leading-relaxed bg-transparent text-text-secondary placeholder-text-secondary"
            style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            placeholder={t('blocks.quotePlaceholder')}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text text-base italic leading-relaxed min-h-[1.5em] text-text-secondary"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
          >
            {text || <span className="text-text-secondary">{t('blocks.emptyQuote')}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
