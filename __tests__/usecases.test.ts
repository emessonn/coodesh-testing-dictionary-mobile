import { createAppContainer, DI_TOKENS } from '../src/di/container';
import { WordEntry } from '../src/domain/entities/WordEntry';
import {
  LocalDatabase,
  StorageAdapter,
} from '../src/infra/storage/LocalDatabase';

class MemoryStorage implements StorageAdapter {
  private data = new Map<string, string>();
  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

describe('Use Cases', () => {
  let db: LocalDatabase;
  let container: ReturnType<typeof createAppContainer>;

  beforeEach(() => {
    db = new LocalDatabase(new MemoryStorage());
    container = createAppContainer(db);
  });

  it('paginates the word list and filters by search term', async () => {
    const getWordsPage = container.resolve(DI_TOKENS.GetWordsPageUseCase);

    const page1 = await getWordsPage.execute(1, 12);
    expect(page1.words).toHaveLength(12);
    expect(page1.words.slice(0, 3)).toEqual(['hello', 'today', 'great']);
    expect(page1.hasMore).toBe(true);

    const page2 = await getWordsPage.execute(2, 12);
    expect(page2.words).toHaveLength(12);
    expect(page2.words[0]).not.toBe(page1.words[0]);

    const searchResult = await getWordsPage.execute(1, 10, 'hello');
    expect(searchResult.words).toContain('hello');
  });

  it('returns cached word details on repeated lookups without calling the API again', async () => {
    const mockEntry: WordEntry = {
      word: 'hello',
      phonetic: 'həˈləʊ',
      phonetics: [{ text: 'həˈləʊ' }],
      meanings: [
        {
          partOfSpeech: 'verb',
          definitions: [{ definition: '"Hello!" or an equivalent greeting.' }],
        },
      ],
    };

    const fetchSpy = jest.fn().mockResolvedValue(mockEntry);
    container.registerSingleton(DI_TOKENS.DictionaryRepository, () => ({
      getWordsPage: jest.fn(),
      fetchWordFromApi: fetchSpy,
      syncRemoteWordList: jest.fn(),
      getTotalWordsCount: jest.fn(),
    }));

    const getWordDetails = container.resolve(DI_TOKENS.GetWordDetailsUseCase);
    const getHistory = container.resolve(DI_TOKENS.GetUserHistoryUseCase);

    const firstCall = await getWordDetails.execute('hello', 'usr_1');
    expect(firstCall.fromCache).toBe(false);
    expect(firstCall.entry.word).toBe('hello');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const secondCall = await getWordDetails.execute('HELLO', 'usr_1');
    expect(secondCall.fromCache).toBe(true);
    expect(secondCall.entry.phonetic).toBe('həˈləʊ');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const history = await getHistory.execute('usr_1');
    expect(history.map(h => h.word)).toEqual(['hello']);
  });

  it('keeps favorites isolated per user id', async () => {
    const toggleFav = container.resolve(DI_TOKENS.ToggleFavoriteUseCase);
    const getFavorites = container.resolve(DI_TOKENS.GetUserFavoritesUseCase);

    const added = await toggleFav.execute('user_a', 'hello');
    expect(added.isFavorite).toBe(true);
    await toggleFav.execute('user_a', 'peace');

    await toggleFav.execute('user_b', 'sun');

    const favsA = await getFavorites.execute('user_a');
    const favsB = await getFavorites.execute('user_b');

    expect(favsA.map(f => f.word)).toEqual(['peace', 'hello']);
    expect(favsB.map(f => f.word)).toEqual(['sun']);

    const removed = await toggleFav.execute('user_a', 'hello');
    expect(removed.isFavorite).toBe(false);
    expect(removed.favorites.map(f => f.word)).toEqual(['peace']);
  });

  it('handles user registration, login and logout', async () => {
    const auth = container.resolve(DI_TOKENS.AuthenticateUserUseCase);

    const created = await auth.register({
      username: 'lucas',
      password: '123456',
      displayName: 'Lucas',
    });
    expect(created.username).toBe('lucas');

    const session = await auth.getCurrentUser();
    expect(session?.id).toBe(created.id);

    await auth.logout();
    expect(await auth.getCurrentUser()).toBeNull();

    await expect(
      auth.login({ username: 'lucas', password: '000' }),
    ).rejects.toThrow('Senha incorreta');

    const logged = await auth.login({
      username: 'lucas',
      password: '123456',
    });
    expect(logged.id).toBe(created.id);
  });
});
