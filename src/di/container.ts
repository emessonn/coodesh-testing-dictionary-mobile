import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl';
import { CacheRepositoryImpl } from '../data/repositories/CacheRepositoryImpl';
import { DictionaryRepositoryImpl } from '../data/repositories/DictionaryRepositoryImpl';
import { UserWordRepositoryImpl } from '../data/repositories/UserWordRepositoryImpl';
import { IAudioService } from '../domain/repositories/IAudioService';
import { IAuthRepository } from '../domain/repositories/IAuthRepository';
import { ICacheRepository } from '../domain/repositories/ICacheRepository';
import { IDictionaryRepository } from '../domain/repositories/IDictionaryRepository';
import { IUserWordRepository } from '../domain/repositories/IUserWordRepository';
import { AuthenticateUserUseCase } from '../domain/usecases/AuthenticateUserUseCase';
import { GetUserFavoritesUseCase } from '../domain/usecases/GetUserFavoritesUseCase';
import { GetUserHistoryUseCase } from '../domain/usecases/GetUserHistoryUseCase';
import { GetWordDetailsUseCase } from '../domain/usecases/GetWordDetailsUseCase';
import { GetWordsPageUseCase } from '../domain/usecases/GetWordsPageUseCase';
import { ToggleFavoriteUseCase } from '../domain/usecases/ToggleFavoriteUseCase';
import { PronunciationAudioService } from '../infra/audio/PronunciationAudioService';
import { FreeDictionaryApiClient } from '../infra/http/FreeDictionaryApiClient';
import { LocalDatabase } from '../infra/storage/LocalDatabase';

export const DI_TOKENS = {
  LocalDatabase: 'LocalDatabase',
  FreeDictionaryApiClient: 'FreeDictionaryApiClient',
  CacheRepository: 'ICacheRepository',
  DictionaryRepository: 'IDictionaryRepository',
  UserWordRepository: 'IUserWordRepository',
  AuthRepository: 'IAuthRepository',
  AudioService: 'IAudioService',
  GetWordsPageUseCase: 'GetWordsPageUseCase',
  GetWordDetailsUseCase: 'GetWordDetailsUseCase',
  ToggleFavoriteUseCase: 'ToggleFavoriteUseCase',
  GetUserFavoritesUseCase: 'GetUserFavoritesUseCase',
  GetUserHistoryUseCase: 'GetUserHistoryUseCase',
  AuthenticateUserUseCase: 'AuthenticateUserUseCase',
} as const;

export interface ServiceMap {
  [DI_TOKENS.LocalDatabase]: LocalDatabase;
  [DI_TOKENS.FreeDictionaryApiClient]: FreeDictionaryApiClient;
  [DI_TOKENS.CacheRepository]: ICacheRepository;
  [DI_TOKENS.DictionaryRepository]: IDictionaryRepository;
  [DI_TOKENS.UserWordRepository]: IUserWordRepository;
  [DI_TOKENS.AuthRepository]: IAuthRepository;
  [DI_TOKENS.AudioService]: IAudioService;
  [DI_TOKENS.GetWordsPageUseCase]: GetWordsPageUseCase;
  [DI_TOKENS.GetWordDetailsUseCase]: GetWordDetailsUseCase;
  [DI_TOKENS.ToggleFavoriteUseCase]: ToggleFavoriteUseCase;
  [DI_TOKENS.GetUserFavoritesUseCase]: GetUserFavoritesUseCase;
  [DI_TOKENS.GetUserHistoryUseCase]: GetUserHistoryUseCase;
  [DI_TOKENS.AuthenticateUserUseCase]: AuthenticateUserUseCase;
}

type Factory<T> = (container: DIContainer) => T;

interface ProviderRecord<T> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

export class DIContainer {
  private providers = new Map<string, ProviderRecord<unknown>>();

  registerSingleton<K extends keyof ServiceMap>(
    token: K,
    factory: Factory<ServiceMap[K]>,
  ): void {
    this.providers.set(token, { factory, singleton: true });
  }

  registerTransient<K extends keyof ServiceMap>(
    token: K,
    factory: Factory<ServiceMap[K]>,
  ): void {
    this.providers.set(token, { factory, singleton: false });
  }

  resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K] {
    const record = this.providers.get(token);
    if (!record) {
      throw new Error(`Provider não registrado para: ${String(token)}`);
    }

    if (record.singleton) {
      if (record.instance === undefined) {
        record.instance = record.factory(this);
      }
      return record.instance as ServiceMap[K];
    }

    return record.factory(this) as ServiceMap[K];
  }

  reset(): void {
    this.providers.clear();
  }
}

export function createAppContainer(customDb?: LocalDatabase): DIContainer {
  const container = new DIContainer();

  container.registerSingleton(
    DI_TOKENS.LocalDatabase,
    () => customDb || new LocalDatabase(),
  );
  container.registerSingleton(
    DI_TOKENS.FreeDictionaryApiClient,
    () => new FreeDictionaryApiClient(10000),
  );

  container.registerSingleton(
    DI_TOKENS.CacheRepository,
    c => new CacheRepositoryImpl(c.resolve(DI_TOKENS.LocalDatabase)),
  );
  container.registerSingleton(
    DI_TOKENS.DictionaryRepository,
    c =>
      new DictionaryRepositoryImpl(
        c.resolve(DI_TOKENS.FreeDictionaryApiClient),
        c.resolve(DI_TOKENS.LocalDatabase),
      ),
  );
  container.registerSingleton(
    DI_TOKENS.UserWordRepository,
    c => new UserWordRepositoryImpl(c.resolve(DI_TOKENS.LocalDatabase)),
  );
  container.registerSingleton(
    DI_TOKENS.AuthRepository,
    c => new AuthRepositoryImpl(c.resolve(DI_TOKENS.LocalDatabase)),
  );
  container.registerSingleton(
    DI_TOKENS.AudioService,
    () => new PronunciationAudioService(),
  );

  container.registerTransient(
    DI_TOKENS.GetWordsPageUseCase,
    c => new GetWordsPageUseCase(c.resolve(DI_TOKENS.DictionaryRepository)),
  );
  container.registerTransient(
    DI_TOKENS.GetWordDetailsUseCase,
    c =>
      new GetWordDetailsUseCase(
        c.resolve(DI_TOKENS.DictionaryRepository),
        c.resolve(DI_TOKENS.CacheRepository),
        c.resolve(DI_TOKENS.UserWordRepository),
      ),
  );
  container.registerTransient(
    DI_TOKENS.ToggleFavoriteUseCase,
    c => new ToggleFavoriteUseCase(c.resolve(DI_TOKENS.UserWordRepository)),
  );
  container.registerTransient(
    DI_TOKENS.GetUserFavoritesUseCase,
    c => new GetUserFavoritesUseCase(c.resolve(DI_TOKENS.UserWordRepository)),
  );
  container.registerTransient(
    DI_TOKENS.GetUserHistoryUseCase,
    c => new GetUserHistoryUseCase(c.resolve(DI_TOKENS.UserWordRepository)),
  );
  container.registerTransient(
    DI_TOKENS.AuthenticateUserUseCase,
    c => new AuthenticateUserUseCase(c.resolve(DI_TOKENS.AuthRepository)),
  );

  return container;
}

export const appContainer = createAppContainer();
