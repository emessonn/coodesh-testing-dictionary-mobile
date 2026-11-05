import {
  IDictionaryRepository,
  PaginatedWordsResult,
} from '../repositories/IDictionaryRepository';

export class GetWordsPageUseCase {
  constructor(private readonly dictionaryRepository: IDictionaryRepository) {}

  async execute(
    page: number,
    pageSize: number = 30,
    searchQuery?: string,
  ): Promise<PaginatedWordsResult> {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    return this.dictionaryRepository.getWordsPage(
      safePage,
      safePageSize,
      searchQuery?.trim(),
    );
  }
}

