class OfflineStorage {
  private dbName = 'NotionOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.init();
    this.setupEventListeners();
  }

  private async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('workspaces')) {
          const workspaceStore = db.createObjectStore('workspaces', { keyPath: 'id' });
          workspaceStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains('pages')) {
          const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
          pageStore.createIndex('workspaceId', 'workspaceId');
          pageStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains('blocks')) {
          const blockStore = db.createObjectStore('blocks', { keyPath: 'id' });
          blockStore.createIndex('pageId', 'pageId');
          blockStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          queueStore.createIndex('type', 'type');
          queueStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    await this.waitForDB();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  private waitForDB(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        resolve();
      } else {
        setTimeout(() => this.waitForDB().then(resolve), 100);
      }
    });
  }

  async saveWorkspaces(workspaces: any[]) {
    try {
      const store = await this.getStore('workspaces', 'readwrite');
      
      for (const workspace of workspaces) {
        const offlineWorkspace = {
          ...workspace,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date() : undefined,
          version: 1
        };
        
        store.put(offlineWorkspace);
      }

      if (!this.isOnline) {
        await this.addToSyncQueue('workspace', 'update', workspaces);
      }
    } catch (error) {
      console.error('Error saving workspaces:', error);
      this.saveToLocalStorage('workspaces', workspaces);
    }
  }

  async savePages(pages: any[]) {
    try {
      const store = await this.getStore('pages', 'readwrite');
      
      for (const page of pages) {
        const offlinePage = {
          ...page,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date() : undefined,
          version: 1
        };
        
        store.put(offlinePage);
      }

      if (!this.isOnline) {
        await this.addToSyncQueue('page', 'update', pages);
      }
    } catch (error) {
      console.error('Error saving pages:', error);
      this.saveToLocalStorage('pages', pages);
    }
  }

  async saveBlocks(blocks: any[]) {
    try {
      const store = await this.getStore('blocks', 'readwrite');
      
      for (const block of blocks) {
        const offlineBlock = {
          ...block,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date() : undefined,
          version: 1
        };
        
        store.put(offlineBlock);
      }

      if (!this.isOnline) {
        await this.addToSyncQueue('block', 'update', blocks);
      }
    } catch (error) {
      console.error('Error saving blocks:', error);
      this.saveToLocalStorage('blocks', blocks);
    }
  }

  private async addToSyncQueue(type: string, action: string, data: any[]) {
    try {
      const store = await this.getStore('syncQueue', 'readwrite');
      
      for (const item of data) {
        const queueItem = {
          type,
          action,
          entityId: item.id,
          data: item,
          timestamp: new Date(),
          retryCount: 0
        };
        
        store.add(queueItem);
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  async loadWorkspaces(): Promise<any[]> {
    try {
      const store = await this.getStore('workspaces');
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve(this.loadFromLocalStorage('workspaces') || []);
      });
    } catch (error) {
      return this.loadFromLocalStorage('workspaces') || [];
    }
  }

  async loadPages(): Promise<any[]> {
    try {
      const store = await this.getStore('pages');
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve(this.loadFromLocalStorage('pages') || []);
      });
    } catch (error) {
      return this.loadFromLocalStorage('pages') || [];
    }
  }

  async loadBlocks(pageId?: string): Promise<any[]> {
    try {
      const store = await this.getStore('blocks');
      return new Promise((resolve) => {
        const request = pageId 
          ? store.index('pageId').getAll(pageId)
          : store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve(this.loadFromLocalStorage('blocks') || []);
      });
    } catch (error) {
      return this.loadFromLocalStorage('blocks') || [];
    }
  }

  private saveToLocalStorage(key: string, data: any) {
    try {
      localStorage.setItem(`notion_${key}`, JSON.stringify(data));
      localStorage.setItem(`notion_${key}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(`notion_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  async sync() {
    if (!this.isOnline) return;

    try {
      const queueStore = await this.getStore('syncQueue');
      const items = await new Promise<any[]>((resolve) => {
        const request = queueStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      if (items.length === 0) return;

      console.log('Syncing', items.length, 'items...');

      for (const item of items) {
        await this.syncItem(item);
      }

      const clearStore = await this.getStore('syncQueue', 'readwrite');
      clearStore.clear();

    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async syncItem(item: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Synced item:', item);
        resolve(true);
      }, 100);
    });
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      hasData: this.db !== null
    };
  }

  async forceSync() {
    await this.sync();
  }
}

export const offlineStorage = new OfflineStorage();