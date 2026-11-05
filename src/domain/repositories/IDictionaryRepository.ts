import { WordEntry } from '../entities/WordEntry';

export interface PaginatedWordsResult {
  words: string[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IDictionaryRepository {
  getWordsPage(
    page: number,
    pageSize: number,
    searchQuery?: string,
  ): Promise<PaginatedWordsResult>;

  fetchWordFromApi(word: string, signal?: AbortSignal): Promise<WordEntry>;

  syncRemoteWordList(signal?: AbortSignal): Promise<number>;

  getTotalWordsCount(): Promise<number>;
}
