import { User, UserCredentials } from '../entities/User';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class AuthenticateUserUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async login(credentials: UserCredentials): Promise<User> {
    return this.authRepository.login(credentials);
  }

  async register(credentials: UserCredentials): Promise<User> {
    return this.authRepository.register(credentials);
  }

  async logout(): Promise<void> {
    return this.authRepository.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}

