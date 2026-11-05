import { UserWordRecord } from '../entities/UserWordRecord';

export interface IUserWordRepository {
  getFavorites(userId: string): Promise<UserWordRecord[]>;
  isFavorite(userId: string, word: string): Promise<boolean>;
  addFavorite(userId: string, word: string): Promise<UserWordRecord[]>;
  removeFavorite(userId: string, word: string): Promise<UserWordRecord[]>;

  getHistory(userId: string): Promise<UserWordRecord[]>;
  addHistory(userId: string, word: string): Promise<UserWordRecord[]>;
  clearHistory(userId: string): Promise<void>;
}

