import { User, UserCredentials } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { LocalDatabase } from '../../infra/storage/LocalDatabase';

const USERS_KEY = '@dictionary:users';
const SESSION_KEY = '@dictionary:session';

interface StoredUser extends User {
  passwordHash: string;
}

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(private readonly db: LocalDatabase) {}

  private hashPassword(raw: string): string {
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash * 33) ^ raw.charCodeAt(i);
    }
    return `${(hash >>> 0).toString(16)}_${raw.length}`;
  }

  private async getUsers(): Promise<StoredUser[]> {
    const users = await this.db.getObject<StoredUser[]>(USERS_KEY, []);
    if (users.length > 0) {
      return users;
    }

    const defaultAccount: StoredUser = {
      id: 'usr_default_01',
      username: 'admin',
      displayName: 'Admin',
      createdAt: 1706832000000,
      passwordHash: this.hashPassword('123456'),
    };

    const initial = [defaultAccount];
    await this.db.setObject(USERS_KEY, initial);
    return initial;
  }

  async login(credentials: UserCredentials): Promise<User> {
    const username = credentials.username.trim().toLowerCase();
    const password = credentials.password.trim();

    if (!username || !password) {
      throw new Error('Preencha usuário e senha.');
    }

    const users = await this.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.passwordHash !== this.hashPassword(password)) {
      throw new Error('Senha incorreta.');
    }

    const sessionUser: User = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };

    await this.db.setObject(SESSION_KEY, sessionUser);
    return sessionUser;
  }

  async register(credentials: UserCredentials): Promise<User> {
    const username = credentials.username.trim().toLowerCase();
    const password = credentials.password.trim();
    const displayName = (credentials.displayName || username).trim();

    if (username.length < 3) {
      throw new Error('O usuário deve ter pelo menos 3 caracteres.');
    }
    if (password.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    const users = await this.getUsers();
    if (users.some(u => u.username === username)) {
      throw new Error('Este nome de usuário já está cadastrado.');
    }

    const created: StoredUser = {
      id: `usr_${Date.now()}`,
      username,
      displayName,
      createdAt: Date.now(),
      passwordHash: this.hashPassword(password),
    };

    await this.db.setObject(USERS_KEY, [...users, created]);

    const sessionUser: User = {
      id: created.id,
      username: created.username,
      displayName: created.displayName,
      createdAt: created.createdAt,
    };

    await this.db.setObject(SESSION_KEY, sessionUser);
    return sessionUser;
  }

  async logout(): Promise<void> {
    await this.db.remove(SESSION_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    await this.getUsers();
    return this.db.getObject<User | null>(SESSION_KEY, null);
  }
}
