import { WordDetailsResult } from '../entities/WordEntry';
import { ICacheRepository } from '../repositories/ICacheRepository';
import { IDictionaryRepository } from '../repositories/IDictionaryRepository';
import { IUserWordRepository } from '../repositories/IUserWordRepository';

export class GetWordDetailsUseCase {
  constructor(
    private readonly dictionaryRepository: IDictionaryRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly userWordRepository: IUserWordRepository,
  ) {}

  async execute(
    word: string,
    userId: string,
    signal?: AbortSignal,
  ): Promise<WordDetailsResult> {
    const normalizedWord = word.trim().toLowerCase();
    if (!normalizedWord) {
      throw new Error('Palavra inválida.');
    }

    if (userId) {
      await this.userWordRepository.addHistory(userId, normalizedWord);
    }

    const cached = await this.cacheRepository.getCachedWord(normalizedWord);
    if (cached) {
      return {
        entry: cached.entry,
        fromCache: true,
        fetchedAt: cached.cachedAt,
      };
    }

    const entry = await this.dictionaryRepository.fetchWordFromApi(
      normalizedWord,
      signal,
    );

    await this.cacheRepository.setCachedWord(normalizedWord, entry);

    return {
      entry,
      fromCache: false,
      fetchedAt: Date.now(),
    };
  }
}
