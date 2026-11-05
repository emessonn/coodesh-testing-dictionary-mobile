import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DI_TOKENS } from '../../di/container';
import { User, UserCredentials } from '../../domain/entities/User';
import { useContainer } from './ServiceContext';

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const container = useContainer();
  const authUseCase = useMemo(
    () => container.resolve(DI_TOKENS.AuthenticateUserUseCase),
    [container],
  );

  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    authUseCase
      .getCurrentUser()
      .then(savedUser => {
        if (active) {
          setUser(savedUser);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authUseCase]);

  const login = useCallback(
    async (credentials: UserCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const logged = await authUseCase.login(credentials);
        setUser(logged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao entrar.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [authUseCase],
  );

  const register = useCallback(
    async (credentials: UserCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const created = await authUseCase.register(credentials);
        setUser(created);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [authUseCase],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authUseCase.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isInitializing, isLoading, error, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return context;
}
