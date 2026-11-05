import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class LocalDatabase {
  private cache = new Map<string, string>();
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter = AsyncStorage) {
    this.storage = storage;
  }

  async getObject<T>(key: string, fallback: T): Promise<T> {
    try {
      const inMemory = this.cache.get(key);
      if (inMemory !== undefined) {
        return JSON.parse(inMemory) as T;
      }

      const raw = await this.storage.getItem(key);
      if (!raw) {
        return fallback;
      }

      this.cache.set(key, raw);
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    this.cache.set(key, serialized);
    try {
      await this.storage.setItem(key, serialized);
    } catch {
      // ignora falha de escrita em disco mantendo o dado em memória na sessão
    }
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await this.storage.removeItem(key);
    } catch {
      // noop
    }
  }

  clearMemory(): void {
    this.cache.clear();
  }
}
