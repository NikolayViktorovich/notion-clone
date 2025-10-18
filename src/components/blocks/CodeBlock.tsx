import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { Code as CodeIcon, Play, Square, Download, Copy, Check } from 'lucide-react';

const createSafeContext = () => ({
  console: {
    log: (...args: any[]) => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      return output;
    },
    error: (...args: any[]) => {
      const output = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      return `Error: ${output}`;
    }
  },
  Math: Math,
  Date: Date,
  String: String,
  Number: Number,
  Array: Array,
  Object: Object,
  JSON: JSON,
});

interface CodeBlockProps {
  block: Block;
}

export const CodeBlock = ({ block }: CodeBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateBlock } = useStore();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  useEffect(() => {
    if (content.includes('import ') || content.includes('type ') || content.includes('interface ')) {
      setLanguage('typescript');
    } else {
      setLanguage('javascript');
    }
  }, [content]);

  const handleSave = () => {
    if (content !== block.content) {
      updateBlock(block.id, { content });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    if (e.key === 'Escape') {
      setContent(block.content);
      setIsEditing(false);
    }
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      let codeToExecute = content;

      if (language === 'typescript') {
        try {
          // @ts-ignore
          const { transform } = await import('babel-standalone');
          const result = transform(codeToExecute, {
            presets: ['typescript', 'es2015'],
            filename: 'code.ts'
          });
          codeToExecute = result.code;
        } catch (tsError) {
          setOutput(`TypeScript compilation error: ${tsError}`);
          setIsRunning(false);
          return;
        }
      }

      const safeContext = createSafeContext();
      
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        const output = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        logs.push(output);
        originalConsoleLog(...args);
      };

      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const func = new AsyncFunction(
          ...Object.keys(safeContext),
          `return (async function() { ${codeToExecute} })()`
        );
        
        const result = await func(...Object.values(safeContext));
        
        // Восстанавливаем console.log
        console.log = originalConsoleLog;

        if (result !== undefined) {
          logs.push(String(result));
        }

        setOutput(logs.join('\n') || 'Code executed successfully (no output)');
      } catch (error) {
        console.log = originalConsoleLog;
        setOutput(`Runtime error: ${error}`);
      }
    } catch (error) {
      setOutput(`Execution error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput('Execution stopped');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setOutput('Failed to copy to clipboard');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'typescript' ? 'ts' : 'js'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearOutput = () => {
    setOutput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      {/* Header with language and actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CodeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'javascript' | 'typescript')}
            className="text-xs font-mono bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
              <button
                onClick={downloadCode}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Download code"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              {isRunning ? (
                <button
                  onClick={stopExecution}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Stop execution"
                >
                  <Square className="w-4 h-4 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={executeCode}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Run code"
                >
                  <Play className="w-4 h-4 text-green-600" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Code Editor */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          style={{ minHeight: '150px' }}
          placeholder={`// Write your ${language} code here...\n// Use console.log() to see output`}
        />
      ) : (
        <pre
          onClick={() => setIsEditing(true)}
          className="cursor-text font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg p-4 whitespace-pre-wrap hover:bg-gray-200 transition-colors min-h-[150px] relative"
        >
          <code className={`language-${language}`}>
            {content || <span className="text-gray-400">// Click to write code...</span>}
          </code>
        </pre>
      )}

      {/* Output Panel */}
      {output && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Output</span>
            <button
              onClick={clearOutput}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <pre className="font-mono text-sm bg-white p-4 max-h-60 overflow-y-auto whitespace-pre-wrap">
            <code>{output}</code>
          </pre>
        </motion.div>
      )}

      {/* Execution Status */}
      {isRunning && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Executing code...
        </div>
      )}
    </motion.div>
  );
};