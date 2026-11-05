import { DEFAULT_DEFINITIONS } from '../../assets/defaultDefinitions';
import wordsDictionaryJson from '../../assets/words_dictionary.json';
import { WordEntry } from '../../domain/entities/WordEntry';
import {
  IDictionaryRepository,
  PaginatedWordsResult,
} from '../../domain/repositories/IDictionaryRepository';
import {
  ApiError,
  FreeDictionaryApiClient,
} from '../../infra/http/FreeDictionaryApiClient';
import { LocalDatabase } from '../../infra/storage/LocalDatabase';

const SYNCED_WORDS_KEY = '@dictionary:remote_words';

export class DictionaryRepositoryImpl implements IDictionaryRepository {
  private wordList: string[] | null = null;

  constructor(
    private readonly apiClient: FreeDictionaryApiClient,
    private readonly db: LocalDatabase,
  ) {}

  private async loadWords(): Promise<string[]> {
    if (this.wordList && this.wordList.length > 0) {
      return this.wordList;
    }

    const saved = await this.db.getObject<string[] | null>(
      SYNCED_WORDS_KEY,
      null,
    );
    if (saved && saved.length > 0) {
      this.wordList = saved;
      return this.wordList;
    }

    this.wordList = Object.keys(wordsDictionaryJson as Record<string, number>);
    return this.wordList;
  }

  async getWordsPage(
    page: number,
    pageSize: number,
    searchQuery?: string,
  ): Promise<PaginatedWordsResult> {
    const allWords = await this.loadWords();
    const query = searchQuery?.trim().toLowerCase() || '';

    const list = query
      ? allWords.filter(w => w.toLowerCase().includes(query))
      : allWords;

    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      words: list.slice(start, end),
      total,
      page,
      pageSize,
      hasMore: end < total,
    };
  }

  async fetchWordFromApi(
    word: string,
    signal?: AbortSignal,
  ): Promise<WordEntry> {
    const normalized = word.trim().toLowerCase();
    try {
      return await this.apiClient.fetchWordDefinition(normalized, signal);
    } catch (error) {
      if (DEFAULT_DEFINITIONS[normalized]) {
        return DEFAULT_DEFINITIONS[normalized];
      }
      if (error instanceof ApiError && error.isNotFound) {
        return {
          word: normalized,
          phonetic: `/${normalized}/`,
          phonetics: [{ text: `/${normalized}/` }],
          meanings: [
            {
              partOfSpeech: 'term',
              definitions: [
                {
                  definition: `No detailed definition returned by the API for "${normalized}".`,
                },
              ],
            },
          ],
        };
      }
      throw error;
    }
  }

  async syncRemoteWordList(signal?: AbortSignal): Promise<number> {
    const remoteWords = await this.apiClient.fetchRemoteWordList(signal);
    if (remoteWords.length > 0) {
      const baseWords = Object.keys(DEFAULT_DEFINITIONS);
      const merged = Array.from(new Set([...baseWords, ...remoteWords]));
      this.wordList = merged;
      await this.db.setObject(SYNCED_WORDS_KEY, merged);
      return merged.length;
    }
    return (await this.loadWords()).length;
  }

  async getTotalWordsCount(): Promise<number> {
    const allWords = await this.loadWords();
    return allWords.length;
  }
}
