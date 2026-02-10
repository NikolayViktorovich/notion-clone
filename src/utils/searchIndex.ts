import { Block, Page, Workspace, SearchResult, SearchMatch } from '../types';

interface IndexEntry {
  pageId: string;
  pageTitle: string;
  blockId: string;
  blockType: string;
  content: string;
  positions: number[];
}

class SearchIndex {
  private index: Map<string, IndexEntry[]> = new Map();

  buildIndex(workspaces: Workspace[]): void {
    this.index.clear();
    
    workspaces.forEach(workspace => {
      workspace.pages.forEach(page => {
        this.indexPage(page);
      });
    });
  }

  private indexPage(page: Page): void {
    page.blocks.forEach(block => {
      this.indexBlock(page, block);
    });
  }

  private indexBlock(page: Page, block: Block): void {
    const words = block.content.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      if (word.length < 2) return;
      
      const entry: IndexEntry = {
        pageId: page.id,
        pageTitle: page.title,
        blockId: block.id,
        blockType: block.type,
        content: block.content,
        positions: [index],
      };

      const existing = this.index.get(word);
      if (existing) {
        const sameBlock = existing.find(e => e.blockId === block.id);
        if (sameBlock) {
          sameBlock.positions.push(index);
        } else {
          existing.push(entry);
        }
      } else {
        this.index.set(word, [entry]);
      }
    });

    block.children.forEach(child => this.indexBlock(page, child));
  }

  search(query: string, limit: number = 100): SearchResult[] {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    const entries = this.index.get(searchTerm) || [];
    
    entries.slice(0, limit).forEach(entry => {
      const key = `${entry.pageId}-${entry.blockId}`;
      if (seen.has(key)) return;
      seen.add(key);

      const content = entry.content.toLowerCase();
      const matches: SearchMatch[] = [];
      let startIndex = 0;

      while ((startIndex = content.indexOf(searchTerm, startIndex)) !== -1) {
        matches.push({
          text: entry.content.substring(startIndex, startIndex + searchTerm.length),
          start: startIndex,
          end: startIndex + searchTerm.length,
        });
        startIndex += searchTerm.length;
      }

      results.push({
        pageId: entry.pageId,
        pageTitle: entry.pageTitle,
        blockId: entry.blockId,
        blockType: entry.blockType,
        content: entry.content,
        matches,
      });
    });

    return results;
  }

  clear(): void {
    this.index.clear();
  }
}

export const searchIndex = new SearchIndex();
