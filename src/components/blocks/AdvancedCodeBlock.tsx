import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Block } from '../../types';
import { 
  Code as CodeIcon, 
  Play, 
  Square, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Trash2,
  Settings
} from 'lucide-react';

const moduleCache = new Map();
const loadModule = async (moduleName: string): Promise<any> => {
  if (moduleCache.has(moduleName)) {
    return moduleCache.get(moduleName);
  }
  const cdnUrls: { [key: string]: string } = {
    'lodash': 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    'axios': 'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js',
    'moment': 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
    'uuid': 'https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/umd/uuid.min.js',
    'ramda': 'https://cdn.jsdelivr.net/npm/ramda@0.29.0/dist/ramda.min.js',
    'dayjs': 'https://cdn.jsdelivr.net/npm/dayjs@1.11.9/dayjs.min.js',
    'chance': 'https://cdn.jsdelivr.net/npm/chance@1.1.11/dist/chance.min.js',
  };

  const globalNames: { [key: string]: string } = {
    'lodash': '_',
    'axios': 'axios',
    'moment': 'moment',
    'uuid': 'uuid',
    'ramda': 'R',
    'dayjs': 'dayjs',
    'chance': 'Chance',
  };

  if (cdnUrls[moduleName]) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = cdnUrls[moduleName];
      script.onload = () => {
        // @ts-ignore
        const module = window[globalNames[moduleName]];
        if (module) {
          moduleCache.set(moduleName, module);
          resolve(module);
        } else {
          reject(new Error(`Module ${moduleName} not found in global scope`));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load module: ${moduleName}`));
      document.head.appendChild(script);
    });
  }

  throw new Error(`Module ${moduleName} is not supported`);
};
const resolveImports = async (code: string): Promise<{ code: string; imports: string[] }> => {
  const importRegex = /import\s+(?:\*\s+as\s+)?(\w+)?\s*(?:\{\s*([^}]+)\s*\})?\s+from\s+['"]([^'"]+)['"]/g;
  let resolvedCode = code;
  const imports: string[] = [];
  const loadedModules: string[] = [];

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const [, defaultImport, namedImports, moduleName] = match;
    
    try {
      const module = await loadModule(moduleName);
      loadedModules.push(moduleName);

      if (defaultImport) {
        imports.push(`const ${defaultImport} = await loadModule('${moduleName}');`);
      }
      
      if (namedImports) {
        const importsList = namedImports.split(',').map(s => s.trim());
        imports.push(`const { ${importsList.join(', ')} } = await loadModule('${moduleName}');`);
      }
      resolvedCode = resolvedCode.replace(match[0], `// Import resolved: ${moduleName}`);
    } catch (error) {
      throw new Error(`Failed to load module ${moduleName}: ${error}`);
    }
  }

  if (imports.length > 0) {
    resolvedCode = imports.join('\n') + '\n\n' + resolvedCode;
  }

  return { code: resolvedCode, imports: loadedModules };
};

const createSafeContext = () => ({
  console: {
    log: (...args: any[]) => {
      return args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
    },
    error: console.error,
    warn: console.warn,
    info: console.info,
  },
  Math: Math,
  Date: Date,
  String: String,
  Number: Number,
  Array: Array,
  Object: Object,
  JSON: JSON,
  Promise: Promise,
  Set: Set,
  Map: Map,
  Error: Error,
  TypeError: TypeError,
  RangeError: RangeError,
});

interface AdvancedCodeBlockProps {
  block: Block;
}

export const AdvancedCodeBlock = ({ block }: AdvancedCodeBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript');
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [loadedModules, setLoadedModules] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
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
    if (content.includes('import ') || content.includes('type ') || content.includes('interface ') || content.includes(': ')) {
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
    if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
      setContent(block.content);
      setIsEditing(false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCode();
    }
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutionTime(0);
    setLoadedModules([]);

    const startTime = performance.now();

    try {
      let codeToExecute = content;
      let importedModules: string[] = [];
      try {
        const resolved = await resolveImports(codeToExecute);
        codeToExecute = resolved.code;
        importedModules = resolved.imports;
        setLoadedModules(importedModules);
      } catch (importError) {
        setOutput(`📦 Import Error: ${importError}`);
        setIsRunning(false);
        return;
      }

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
          setOutput(`🔧 TypeScript Compilation Error: ${tsError}`);
          setIsRunning(false);
          return;
        }
      }

      const logs: string[] = [];
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
      };

      ['log', 'error', 'warn', 'info'].forEach(method => {
        // @ts-ignore
        console[method] = (...args: any[]) => {
          const output = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          logs.push(`[${method.toUpperCase()}] ${output}`);
        };
      });

      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const func = new AsyncFunction(
          'loadModule',
          ...Object.keys(createSafeContext()),
          `
            try {
              ${codeToExecute}
            } catch (error) {
              console.error('Uncaught error:', error);
            }
          `
        );

        await func(loadModule, ...Object.values(createSafeContext()));
        Object.assign(console, originalConsole);
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);

        if (logs.length === 0) {
          setOutput('Code executed successfully (no output)');
        } else {
          setOutput(logs.join('\n'));
        }
      } catch (error) {
        Object.assign(console, originalConsole);
        setOutput(`Runtime Error: ${error}`);
      }
    } catch (error) {
      setOutput(`💥 Execution Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput('Execution stopped by user');
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
    setExecutionTime(0);
    setLoadedModules([]);
  };

  const insertTemplate = (template: string) => {
    setContent(template);
    setIsEditing(true);
  };

  const codeTemplates = [
    {
      name: 'Array Operations',
      language: 'javascript' as const,
      code: `// Array operations with lodash
import _ from 'lodash';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = _.filter(numbers, n => n % 2 === 0);
const squared = _.map(numbers, n => n * n);
const sum = _.sum(numbers);

console.log('Original:', numbers);
console.log('Even numbers:', evenNumbers);
console.log('Squared:', squared);
console.log('Sum:', sum);`
    },
    {
      name: 'API Request',
      language: 'javascript' as const,
      code: `// HTTP requests with axios
import axios from 'axios';

// Mock API response
const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]
};

console.log('📡 Making API request...');
// In a real scenario, you would use:
// const response = await axios.get('https://api.example.com/users');
// console.log('Response:', response.data);

console.log('Mock response:', mockData);`
    },
    {
      name: 'Date Manipulation',
      language: 'javascript' as const,
      code: `// Date manipulation with moment
import moment from 'moment';

const now = moment();
const nextWeek = moment().add(7, 'days');
const formatted = now.format('YYYY-MM-DD HH:mm:ss');

console.log('Now:', now.toString());
console.log('Next week:', nextWeek.toString());
console.log('Formatted:', formatted);
console.log('Difference in days:', nextWeek.diff(now, 'days'));`
    },
    {
      name: 'TypeScript Example',
      language: 'typescript' as const,
      code: `// TypeScript example with types
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

function createUser(name: string, email: string): User {
  return {
    id: Math.random(),
    name,
    email
  };
}

const users: User[] = [
  createUser('Alice', 'alice@example.com'),
  createUser('Bob', 'bob@example.com')
];

console.log('Users:', users);
console.log('First user name:', users[0].name);`
    }
  ];

  const supportedModules = [
    { name: 'lodash', description: 'Utility library' },
    { name: 'axios', description: 'HTTP client' },
    { name: 'moment', description: 'Date manipulation' },
    { name: 'uuid', description: 'UUID generation' },
    { name: 'ramda', description: 'Functional programming' },
    { name: 'dayjs', description: 'Lightweight date library' },
    { name: 'chance', description: 'Random generator' },
  ];

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
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ExternalLink className="w-3 h-3" />
            <span>CDN imports supported</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded transition-colors ${
              showSettings ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
            title="Templates & Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                title="Run code (Ctrl+Enter)"
              >
                <Play className="w-4 h-4 text-green-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates & Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code Templates */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Code Templates</h4>
              <div className="space-y-2">
                {codeTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => insertTemplate(template.code)}
                    className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:border-black transition-colors"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-gray-500">{template.language}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Supported Modules */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Modules</h4>
              <div className="space-y-1">
                {supportedModules.map((module) => (
                  <div key={module.name} className="flex items-center justify-between text-xs">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {module.name}
                    </span>
                    <span className="text-gray-500">{module.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Code Editor */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          style={{ minHeight: '200px' }}
          placeholder={`// Write your ${language} code here...\n// Use console.log() to see output\n// Press Ctrl+Enter to run\n// Supported imports: ${supportedModules.map(m => m.name).join(', ')}`}
        />
      ) : (
        <pre
          onClick={() => setIsEditing(true)}
          className="cursor-text font-mono text-sm bg-gray-100 border border-gray-300 rounded-lg p-4 whitespace-pre-wrap hover:bg-gray-200 transition-colors min-h-[200px] relative"
        >
          <code className={`language-${language}`}>
            {content || <span className="text-gray-400">// Click to write code...\n// Use templates from settings for quick start</span>}
          </code>
        </pre>
      )}

      {/* Loaded Modules Indicator */}
      {loadedModules.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span>📦 Loaded modules:</span>
          <div className="flex gap-1">
            {loadedModules.map(module => (
              <span key={module} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {module}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Output Panel */}
      {output && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Output</span>
              {executionTime > 0 && (
                <span className="text-xs text-gray-500">
                  ⏱️ {executionTime.toFixed(2)}ms
                </span>
              )}
            </div>
            <button
              onClick={clearOutput}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
          <pre className="font-mono text-sm bg-white p-4 max-h-80 overflow-y-auto whitespace-pre-wrap">
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

      {/* Quick Tips */}
      {!isEditing && (
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+Enter</kbd> to run code, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> for indentation
        </div>
      )}
    </motion.div>
  );
};