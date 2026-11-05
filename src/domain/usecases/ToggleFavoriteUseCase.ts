import { UserWordRecord } from '../entities/UserWordRecord';
import { IUserWordRepository } from '../repositories/IUserWordRepository';

export interface ToggleFavoriteResult {
  isFavorite: boolean;
  favorites: UserWordRecord[];
}

export class ToggleFavoriteUseCase {
  constructor(private readonly userWordRepository: IUserWordRepository) {}

  async execute(userId: string, word: string): Promise<ToggleFavoriteResult> {
    const normalizedWord = word.trim().toLowerCase();
    if (!userId) {
      throw new Error('Usuário não autenticado.');
    }
    if (!normalizedWord) {
      throw new Error('Palavra inválida.');
    }

    const currentlyFav = await this.userWordRepository.isFavorite(
      userId,
      normalizedWord,
    );

    if (currentlyFav) {
      const favorites = await this.userWordRepository.removeFavorite(
        userId,
        normalizedWord,
      );
      return { isFavorite: false, favorites };
    } else {
      const favorites = await this.userWordRepository.addFavorite(
        userId,
        normalizedWord,
      );
      return { isFavorite: true, favorites };
    }
  }
}

