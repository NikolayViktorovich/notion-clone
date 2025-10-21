// hooks/useWebClipper.ts
import { create } from 'zustand';
import { WebClip, WebClipRequest } from '../types/webClipper';
import { useStore } from '../store/useStore';

interface WebClipperState {
  clips: WebClip[];
  isClipperOpen: boolean;
  currentClip: WebClipRequest | null;
  isLoading: boolean;

  openClipper: (clipData: WebClipRequest) => void;
  closeClipper: () => void;
  saveClip: (title: string, tags?: string[]) => Promise<string>;
  deleteClip: (clipId: string) => void;
  loadClips: () => WebClip[];
  importFromUrl: (url: string) => Promise<WebClipRequest>;
}

export const useWebClipper = create<WebClipperState>((set, get) => ({
  clips: [],
  isClipperOpen: false,
  currentClip: null,
  isLoading: false,

  openClipper: (clipData: WebClipRequest) => {
    set({ 
      isClipperOpen: true, 
      currentClip: clipData 
    });
  },

  closeClipper: () => {
    set({ 
      isClipperOpen: false, 
      currentClip: null,
      isLoading: false 
    });
  },

  saveClip: async (title: string, tags: string[] = []): Promise<string> => {
    const { currentClip } = get();
    const { createPage } = useStore.getState();
    
    if (!currentClip) {
      throw new Error('No clip data to save');
    }

    try {
      set({ isLoading: true });
      const blocks = [];
      if (currentClip.url) {
        blocks.push({
          type: 'text',
          content: `**Источник:** [${currentClip.url}](${currentClip.url})`
        });
      }

      const contentBlocks = splitContentIntoBlocks(currentClip.content);
      blocks.push(...contentBlocks);

      const pageId = createPage('default', {
        title: title || currentClip.title || 'Веб-клип',
        blocks: blocks
      });

      const newClip: WebClip = {
        id: pageId,
        title: title || currentClip.title || 'Веб-клип',
        url: currentClip.url,
        content: currentClip.content,
        excerpt: currentClip.excerpt,
        image: currentClip.image,
        tags,
        createdAt: new Date()
      };

      const savedClips = JSON.parse(localStorage.getItem('webClips') || '[]');
      savedClips.push(newClip);
      localStorage.setItem('webClips', JSON.stringify(savedClips));

      set({ 
        clips: savedClips,
        isLoading: false 
      });

      return pageId;

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteClip: (clipId: string) => {
    const savedClips = JSON.parse(localStorage.getItem('webClips') || '[]');
    const updatedClips = savedClips.filter((clip: WebClip) => clip.id !== clipId);
    localStorage.setItem('webClips', JSON.stringify(updatedClips));
    set({ clips: updatedClips });
  },

  loadClips: (): WebClip[] => {
    const savedClips = JSON.parse(localStorage.getItem('webClips') || '[]');
    set({ clips: savedClips });
    return savedClips;
  },

  importFromUrl: async (url: string): Promise<WebClipRequest> => {
    try {
      set({ isLoading: true });
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }

      const data = await response.json();
      const htmlContent = data.contents;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   'Без названия';
      const mainContent = doc.querySelector('article') || 
                         doc.querySelector('main') || 
                         doc.querySelector('.content') || 
                         doc.body;
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 
        '.ad', '.ads', '.advertisement', '.sidebar',
        '.menu', '.navigation'
      ];

      unwantedSelectors.forEach(selector => {
        mainContent.querySelectorAll(selector).forEach(el => el.remove());
      });
      let content = mainContent.textContent || '';
      content = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000);
      const excerpt = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                     content.substring(0, 200) + '...';
      const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                   doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                   doc.querySelector('img')?.getAttribute('src');
      const clipData: WebClipRequest = {
        url,
        title,
        content,
        excerpt,
        image: image ? new URL(image, url).href : undefined
      };

      set({ isLoading: false });
      return clipData;

    } catch (error) {
      set({ isLoading: false });
      
      const fallbackClip: WebClipRequest = {
        url,
        title: 'Страница',
        content: `Ссылка: ${url}\n\nНе удалось автоматически извлечь содержимое. Вы можете добавить описание вручную.`,
        excerpt: `Ссылка: ${url}`
      };

      return fallbackClip;
    }
  }
}));

function splitContentIntoBlocks(content: string): any[] {
  const blocks = [];
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      blocks.push({
        type: 'text',
        content: paragraph.trim()
      });
    }
  }
  
  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content: 'Содержимое веб-страницы'
    });
  }
  
  return blocks;
}