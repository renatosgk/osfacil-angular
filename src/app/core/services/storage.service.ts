import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly tokenKey = 'osfacil_token';
  private readonly userKey = 'osfacil_user';

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  setUser(user: unknown): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  clearAll(): void {
    this.clearToken();
    localStorage.removeItem(this.userKey);
  }
}
