import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthResponse, LoginPayload, RegisterAdminPayload, RegisterFuncionarioPayload, RegisterPayload } from '../../shared/interfaces/entities';
import { StorageService } from './storage.service';

type AuthApiResponse = AuthResponse & {
  tokenAcesso?: string;
  id?: number;
  nome?: string;
  email?: string;
  role?: string;
};

export interface CurrentUser {
  id?: number;
  nome?: string;
  email?: string;
  perfil?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);
  private readonly _role = signal<string | null>(null);
  private readonly _currentUser = signal<CurrentUser | null>(null);

  readonly isAuthenticated = computed(() => this.authenticated());
  readonly userRole = this._role.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  readonly isCliente    = computed(() => this._role() === 'ROLE_CLIENTE');
  readonly isFuncionario = computed(() => this._role() === 'ROLE_FUNCIONARIO');
  readonly isAdmin      = computed(() => this._role() === 'ROLE_ADMIN');
  readonly isStaff      = computed(() => this.isFuncionario() || this.isAdmin());

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService
  ) {
    const stored = this.storageService.getUser<CurrentUser>();
    this._role.set(stored?.role ?? null);
    this._currentUser.set(stored ?? null);
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
        const userData = response.usuario
          ? { ...response.usuario, role: response.role }
          : { id: response.id, nome: response.nome, email: response.email, role: response.role };

        this.storageService.setUser(userData);
        this._role.set(response.role ?? null);
        this._currentUser.set(userData as CurrentUser);
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

  registerFuncionario(payload: RegisterFuncionarioPayload) {
    return this.http.post(
      `${API_BASE_URL}/register-funcionario`,
      payload,
      { responseType: 'text' }
    );
  }

  registerAdmin(payload: RegisterAdminPayload) {
    return this.http.post(
      `${API_BASE_URL}/register-admin`,
      payload,
      { responseType: 'text' }
    );
  }

  logout(): void {
    this.storageService.clearAll();
    this._role.set(null);
    this.authenticated.set(false);
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }
}
