import { DB_CONFIG, TIMEOUTS, STORAGE_KEYS } from '../constants';

interface OfflineEntity {
  id: string;
  isSynced: boolean;
  lastSynced?: Date;
  version: number;
}

interface SyncQueueItem {
  id?: number;
  type: string;
  action: string;
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

class OfflineStorage {
  private dbName = DB_CONFIG.NAME;
  private version = DB_CONFIG.VERSION;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initPromise = this.init();
    this.setupEventListeners();
  }

  private async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB init error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.WORKSPACES)) {
          const workspaceStore = db.createObjectStore(DB_CONFIG.STORES.WORKSPACES, { keyPath: 'id' });
          workspaceStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.PAGES)) {
          const pageStore = db.createObjectStore(DB_CONFIG.STORES.PAGES, { keyPath: 'id' });
          pageStore.createIndex('workspaceId', 'workspaceId');
          pageStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.BLOCKS)) {
          const blockStore = db.createObjectStore(DB_CONFIG.STORES.BLOCKS, { keyPath: 'id' });
          blockStore.createIndex('pageId', 'pageId');
          blockStore.createIndex('isSynced', 'isSynced');
        }
        
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SYNC_QUEUE)) {
          const queueStore = db.createObjectStore(DB_CONFIG.STORES.SYNC_QUEUE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          queueStore.createIndex('type', 'type');
          queueStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.sync().catch(error => {
        console.error('Sync failed on reconnection:', error);
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.waitForDB();
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  private async waitForDB(): Promise<void> {
    if (this.db) return;
    
    if (this.initPromise) {
      try {
        await this.initPromise;
        return;
      } catch (error) {
        console.error('DB init failed, retrying:', error);
        this.initPromise = this.init();
        await this.initPromise;
        return;
      }
    }

    return new Promise((resolve) => {
      const checkDB = () => {
        if (this.db) {
          resolve();
        } else {
          setTimeout(checkDB, TIMEOUTS.SYNC_RETRY_DELAY);
        }
      };
      checkDB();
    });
  }

  async saveWorkspaces(workspaces: any[]): Promise<void> {
    try {
      const store = await this.getStore(DB_CONFIG.STORES.WORKSPACES, 'readwrite');
      
      for (const workspace of workspaces) {
        const offlineWorkspace: OfflineEntity & typeof workspace = {
          ...workspace,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date().toISOString() : undefined,
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

  async savePages(pages: any[]): Promise<void> {
    try {
      const store = await this.getStore(DB_CONFIG.STORES.PAGES, 'readwrite');
      
      for (const page of pages) {
        const offlinePage: OfflineEntity & typeof page = {
          ...page,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date().toISOString() : undefined,
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

  async saveBlocks(blocks: any[]): Promise<void> {
    try {
      const store = await this.getStore(DB_CONFIG.STORES.BLOCKS, 'readwrite');
      
      for (const block of blocks) {
        const offlineBlock: OfflineEntity & typeof block = {
          ...block,
          isSynced: this.isOnline,
          lastSynced: this.isOnline ? new Date().toISOString() : undefined,
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

  private async addToSyncQueue(type: string, action: string, data: any[]): Promise<void> {
    try {
      const store = await this.getStore(DB_CONFIG.STORES.SYNC_QUEUE, 'readwrite');
      
      for (const item of data) {
        const queueItem: SyncQueueItem = {
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
      const store = await this.getStore(DB_CONFIG.STORES.WORKSPACES);
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
      const store = await this.getStore(DB_CONFIG.STORES.PAGES);
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
      const store = await this.getStore(DB_CONFIG.STORES.BLOCKS);
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

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.NOTION_PREFIX}${key}`, JSON.stringify(data));
      localStorage.setItem(`${STORAGE_KEYS.NOTION_PREFIX}${key}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.NOTION_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  async sync(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const queueStore = await this.getStore(DB_CONFIG.STORES.SYNC_QUEUE);
      const items = await new Promise<SyncQueueItem[]>((resolve) => {
        const request = queueStore.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      if (items.length === 0) return;

      for (const item of items) {
        await this.syncItem(item);
      }

      const clearStore = await this.getStore(DB_CONFIG.STORES.SYNC_QUEUE, 'readwrite');
      clearStore.clear();

    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      console.log(`Syncing ${item.type} ${item.action}:`, item.entityId);
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SYNC_RETRY_DELAY));
    } catch (error) {
      console.error('Sync item error:', error);
      throw error;
    }
  }

  getStatus(): { isOnline: boolean; hasData: boolean } {
    return {
      isOnline: this.isOnline,
      hasData: this.db !== null
    };
  }

  async forceSync(): Promise<void> {
    await this.sync();
  }
}

export const offlineStorage = new OfflineStorage();
