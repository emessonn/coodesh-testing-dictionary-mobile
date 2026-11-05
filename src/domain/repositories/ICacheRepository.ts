import { WordEntry } from '../entities/WordEntry';

export interface CachedWordRecord {
  entry: WordEntry;
  cachedAt: number;
}

export interface ICacheRepository {
  getCachedWord(word: string): Promise<CachedWordRecord | null>;
  setCachedWord(word: string, entry: WordEntry): Promise<void>;
  hasCachedWord(word: string): Promise<boolean>;
  getAllCachedWords(): Promise<string[]>;
  clearCache(): Promise<void>;
}

