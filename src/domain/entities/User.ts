export interface User {
  id: string;
  username: string;
  displayName: string;
  createdAt: number;
}

export interface UserCredentials {
  username: string;
  password: string;
  displayName?: string;
}

