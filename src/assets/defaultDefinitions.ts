import { WordEntry } from '../domain/entities/WordEntry';

export const DEFAULT_DEFINITIONS: Record<string, WordEntry> = {
  hello: {
    word: 'hello',
    phonetic: 'həˈləʊ',
    phonetics: [
      {
        text: 'həˈləʊ',
        audio:
          'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
      },
    ],
    meanings: [
      {
        partOfSpeech: 'exclamation',
        definitions: [
          {
            definition:
              'Used as a greeting or to begin a phone conversation.',
            example: 'hello there, Katie!',
          },
        ],
      },
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'An utterance of "hello"; a greeting.',
            example: 'she was getting polite nods and hellos from people',
          },
        ],
      },
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
  today: {
    word: 'today',
    phonetic: '/təˈdeɪ/',
    phonetics: [{ text: '/təˈdeɪ/' }],
    meanings: [
      {
        partOfSpeech: 'adverb',
        definitions: [
          {
            definition: 'On or in the course of this present day.',
          },
        ],
      },
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'This present day.',
          },
        ],
      },
    ],
  },
  great: {
    word: 'great',
    phonetic: '/ɡɹeɪt/',
    phonetics: [{ text: '/ɡɹeɪt/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition:
              'Of an extent, amount, or intensity considerably above the normal or average.',
          },
        ],
      },
    ],
  },
  peace: {
    word: 'peace',
    phonetic: '/piːs/',
    phonetics: [{ text: '/piːs/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'Freedom from disturbance; tranquility.',
          },
        ],
      },
    ],
  },
  chair: {
    word: 'chair',
    phonetic: '/tʃɛə/',
    phonetics: [{ text: '/tʃɛə/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'A separate seat for one person, typically with a back and four legs.',
          },
        ],
      },
    ],
  },
  diary: {
    word: 'diary',
    phonetic: '/ˈdaɪəɹi/',
    phonetics: [{ text: '/ˈdaɪəɹi/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'A book in which one keeps a daily record of events and experiences.',
          },
        ],
      },
    ],
  },
  value: {
    word: 'value',
    phonetic: '/ˈvæljuː/',
    phonetics: [{ text: '/ˈvæljuː/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'The regard that something is held to deserve; the importance, worth, or usefulness of something.',
          },
        ],
      },
    ],
  },
  common: {
    word: 'common',
    phonetic: '/ˈkɒmən/',
    phonetics: [{ text: '/ˈkɒmən/' }],
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Occurring, found, or done often; prevalent.',
          },
        ],
      },
    ],
  },
  watch: {
    word: 'watch',
    phonetic: '/wɒtʃ/',
    phonetics: [{ text: '/wɒtʃ/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition:
              'Look at or observe attentively over a period of time.',
          },
        ],
      },
    ],
  },
  stop: {
    word: 'stop',
    phonetic: '/stɒp/',
    phonetics: [{ text: '/stɒp/' }],
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition:
              'Come to an end; cease to happen.',
          },
        ],
      },
    ],
  },
  sun: {
    word: 'sun',
    phonetic: '/sʌn/',
    phonetics: [{ text: '/sʌn/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition:
              'The star around which the earth orbits.',
          },
        ],
      },
    ],
  },
  review: {
    word: 'review',
    phonetic: '/ɹɪˈvjuː/',
    phonetics: [{ text: '/ɹɪˈvjuː/' }],
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A formal assessment or examination of something.',
          },
        ],
      },
    ],
  },
};

