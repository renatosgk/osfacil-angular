import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthResponse, LoginPayload, RegisterPayload } from '../../shared/interfaces/entities';
import { StorageService } from './storage.service';

type AuthApiResponse = AuthResponse & {
  tokenAcesso?: string;
  nome?: string;
  email?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);
  readonly isAuthenticated = computed(() => this.authenticated());

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService
  ) {
    this.authenticated.set(!!this.storageService.getToken());
  }

  login(payload: LoginPayload) {
    return this.http
      .post<AuthApiResponse>(`${API_BASE_URL}/login`, {
        email: payload.email,
        password: payload.senha,
      })
      .pipe(
      tap((response) => {
        const token = response.token ?? response.tokenAcesso;
        if (!token) {
          throw new Error('Resposta de login sem token.');
        }

        this.storageService.setToken(token);
        if (response.usuario) {
          this.storageService.setUser(response.usuario);
        } else {
          this.storageService.setUser({
            nome: response.nome,
            email: response.email,
          });
        }
        this.authenticated.set(true);
      })
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post(
      `${API_BASE_URL}/register`,
      {
        nome: payload.nome,
        email: payload.email,
        cpf: payload.cpf,
        telefone: payload.telefone,
        endereco: payload.endereco,
        password: payload.senha,
      },
      { responseType: 'text' }
    );
  }

  registerFuncionario(payload: RegisterPayload) {
    return this.http.post(
      `${API_BASE_URL}/register-funcionario`,
      {
        nome: payload.nome,
        email: payload.email,
        password: payload.senha,
      },
      { responseType: 'text' }
    );
  }

  logout(): void {
    this.storageService.clearAll();
    this.authenticated.set(false);
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }
}
