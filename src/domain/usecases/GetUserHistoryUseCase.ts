import { UserWordRecord } from '../entities/UserWordRecord';
import { IUserWordRepository } from '../repositories/IUserWordRepository';

export class GetUserHistoryUseCase {
  constructor(private readonly userWordRepository: IUserWordRepository) {}

  async execute(userId: string): Promise<UserWordRecord[]> {
    if (!userId) {
      return [];
    }
    return this.userWordRepository.getHistory(userId);
  }

  async clear(userId: string): Promise<void> {
    if (!userId) {
      return;
    }
    await this.userWordRepository.clearHistory(userId);
  }
}

