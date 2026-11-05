import { WordEntry } from '../../domain/entities/WordEntry';
import {
  CachedWordRecord,
  ICacheRepository,
} from '../../domain/repositories/ICacheRepository';
import { LocalDatabase } from '../../infra/storage/LocalDatabase';

const CACHE_INDEX_KEY = '@dictionary:cache_index';
const CACHE_ITEM_PREFIX = '@dictionary:word_cache:';

export class CacheRepositoryImpl implements ICacheRepository {
  constructor(private readonly db: LocalDatabase) {}

  private buildKey(word: string): string {
    return `${CACHE_ITEM_PREFIX}${word.trim().toLowerCase()}`;
  }

  async getCachedWord(word: string): Promise<CachedWordRecord | null> {
    const normalized = word.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    return this.db.getObject<CachedWordRecord | null>(
      this.buildKey(normalized),
      null,
    );
  }

  async setCachedWord(word: string, entry: WordEntry): Promise<void> {
    const normalized = word.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    const record: CachedWordRecord = {
      entry,
      cachedAt: Date.now(),
    };

    await this.db.setObject(this.buildKey(normalized), record);

    const index = await this.db.getObject<string[]>(CACHE_INDEX_KEY, []);
    if (!index.includes(normalized)) {
      index.push(normalized);
      await this.db.setObject(CACHE_INDEX_KEY, index);
    }
  }

  async hasCachedWord(word: string): Promise<boolean> {
    const record = await this.getCachedWord(word);
    return record !== null;
  }

  async getAllCachedWords(): Promise<string[]> {
    return this.db.getObject<string[]>(CACHE_INDEX_KEY, []);
  }

  async clearCache(): Promise<void> {
    const index = await this.db.getObject<string[]>(CACHE_INDEX_KEY, []);
    for (const word of index) {
      await this.db.remove(this.buildKey(word));
    }
    await this.db.remove(CACHE_INDEX_KEY);
  }
}
