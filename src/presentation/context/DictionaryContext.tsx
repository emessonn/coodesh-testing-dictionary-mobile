import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DI_TOKENS } from '../../di/container';
import { UserWordRecord } from '../../domain/entities/UserWordRecord';
import { WordDetailsResult } from '../../domain/entities/WordEntry';
import { useAuth } from './AuthContext';
import { useContainer } from './ServiceContext';

export type DictionaryTab = 'wordlist' | 'history' | 'favorites';

const PAGE_SIZE = 36;

interface DictionaryContextValue {
  activeTab: DictionaryTab;
  setActiveTab: (tab: DictionaryTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  words: string[];
  totalWords: number;
  hasMoreWords: boolean;
  isLoadingWords: boolean;
  loadMoreWords: () => Promise<void>;
  favorites: UserWordRecord[];
  history: UserWordRecord[];
  favoriteWordsSet: Set<string>;
  historyWordsSet: Set<string>;
  displayedWords: string[];
  selectedWord: string | null;
  wordDetails: WordDetailsResult | null;
  isLoadingDetails: boolean;
  detailsError: string | null;
  openWordDetails: (word: string) => Promise<void>;
  closeWordDetails: () => void;
  toggleFavorite: (word: string) => Promise<void>;
  isWordFavorite: (word: string) => boolean;
  hasPreviousWord: boolean;
  hasNextWord: boolean;
  goToPreviousWord: () => Promise<void>;
  goToNextWord: () => Promise<void>;
}

const DictionaryContext = createContext<DictionaryContextValue | undefined>(
  undefined,
);

export function DictionaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const container = useContainer();
  const { user } = useAuth();

  const getWordsPageUseCase = useMemo(
    () => container.resolve(DI_TOKENS.GetWordsPageUseCase),
    [container],
  );
  const getWordDetailsUseCase = useMemo(
    () => container.resolve(DI_TOKENS.GetWordDetailsUseCase),
    [container],
  );
  const toggleFavoriteUseCase = useMemo(
    () => container.resolve(DI_TOKENS.ToggleFavoriteUseCase),
    [container],
  );
  const getUserFavoritesUseCase = useMemo(
    () => container.resolve(DI_TOKENS.GetUserFavoritesUseCase),
    [container],
  );
  const getUserHistoryUseCase = useMemo(
    () => container.resolve(DI_TOKENS.GetUserHistoryUseCase),
    [container],
  );
  const audioService = useMemo(
    () => container.resolve(DI_TOKENS.AudioService),
    [container],
  );

  const [activeTab, setActiveTab] = useState<DictionaryTab>('wordlist');
  const [searchQuery, setSearchQuery] = useState('');

  const [words, setWords] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [hasMoreWords, setHasMoreWords] = useState(true);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  const [favorites, setFavorites] = useState<UserWordRecord[]>([]);
  const [history, setHistory] = useState<UserWordRecord[]>([]);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [navigationList, setNavigationList] = useState<string[]>([]);
  const [wordDetails, setWordDetails] = useState<WordDetailsResult | null>(
    null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const requestAbortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);
  const loadingNextPageRef = useRef(false);

  useEffect(() => {
    let active = true;
    setIsLoadingWords(true);
    getWordsPageUseCase
      .execute(1, PAGE_SIZE, searchQuery)
      .then(res => {
        if (active) {
          setWords(res.words);
          setPage(1);
          setTotalWords(res.total);
          setHasMoreWords(res.hasMore);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingWords(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getWordsPageUseCase, searchQuery]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setFavorites([]);
      setHistory([]);
      return;
    }

    Promise.all([
      getUserFavoritesUseCase.execute(user.id),
      getUserHistoryUseCase.execute(user.id),
    ]).then(([favs, hist]) => {
      if (active) {
        setFavorites(favs);
        setHistory(hist);
      }
    });

    return () => {
      active = false;
    };
  }, [user, getUserFavoritesUseCase, getUserHistoryUseCase]);

  const loadMoreWords = useCallback(async () => {
    if (
      loadingNextPageRef.current ||
      isLoadingWords ||
      !hasMoreWords ||
      activeTab !== 'wordlist'
    ) {
      return;
    }

    loadingNextPageRef.current = true;
    setIsLoadingWords(true);
    try {
      const nextPage = page + 1;
      const res = await getWordsPageUseCase.execute(
        nextPage,
        PAGE_SIZE,
        searchQuery,
      );
      setWords(prev => {
        const seen = new Set(prev);
        const next = [...prev];
        for (const item of res.words) {
          if (!seen.has(item)) {
            next.push(item);
          }
        }
        return next;
      });
      setPage(nextPage);
      setTotalWords(res.total);
      setHasMoreWords(res.hasMore);
    } finally {
      setIsLoadingWords(false);
      loadingNextPageRef.current = false;
    }
  }, [
    activeTab,
    getWordsPageUseCase,
    hasMoreWords,
    isLoadingWords,
    page,
    searchQuery,
  ]);

  const favoriteWordsSet = useMemo(
    () => new Set(favorites.map(f => f.word)),
    [favorites],
  );

  const historyWordsSet = useMemo(
    () => new Set(history.map(h => h.word)),
    [history],
  );

  const displayedWords = useMemo(() => {
    const filter = searchQuery.trim().toLowerCase();
    if (activeTab === 'wordlist') {
      return words;
    }
    if (activeTab === 'history') {
      const list = history.map(h => h.word);
      return filter ? list.filter(w => w.includes(filter)) : list;
    }
    const list = favorites.map(f => f.word);
    return filter ? list.filter(w => w.includes(filter)) : list;
  }, [activeTab, words, history, favorites, searchQuery]);

  const fetchDetailsForWord = useCallback(
    async (word: string, listSnapshot?: string[]) => {
      const normalized = word.trim().toLowerCase();
      if (!normalized) {
        return;
      }

      if (listSnapshot) {
        setNavigationList(listSnapshot);
      }

      requestAbortRef.current?.abort();
      const controller = new AbortController();
      requestAbortRef.current = controller;
      const currentSeq = ++requestSeqRef.current;

      await audioService.stop();
      setSelectedWord(normalized);
      setIsLoadingDetails(true);
      setDetailsError(null);

      try {
        const userId = user?.id || 'guest';
        const result = await getWordDetailsUseCase.execute(
          normalized,
          userId,
          controller.signal,
        );

        if (currentSeq === requestSeqRef.current) {
          setWordDetails(result);
          if (user) {
            const updatedHistory = await getUserHistoryUseCase.execute(user.id);
            setHistory(updatedHistory);
          }
        }
      } catch (err) {
        if (currentSeq === requestSeqRef.current) {
          setDetailsError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar informações da palavra.',
          );
          setWordDetails(null);
        }
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setIsLoadingDetails(false);
        }
      }
    },
    [audioService, getUserHistoryUseCase, getWordDetailsUseCase, user],
  );

  const openWordDetails = useCallback(
    async (word: string) => {
      const snapshot =
        displayedWords.length > 0 ? [...displayedWords] : [word.toLowerCase()];
      await fetchDetailsForWord(word, snapshot);
    },
    [displayedWords, fetchDetailsForWord],
  );

  const closeWordDetails = useCallback(() => {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    requestSeqRef.current += 1;
    audioService.stop();
    setSelectedWord(null);
    setNavigationList([]);
    setWordDetails(null);
    setDetailsError(null);
    setIsLoadingDetails(false);
  }, [audioService]);

  const toggleFavorite = useCallback(
    async (word: string) => {
      const userId = user?.id || 'guest';
      const result = await toggleFavoriteUseCase.execute(userId, word);
      setFavorites(result.favorites);
    },
    [toggleFavoriteUseCase, user],
  );

  const isWordFavorite = useCallback(
    (word: string) => favoriteWordsSet.has(word.trim().toLowerCase()),
    [favoriteWordsSet],
  );

  const activeSequenceList = useMemo(
    () => (navigationList.length > 0 ? navigationList : displayedWords),
    [navigationList, displayedWords],
  );

  const currentIndex = useMemo(() => {
    if (!selectedWord) {
      return -1;
    }
    return activeSequenceList.findIndex(
      w => w.toLowerCase() === selectedWord.toLowerCase(),
    );
  }, [activeSequenceList, selectedWord]);

  const hasPreviousWord = currentIndex > 0;
  const hasNextWord =
    currentIndex >= 0 && currentIndex < activeSequenceList.length - 1;

  const goToPreviousWord = useCallback(async () => {
    if (currentIndex > 0) {
      const prevWord = activeSequenceList[currentIndex - 1];
      await fetchDetailsForWord(prevWord);
    }
  }, [activeSequenceList, currentIndex, fetchDetailsForWord]);

  const goToNextWord = useCallback(async () => {
    if (currentIndex >= 0 && currentIndex < activeSequenceList.length - 1) {
      const nextWord = activeSequenceList[currentIndex + 1];
      await fetchDetailsForWord(nextWord);
    }
  }, [activeSequenceList, currentIndex, fetchDetailsForWord]);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      words,
      totalWords,
      hasMoreWords,
      isLoadingWords,
      loadMoreWords,
      favorites,
      history,
      favoriteWordsSet,
      historyWordsSet,
      displayedWords,
      selectedWord,
      wordDetails,
      isLoadingDetails,
      detailsError,
      openWordDetails,
      closeWordDetails,
      toggleFavorite,
      isWordFavorite,
      hasPreviousWord,
      hasNextWord,
      goToPreviousWord,
      goToNextWord,
    }),
    [
      activeTab,
      searchQuery,
      words,
      totalWords,
      hasMoreWords,
      isLoadingWords,
      loadMoreWords,
      favorites,
      history,
      favoriteWordsSet,
      historyWordsSet,
      displayedWords,
      selectedWord,
      wordDetails,
      isLoadingDetails,
      detailsError,
      openWordDetails,
      closeWordDetails,
      toggleFavorite,
      isWordFavorite,
      hasPreviousWord,
      hasNextWord,
      goToPreviousWord,
      goToNextWord,
    ],
  );

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): DictionaryContextValue {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary precisa estar dentro de DictionaryProvider');
  }
  return context;
}
