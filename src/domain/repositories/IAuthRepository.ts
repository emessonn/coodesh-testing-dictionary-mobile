import { User, UserCredentials } from '../entities/User';

export interface IAuthRepository {
  login(credentials: UserCredentials): Promise<User>;
  register(credentials: UserCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

