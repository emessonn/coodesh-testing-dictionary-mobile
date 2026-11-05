import { UserWordRecord } from '../../domain/entities/UserWordRecord';
import { IUserWordRepository } from '../../domain/repositories/IUserWordRepository';
import { LocalDatabase } from '../../infra/storage/LocalDatabase';

const FAVORITES_PREFIX = '@dictionary:favorites:';
const HISTORY_PREFIX = '@dictionary:history:';

export class UserWordRepositoryImpl implements IUserWordRepository {
  constructor(private readonly db: LocalDatabase) {}

  private favKey(userId: string): string {
    return `${FAVORITES_PREFIX}${userId}`;
  }

  private histKey(userId: string): string {
    return `${HISTORY_PREFIX}${userId}`;
  }

  async getFavorites(userId: string): Promise<UserWordRecord[]> {
    if (!userId) {
      return [];
    }
    return this.db.getObject<UserWordRecord[]>(this.favKey(userId), []);
  }

  async isFavorite(userId: string, word: string): Promise<boolean> {
    const target = word.trim().toLowerCase();
    const list = await this.getFavorites(userId);
    return list.some(item => item.word === target);
  }

  async addFavorite(
    userId: string,
    word: string,
  ): Promise<UserWordRecord[]> {
    const target = word.trim().toLowerCase();
    const list = await this.getFavorites(userId);
    if (list.some(item => item.word === target)) {
      return list;
    }

    const next: UserWordRecord[] = [
      { userId, word: target, createdAt: Date.now() },
      ...list,
    ];

    await this.db.setObject(this.favKey(userId), next);
    return next;
  }

  async removeFavorite(
    userId: string,
    word: string,
  ): Promise<UserWordRecord[]> {
    const target = word.trim().toLowerCase();
    const list = await this.getFavorites(userId);
    const next = list.filter(item => item.word !== target);
    await this.db.setObject(this.favKey(userId), next);
    return next;
  }

  async getHistory(userId: string): Promise<UserWordRecord[]> {
    if (!userId) {
      return [];
    }
    return this.db.getObject<UserWordRecord[]>(this.histKey(userId), []);
  }

  async addHistory(
    userId: string,
    word: string,
  ): Promise<UserWordRecord[]> {
    const target = word.trim().toLowerCase();
    const list = await this.getHistory(userId);
    const withoutCurrent = list.filter(item => item.word !== target);

    const next: UserWordRecord[] = [
      { userId, word: target, createdAt: Date.now() },
      ...withoutCurrent,
    ];

    await this.db.setObject(this.histKey(userId), next);
    return next;
  }

  async clearHistory(userId: string): Promise<void> {
    if (!userId) {
      return;
    }
    await this.db.remove(this.histKey(userId));
  }
}
