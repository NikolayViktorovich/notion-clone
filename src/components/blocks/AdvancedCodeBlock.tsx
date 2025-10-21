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
import { BaseBlock } from './BaseBlock';

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
    'chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js',
    'rxjs': 'https://cdn.jsdelivr.net/npm/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js'
  };

  const globalNames: { [key: string]: string } = {
    'lodash': '_',
    'axios': 'axios',
    'moment': 'moment',
    'uuid': 'uuid',
    'ramda': 'R',
    'dayjs': 'dayjs',
    'chance': 'Chance',
    'chart.js': 'Chart',
    'rxjs': 'rxjs'
  };

  if (cdnUrls[moduleName]) {
    return new Promise((resolve, reject) => {
      if ((window as any).__moduleLoading__?.[moduleName]) {
        const checkModule = () => {
          if (moduleCache.has(moduleName)) {
            resolve(moduleCache.get(moduleName));
          } else {
            setTimeout(checkModule, 100);
          }
        };
        checkModule();
        return;
      }

      if (!(window as any).__moduleLoading__) {
        (window as any).__moduleLoading__ = {};
      }
      (window as any).__moduleLoading__[moduleName] = true;

      const script = document.createElement('script');
      script.src = cdnUrls[moduleName];
      script.onload = () => {
        setTimeout(() => {
          // @ts-ignore
          const module = window[globalNames[moduleName]];
          if (module) {
            moduleCache.set(moduleName, module);
            delete (window as any).__moduleLoading__[moduleName];
            resolve(module);
          } else {
            delete (window as any).__moduleLoading__[moduleName];
            reject(new Error(`Module ${moduleName} not found in global scope`));
          }
        }, 100);
      };
      script.onerror = () => {
        delete (window as any).__moduleLoading__[moduleName];
        reject(new Error(`Failed to load module: ${moduleName}`));
      };
      document.head.appendChild(script);
    });
  }

  throw new Error(`Module ${moduleName} is not supported`);
};

const preloadModules = async (modules: string[]): Promise<void> => {
  await Promise.all(modules.map(module => loadModule(module).catch(() => null)));
};

const resolveImports = (code: string): { code: string; imports: string[] } => {
  const importRegex = /import\s+(?:\*\s+as\s+)?(\w+)?\s*(?:\{\s*([^}]+)\s*\})?\s+from\s+['"]([^'"]+)['"]/g;
  let resolvedCode = code;
  const imports: string[] = [];
  const loadedModules: string[] = [];

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const [, defaultImport, namedImports, moduleName] = match;
    
    loadedModules.push(moduleName);

    if (defaultImport) {
      imports.push(`const ${defaultImport} = globalThis.__modules__['${moduleName}'];`);
    }
    
    if (namedImports) {
      const importsList = namedImports.split(',').map(s => s.trim());
      imports.push(`const { ${importsList.join(', ')} } = globalThis.__modules__['${moduleName}'];`);
    }

    resolvedCode = resolvedCode.replace(match[0], `// Import resolved: ${moduleName}`);
  }

  if (imports.length > 0) {
    resolvedCode = imports.join('\n') + '\n\n' + resolvedCode;
  }

  return { code: resolvedCode, imports: loadedModules };
};

interface AdvancedCodeBlockProps {
  block: Block;
}

export const AdvancedCodeBlock = ({ block }: AdvancedCodeBlockProps) => {
  const [content, setContent] = useState(block.content);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
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
        const resolved = resolveImports(codeToExecute);
        codeToExecute = resolved.code;
        importedModules = resolved.imports;
        setLoadedModules(importedModules);
      } catch (importError) {
        setOutput(`Ошибка импорта: ${importError}`);
        setIsRunning(false);
        return;
      }

      if (importedModules.length > 0) {
        try {
          await preloadModules(importedModules);
        } catch (error) {
          setOutput(`Ошибка загрузки модуля: ${error}`);
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
          logs.push(`${output}`);
        };
      });

      try {
        const globalModules: { [key: string]: any } = {};
        importedModules.forEach(moduleName => {
          globalModules[moduleName] = moduleCache.get(moduleName);
        });
        (window as any).__modules__ = globalModules;

        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const safeContext = {
          console: {
            log: (...args: any[]) => {
              const output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              logs.push(output);
            },
            error: (...args: any[]) => {
              const output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              logs.push(`${output}`);
            },
            warn: (...args: any[]) => {
              const output = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              logs.push(`${output}`);
            }
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
          __modules__: globalModules
        };

        const func = new AsyncFunction(
          ...Object.keys(safeContext),
          codeToExecute
        );
        
        await func(...Object.values(safeContext));
        Object.assign(console, originalConsole);
        delete (window as any).__modules__;
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);

        if (logs.length === 0) {
          setOutput('Код выполнен успешно (нет вывода)');
        } else {
          setOutput(logs.join('\n'));
        }
      } catch (error) {
        Object.assign(console, originalConsole);
        delete (window as any).__modules__;
        setOutput(`Ошибка выполнения: ${error}`);
      }
    } catch (error) {
      setOutput(`Ошибка выполнения: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput('Выполнение остановлено пользователем');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setOutput('Ошибка копирования');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.js`;
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
      name: 'Операции с массивами',
      code: `// Операции с массивами в чистом JavaScript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter(n => n % 2 === 0);
const squared = numbers.map(n => n * n);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log('Original:', numbers);
console.log('Even numbers:', evenNumbers);
console.log('Squared:', squared);
console.log('Sum:', sum);`
    },
    {
      name: 'Манипуляции с объектами',
      code: `// Манипуляции с объектами
const users = [
  { id: 1, name: 'John Doe', age: 25, active: true },
  { id: 2, name: 'Jane Smith', age: 30, active: false },
  { id: 3, name: 'Bob Johnson', age: 35, active: true }
];

const activeUsers = users.filter(user => user.active);
const userNames = users.map(user => user.name);
const averageAge = users.reduce((sum, user) => sum + user.age, 0) / users.length;

console.log('All users:', users);
console.log('Active users:', activeUsers);
console.log('User names:', userNames);
console.log('Average age:', averageAge);`
    },
    {
      name: 'Асинхронные операции',
      code: `// Асинхронные операции с Promises
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncDemo() {
  console.log('Starting async operation...');
  await delay(1000);
  console.log('1 second passed');
  await delay(500);
  console.log('1.5 seconds passed');
  
  const result = await Promise.resolve('Async result');
  console.log('Result:', result);
}

asyncDemo().then(() => {
  console.log('Async demo completed');
});`
    },
    {
      name: 'Простой калькулятор',
      code: `// Простой калькулятор функций
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b !== 0 ? a / b : 'Error: Division by zero'
};

console.log('5 + 3 =', calculator.add(5, 3));
console.log('10 - 4 =', calculator.subtract(10, 4));
console.log('6 * 7 =', calculator.multiply(6, 7));
console.log('15 / 3 =', calculator.divide(15, 3));
console.log('5 / 0 =', calculator.divide(5, 0));`
    },
    {
      name: 'С Lodash (CDN)',
      code: `// С Lodash (CDN)
import _ from 'lodash';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = _.shuffle(numbers);
const chunked = _.chunk(numbers, 3);
const unique = _.uniq([1, 2, 2, 3, 4, 4, 5]);

console.log('Original:', numbers);
console.log('Shuffled:', shuffled);
console.log('Chunked:', chunked);
console.log('Unique:', unique);`
    },
    {
      name: 'HTTP-запросы с Axios',
      code: `// HTTP-запросы с Axios
import axios from 'axios';

// Mock API response since we can't make real requests
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

console.log('Simulating API request...');
console.log('Mock response:', mockUsers);

// Real axios usage would be:
// const response = await axios.get('https://api.example.com/users');
// console.log('Real data:', response.data);`
    },
    {
      name: 'Манипулирование датой с помощью момента',
      code: `// Манипулирование датой с помощью момента
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
      name: 'Случайные данные со случайностью',
      code: `// Случайные данные со случайностью
import Chance from 'chance';

const chance = new Chance();

const randomName = chance.name();
const randomEmail = chance.email();
const randomAddress = chance.address();
const randomBirthday = chance.birthday();

console.log('Random Name:', randomName);
console.log('Random Email:', randomEmail);
console.log('Random Address:', randomAddress);
console.log('Random Birthday:', randomBirthday);`
    },
    {
      name: 'Функциональное программирование с Ramda',
      code: `// Функциональное программирование с Ramda
import R from 'ramda';

const numbers = [1, 2, 3, 4, 5, 6];
const double = R.multiply(2);
const isEven = n => n % 2 === 0;

const doubledNumbers = R.map(double, numbers);
const evenNumbers = R.filter(isEven, numbers);
const sum = R.reduce(R.add, 0, numbers);

console.log('Numbers:', numbers);
console.log('Doubled:', doubledNumbers);
console.log('Even:', evenNumbers);
console.log('Sum:', sum);`
    },
    {
      name: 'UUID генерация',
      code: `// UUID генерация
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const id1 = generateUUID();
const id2 = generateUUID();
const id3 = generateUUID();

console.log('UUID 1:', id1);
console.log('UUID 2:', id2);
console.log('UUID 3:', id3);
console.log('All unique?', id1 !== id2 && id2 !== id3 && id1 !== id3);`
    },
    {
      name: 'Легкие даты с Day.js',
      code: `// Легкая манипуляция датами с помощью dayjs
import dayjs from 'dayjs';

const now = dayjs();
const tomorrow = dayjs().add(1, 'day');
const lastWeek = dayjs().subtract(7, 'days');

console.log('Now:', now.format('YYYY-MM-DD HH:mm:ss'));
console.log('Tomorrow:', tomorrow.format('YYYY-MM-DD'));
console.log('Last week:', lastWeek.format('YYYY-MM-DD'));
console.log('Is today?', dayjs().isSame(now, 'day'));`
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
    { name: 'chart.js', description: 'Charting library' },
    { name: 'rxjs', description: 'Reactive programming' },
  ];

  return (
    <BaseBlock>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <CodeIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />
          <span className="text-xs font-mono bg-hover text-text px-2 py-1 rounded border border-border">
            JavaScript
          </span>
          
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <ExternalLink className="w-3 h-3" />
            <span>CDN imports supported</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded transition-colors ${
              showSettings ? 'bg-hover' : 'hover:bg-hover'
            }`}
            title="Templates & Settings"
          >
            <Settings className="w-4 h-4 text-text" />
          </button>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-hover rounded transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-text" />}
            </button>
            
            <button
              onClick={downloadCode}
              className="p-1 hover:bg-hover rounded transition-colors"
              title="Download code"
            >
              <Download className="w-4 h-4 text-text" />
            </button>
            
            {isRunning ? (
              <button
                onClick={stopExecution}
                className="p-1 hover:bg-hover rounded transition-colors"
                title="Stop execution"
              >
                <Square className="w-4 h-4 text-red-600" />
              </button>
            ) : (
              <button
                onClick={executeCode}
                className="p-1 hover:bg-hover rounded transition-colors"
                title="Run code (Ctrl+Enter)"
              >
                <Play className="w-4 h-4 text-green-600" />
              </button>
            )}
          </div>
        </div>
      </div>

    {showSettings && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mb-4 p-4 bg-hover border border-border rounded-lg max-w-full overflow-x-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          {/* Шаблоны кода */}
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-text mb-2">Шаблоны темплейтов</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {codeTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => insertTemplate(template.code)}
                  className="w-full text-left p-2 text-xs bg-background border border-border rounded hover:border-accent transition-colors min-w-0"
                >
                  <div className="font-medium text-text truncate">{template.name}</div>
                  <div className="text-text-secondary text-xs mt-1 truncate">
                    {template.code.split('\n')[0].replace('// ', '')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-medium text-text mb-2">Поддерживающиеся модули</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {supportedModules.map((module) => (
                <div key={module.name} className="flex items-center justify-between text-xs p-2 hover:bg-background rounded min-w-0">
                  <span className="font-mono bg-background text-text px-2 py-1 rounded truncate">
                    {module.name}
                  </span>
                  <span className="text-text-secondary text-right truncate ml-2">{module.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      )}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full resize-none font-mono text-sm bg-background border border-border rounded-lg p-4 outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text-secondary"
          style={{ minHeight: '200px' }}
          placeholder={`// Write your JavaScript code here...\n// Use console.log() to see output\n// Press Ctrl+Enter to run\n// For CDN imports use: import _ from 'lodash';`}
        />
      ) : (
        <pre
          onClick={() => setIsEditing(true)}
          className="cursor-text font-mono text-sm bg-background border border-border rounded-lg p-4 whitespace-pre-wrap hover:bg-hover transition-colors min-h-[200px] relative text-text"
        >
          <code className="language-javascript">
            {content || (
              <span className="text-text-secondary">
                Нажмите, чтобы написать код...\nИспользуйте шаблоны из настроек для быстрого старта
              </span>
            )}
          </code>
        </pre>
      )}
      {loadedModules.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
          <span>Загруженные модули:</span>
          <div className="flex gap-1">
            {loadedModules.map(module => (
              <span key={module} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {module}
              </span>
            ))}
          </div>
        </div>
      )}
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 border border-border rounded-lg overflow-hidden max-w-full"
          >
            <div className="flex items-center justify-between bg-hover px-4 py-2 border-b border-border">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-sm font-medium text-text truncate">Output</span>
                {executionTime > 0 && (
                  <span className="text-xs text-text-secondary flex-shrink-0">
                    {executionTime.toFixed(2)}ms
                  </span>
                )}
              </div>
              <button
                onClick={clearOutput}
                className="text-xs text-text-secondary hover:text-text flex items-center gap-1 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            <pre className="font-mono text-sm bg-background p-4 max-h-80 overflow-y-auto whitespace-pre-wrap text-text max-w-full">
              <code>{output}</code>
            </pre>
          </motion.div>
        )}

      {isRunning && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Выполнение JavaScript...
        </div>
      )}

      {!isEditing && (
        <div className="mt-2 text-xs text-text-secondary">
          Напоминание: Используйте <kbd className="px-1 py-0.5 bg-hover rounded text-xs">Ctrl+Enter</kbd> для выполнения кода, <kbd className="px-1 py-0.5 bg-hover rounded text-xs">Tab</kbd> для отступа
        </div>
      )}
    </BaseBlock>
  );
};