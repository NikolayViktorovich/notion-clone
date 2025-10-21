import { useEffect, useState } from 'react';

interface LoadingProps {
  onLoadComplete: () => void;
}

export const Loading = ({ onLoadComplete }: LoadingProps) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const timer = setInterval(() => {
      if (!mounted) return;
      
      setProgress(prev => {
        const newProgress = prev + 2;
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (mounted) {
              setIsExiting(true);
              setTimeout(() => {
                if (mounted) onLoadComplete();
              }, 600);
            }
          }, 800);
          return 100;
        }
        return newProgress;
      });
    }, 80);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [onLoadComplete]);

  return (
    <div className={`
      fixed inset-0 bg-black z-50 flex items-center justify-center
      transition-all duration-500 ease-in-out
      ${isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
    `}>
      <div className={`
        text-center transition-all duration-500 ease-in-out
        ${isExiting ? 'opacity-0 -translate-y-10 scale-90' : 'opacity-100 translate-y-0 scale-100'}
      `}>
        {/* Анимированный файл с страницами */}
        <div className="relative mb-8">
          {/* Основной файл */}
          <div className={`
            relative w-24 h-32 mx-auto transition-all duration-1000
            ${progress > 10 ? 'scale-110' : 'scale-100'}
            ${progress > 50 ? 'rotate-3' : ''}
            ${progress > 80 ? 'scale-105 rotate-0' : ''}
            ${progress === 100 ? 'scale-125' : ''}
            ${isExiting ? 'scale-150 rotate-12 opacity-0' : ''}
          `}>
            {/* Тень файла */}
            <div className={`
              absolute inset-0 bg-gray-800 rounded-lg rounded-tl-none 
              transform transition-all duration-700
              ${progress > 30 ? 'translate-y-1 translate-x-1' : 'translate-y-0 translate-x-0'}
              ${isExiting ? 'opacity-0' : ''}
            `} />
            
            {/* Основной файл */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg rounded-tl-none 
              transform transition-all duration-500
              shadow-lg
              ${progress > 70 ? 'brightness-110' : ''}
              ${isExiting ? 'opacity-0' : ''}
            `}>
              {/* Уголок файла */}
              <div className="absolute top-0 left-0 w-8 h-8 bg-blue-700 rounded-br-lg" />
              
              {/* Линии текста */}
              <div className={`
                absolute top-10 left-4 right-4 h-1.5 bg-white bg-opacity-40 rounded transition-all duration-300
                ${progress > 20 ? 'opacity-100' : 'opacity-0'}
              `} />
              <div className={`
                absolute top-14 left-4 right-5 h-1.5 bg-white bg-opacity-40 rounded transition-all duration-500
                ${progress > 40 ? 'opacity-100' : 'opacity-0'}
              `} />
              <div className={`
                absolute top-18 left-4 right-6 h-1.5 bg-white bg-opacity-40 rounded transition-all duration-700
                ${progress > 60 ? 'opacity-100' : 'opacity-0'}
              `} />
              
              {/* Блеск */}
              <div className={`
                absolute top-3 left-3 w-4 h-4 bg-white bg-opacity-30 rounded-full
                transition-all duration-1000
                ${progress > 25 ? 'opacity-100' : 'opacity-0'}
                ${progress > 75 ? 'animate-ping' : ''}
              `} />
            </div>
            
            {/* Вылетающие страницы */}
            <div className={`
              absolute -right-4 top-2 w-6 h-8 bg-yellow-400 rounded-lg transform transition-all duration-1000
              border-2 border-yellow-500
              ${progress > 15 ? 'translate-x-0 rotate-6 opacity-100' : 'translate-x-4 rotate-0 opacity-0'}
              ${progress > 45 ? 'translate-x-1 rotate-3' : ''}
              ${isExiting ? 'translate-x-8 rotate-12 opacity-0' : ''}
            `}>
              <div className="absolute top-1 left-1 right-1 h-0.5 bg-yellow-200 rounded" />
              <div className="absolute top-3 left-1 right-2 h-0.5 bg-yellow-200 rounded" />
            </div>
            
            <div className={`
              absolute -left-2 -bottom-2 w-5 h-7 bg-green-400 rounded-lg transform transition-all duration-1200
              border-2 border-green-500
              ${progress > 25 ? 'translate-x-0 -rotate-4 opacity-100' : 'translate-x-4 rotate-0 opacity-0'}
              ${progress > 55 ? 'translate-x-0 -rotate-2' : ''}
              ${isExiting ? '-translate-x-8 -rotate-12 opacity-0' : ''}
            `}>
              <div className="absolute top-1 left-1 right-1 h-0.5 bg-green-200 rounded" />
            </div>
            
            {/* Парящие элементы */}
            <div className={`
              absolute -top-4 right-6 text-2xl transition-all duration-1500
              ${progress > 35 ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}
              ${progress > 65 ? 'animate-bounce' : ''}
              ${isExiting ? 'opacity-0 -translate-y-8' : ''}
            `}>
              ✏️
            </div>
            
            <div className={`
              absolute -bottom-3 left-8 text-xl transition-all duration-2000
              ${progress > 45 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              ${progress > 75 ? 'animate-pulse' : ''}
              ${isExiting ? 'opacity-0 translate-y-8' : ''}
            `}>
              📌
            </div>
          </div>
        </div>
        
        {/* Заголовок */}
        <h1 className={`
          text-4xl font-bold text-white mb-8 transition-all duration-1000
          ${progress > 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          ${isExiting ? 'opacity-0 -translate-y-6' : ''}
        `}>
          Notion Clone
        </h1>
        
        {/* Прогресс бар */}
        <div className={`
          w-80 h-3 bg-gray-700 rounded-full mb-4 mx-auto overflow-hidden transition-all duration-500
          ${isExiting ? 'opacity-0 scale-90' : ''}
        `}>
          <div 
            className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-md"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Проценты */}
        <p className={`
          text-gray-300 text-lg font-semibold transition-all duration-300
          ${progress > 10 ? 'opacity-100' : 'opacity-0'}
          ${isExiting ? 'opacity-0' : ''}
        `}>
          {progress}%
        </p>
        
        {/* Статус загрузки */}
        <p className={`
          text-gray-400 text-sm mt-2 transition-all duration-500
          ${progress > 85 ? 'opacity-100' : 'opacity-0'}
          ${isExiting ? 'opacity-0' : ''}
        `}>
          Готово! Запускаем редактор...
        </p>
      </div>
    </div>
  );
};