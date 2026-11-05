import { DIContainer, DI_TOKENS } from '../src/di/container';
import { PronunciationAudioService } from '../src/infra/audio/PronunciationAudioService';
import { FreeDictionaryApiClient } from '../src/infra/http/FreeDictionaryApiClient';

describe('Services & DI', () => {
  it('resolves singleton instances from DIContainer', () => {
    const container = new DIContainer();
    let calls = 0;

    container.registerSingleton(DI_TOKENS.LocalDatabase, () => {
      calls += 1;
      return { id: calls } as any;
    });

    const a = container.resolve(DI_TOKENS.LocalDatabase);
    const b = container.resolve(DI_TOKENS.LocalDatabase);
    expect(a).toBe(b);
    expect(calls).toBe(1);
  });

  it('uses API audio url when available and falls back to TTS url', () => {
    const audioService = new PronunciationAudioService();

    const directUrl = audioService.getBestAudioUrl('hello', [
      '',
      '//api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
    ]);
    expect(directUrl).toBe(
      'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
    );

    const fallbackUrl = audioService.getBestAudioUrl('diary', []);
    expect(fallbackUrl).toContain('responsivevoice.org/getvoice.php');
    expect(fallbackUrl).toContain('t=diary');
  });

  it('parses Free Dictionary API response payload', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          word: 'hello',
          phonetic: 'həˈləʊ',
          phonetics: [
            {
              text: 'həˈləʊ',
              audio:
                '//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3',
            },
          ],
          meanings: [
            {
              partOfSpeech: 'verb',
              definitions: [
                {
                  definition: '"Hello!" or an equivalent greeting.',
                  example: 'I pressed the phone button and helloed',
                },
              ],
            },
          ],
        },
      ],
    });

    const prevFetch = globalThis.fetch;
    globalThis.fetch = mockFetch as any;

    try {
      const client = new FreeDictionaryApiClient(5000);
      const entry = await client.fetchWordDefinition('hello');
      expect(entry.word).toBe('hello');
      expect(entry.phonetic).toBe('həˈləʊ');
      expect(entry.phonetics[0].audio).toBe(
        'https://ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3',
      );
      expect(entry.meanings[0].partOfSpeech).toBe('verb');
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
});
