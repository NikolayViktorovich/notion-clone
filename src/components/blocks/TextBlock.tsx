import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { useI18n } from '../../hooks/useI18n';

interface TextBlockProps {
  block: Block;
}

export const TextBlock = ({ block }: TextBlockProps) => {
  const { t } = useI18n();
  const { updateBlock } = useStore();
  const { text, isEditing, ref, setText, setIsEditing, save, handleKeyDown } = useBlockEditor(
    block,
    (content) => updateBlock(block.id, { content })
  );

  return (
    <div className="notion-block">
      {isEditing ? (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="w-full resize-none border-none outline-none text-base leading-relaxed bg-transparent text-text placeholder-text-secondary px-2 py-1"
          style={{ minHeight: '1.5em', overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          placeholder={t('blocks.textPlaceholder')}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-text text-base leading-relaxed min-h-[1.5em] text-text px-2 py-1"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
        >
          {text || <span className="text-text-secondary">{t('blocks.emptyText')}</span>}
        </div>
      )}
    </div>
  );
};
