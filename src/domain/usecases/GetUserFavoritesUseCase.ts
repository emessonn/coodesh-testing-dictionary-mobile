import { UserWordRecord } from '../entities/UserWordRecord';
import { IUserWordRepository } from '../repositories/IUserWordRepository';

export class GetUserFavoritesUseCase {
  constructor(private readonly userWordRepository: IUserWordRepository) {}

  async execute(userId: string): Promise<UserWordRecord[]> {
    if (!userId) {
      return [];
    }
    return this.userWordRepository.getFavorites(userId);
  }
}

