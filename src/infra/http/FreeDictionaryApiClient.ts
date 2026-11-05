import { Meaning, Phonetic, WordEntry } from '../../domain/entities/WordEntry';

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const WORDS_DICTIONARY_RAW_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isNotFound: boolean = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiPhonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

interface ApiDefinition {
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiMeaning {
  partOfSpeech?: string;
  definitions?: ApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiWordResponse {
  word?: string;
  phonetic?: string;
  phonetics?: ApiPhonetic[];
  origin?: string;
  meanings?: ApiMeaning[];
  sourceUrls?: string[];
}

export class FreeDictionaryApiClient {
  constructor(private readonly timeoutMs = 10000) {}

  async fetchWordDefinition(
    word: string,
    externalSignal?: AbortSignal,
  ): Promise<WordEntry> {
    const query = encodeURIComponent(word.trim().toLowerCase());
    const url = `${API_BASE_URL}/${query}`;

    if (externalSignal?.aborted) {
      throw new ApiError('Requisição cancelada.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: externalSignal || controller.signal,
      });

      if (response.status === 404) {
        throw new ApiError(
          `Não encontramos definições para "${word}".`,
          404,
          true,
        );
      }

      if (!response.ok) {
        throw new ApiError(
          `Erro ao buscar palavra (status ${response.status}).`,
          response.status,
        );
      }

      const payload = (await response.json()) as ApiWordResponse[];
      if (!Array.isArray(payload) || payload.length === 0) {
        throw new ApiError(`Sem dados disponíveis para "${word}".`, 404, true);
      }

      return this.mapResponseToDomain(word, payload);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ApiError('A conexão demorou muito para responder.');
      }
      throw new ApiError(
        err instanceof Error
          ? err.message
          : 'Erro de rede ao consultar o dicionário.',
      );
    } finally {
      clearTimeout(timer);
    }
  }

  async fetchRemoteWordList(signal?: AbortSignal): Promise<string[]> {
    const response = await fetch(WORDS_DICTIONARY_RAW_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `Não foi possível baixar a lista de palavras (${response.status})`,
        response.status,
      );
    }

    const data = (await response.json()) as Record<string, number>;
    return Object.keys(data);
  }

  private mapResponseToDomain(
    requestedWord: string,
    items: ApiWordResponse[],
  ): WordEntry {
    const first = items[0];
    const phonetics: Phonetic[] = [];
    const meanings: Meaning[] = [];
    const urls = new Set<string>();

    let mainPhonetic = first.phonetic;

    for (const item of items) {
      if (!mainPhonetic && item.phonetic) {
        mainPhonetic = item.phonetic;
      }

      if (Array.isArray(item.phonetics)) {
        for (const p of item.phonetics) {
          if (!mainPhonetic && p.text) {
            mainPhonetic = p.text;
          }
          if (p.text || p.audio) {
            phonetics.push({
              text: p.text,
              audio: p.audio ? this.fixProtocol(p.audio) : undefined,
              sourceUrl: p.sourceUrl,
            });
          }
        }
      }

      if (Array.isArray(item.meanings)) {
        for (const m of item.meanings) {
          meanings.push({
            partOfSpeech: m.partOfSpeech || 'term',
            synonyms: m.synonyms || [],
            antonyms: m.antonyms || [],
            definitions: (m.definitions || [])
              .filter(d => Boolean(d.definition))
              .map(d => ({
                definition: d.definition!,
                example: d.example,
                synonyms: d.synonyms || [],
                antonyms: d.antonyms || [],
              })),
          });
        }
      }

      item.sourceUrls?.forEach(u => urls.add(u));
    }

    return {
      word: (first.word || requestedWord).toLowerCase(),
      phonetic: mainPhonetic || `/${requestedWord.toLowerCase()}/`,
      phonetics,
      origin: first.origin,
      meanings,
      sourceUrls: Array.from(urls),
    };
  }

  private fixProtocol(url: string): string {
    return url.startsWith('//') ? `https:${url}` : url;
  }
}
