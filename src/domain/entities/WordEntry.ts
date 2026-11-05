export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

export interface DefinitionItem {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: DefinitionItem[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
  sourceUrls?: string[];
}

export interface WordDetailsResult {
  entry: WordEntry;
  fromCache: boolean;
  fetchedAt: number;
}

