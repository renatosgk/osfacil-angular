import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { parseApiError } from '../../shared/utils/http-error.util';

function digitsLengthValidator(min: number, max = min): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').trim();
    if (!raw) return null;
    const digits = raw.replace(/\D/g, '');
    if (digits.length < min || digits.length > max) {
      return { digitsLength: true };
    }
    return null;
  };
}

type TabId = 'login' | 'cliente' | 'funcionario' | 'admin';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .auth-shell {
      display: flex;
      min-height: 100dvh;
    }

    .auth-brand {
      flex: 0 0 420px;
      background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }
    .auth-brand::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 70% 60% at 50% 30%, rgba(37,99,235,0.25) 0%, transparent 70%);
      pointer-events: none;
    }
    .brand-mascot-wrap {
      position: relative;
      margin-bottom: 2rem;
    }
    .brand-mascot {
      width: 200px;
      height: 200px;
      object-fit: contain;
      filter: drop-shadow(0 16px 40px rgba(0,0,0,0.5));
      transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
    }
    .brand-mascot:hover { transform: translateY(-6px) rotate(-2deg) scale(1.04); }
    .brand-mascot-ring {
      position: absolute;
      inset: -12px;
      border-radius: 50%;
      border: 2px dashed rgba(255,255,255,0.1);
      animation: spin-slow 18s linear infinite;
    }
    @keyframes spin-slow { to { transform: rotate(360deg); } }
    .brand-name {
      color: #fff;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.375rem;
      text-align: center;
    }
    .brand-tagline {
      color: #94a3b8;
      font-size: 0.9375rem;
      text-align: center;
      line-height: 1.5;
      max-width: 240px;
    }

    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      padding: 2.5rem 2rem;
      overflow-y: auto;
    }
    .auth-form-inner {
      width: 100%;
      max-width: 440px;
    }
    .form-eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #2563eb;
      margin-bottom: 0.375rem;
    }
    .form-eyebrow.purple { color: #7c3aed; }
    .form-title {
      font-size: 1.625rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.375rem;
    }
    .form-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 1.75rem;
    }

    .tab-bar {
      display: flex;
      background: #e2e8f0;
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 1.75rem;
      gap: 3px;
    }
    .tab-btn {
      flex: 1;
      padding: 0.5rem 0;
      border: none;
      border-radius: 9px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s;
      background: transparent;
      color: #64748b;
      white-space: nowrap;
    }
    .tab-btn.active {
      background: #fff;
      color: #0f172a;
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }
    .tab-btn.active.tab-func  { color: #1d4ed8; }
    .tab-btn.active.tab-admin { color: #6d28d9; }

    .field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    .field label { font-size: 0.8125rem; font-weight: 500; color: #334155; }
    .field input, .field select {
      padding: 0.6875rem 0.9375rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #0f172a;
      background: #fff;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      appearance: none;
      -webkit-appearance: none;
    }
    .field input:focus, .field select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    .field input.ng-invalid.ng-touched,
    .field select.ng-invalid.ng-touched {
      border-color: #ef4444;
    }
    .field-hint {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.125rem;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 1rem;
    }
    .form-grid-2 .field { margin-bottom: 1rem; }

    .btn-submit {
      width: 100%;
      padding: 0.8125rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      margin-top: 0.5rem;
    }
    .btn-submit:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .btn-submit.purple { background: #7c3aed; }
    .btn-submit.purple:hover:not(:disabled) { background: #6d28d9; }

    .tab-locked {
      text-align: center;
      padding: 2.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .lock-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .lock-icon.blue   { background: #dbeafe; }
    .lock-icon.purple { background: #ede9fe; }
    .lock-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }
    .lock-sub {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 1.5rem;
      line-height: 1.55;
    }
    .badge-role {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-role.blue   { background: #dbeafe; color: #1d4ed8; }
    .badge-role.purple { background: #ede9fe; color: #6d28d9; }

    .section-sep {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0.5rem 0 1rem;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .section-sep::before, .section-sep::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    @media (max-width: 860px) {
      .auth-shell { flex-direction: column; }
      .auth-brand {
        flex: none;
        padding: 2.5rem 1.5rem;
        flex-direction: row;
        gap: 1.25rem;
        justify-content: flex-start;
      }
      .brand-mascot-wrap { margin-bottom: 0; }
      .brand-mascot { width: 80px; height: 80px; }
      .brand-mascot-ring { display: none; }
      .brand-name { font-size: 1.375rem; text-align: left; }
      .brand-tagline { display: none; }
      .auth-form-panel { padding: 2rem 1.25rem; }
      .tab-btn { font-size: 0.7rem; padding: 0.45rem 0; }
    }
  `],
  template: `
    <div class="auth-shell">

      <aside class="auth-brand">
        <div class="brand-mascot-wrap">
          <div class="brand-mascot-ring"></div>
          @if (activeTab() === 'cliente') {
            <img class="brand-mascot" src="mascote-logo.png" alt="Mascote OS Fácil"
              (error)="$any($event.target).style.display='none'" />
          } @else {
            <img class="brand-mascot" src="mascote.png" alt="Mascote OS Fácil"
              (error)="$any($event.target).style.display='none'" />
          }
        </div>
        <p class="brand-name">OS Fácil</p>
        <p class="brand-tagline">Gestão de ordens de serviço para oficinas modernas</p>
      </aside>

      <div class="auth-form-panel">
        <div class="auth-form-inner">

          @if (activeTab() === 'login') {
            <p class="form-eyebrow">Bem-vindo de volta</p>
            <h1 class="form-title">Acesse sua conta</h1>
            <p class="form-subtitle">Entre com seu e-mail e senha para continuar.</p>
          } @else if (activeTab() === 'cliente') {
            <h1 class="form-title">Criar conta cliente</h1>
            <p class="form-subtitle">Preencha os dados para se registrar no sistema.</p>
          } @else if (activeTab() === 'funcionario') {
            <p class="form-eyebrow">Área Administrativa</p>
            <h1 class="form-title">Novo Funcionário</h1>
            <p class="form-subtitle">Cadastre um funcionário da oficina.</p>
          } @else {
            <p class="form-eyebrow purple">Área Administrativa</p>
            <h1 class="form-title">Novo Administrador</h1>
            <p class="form-subtitle">Cadastre um administrador do sistema.</p>
          }

          <div class="tab-bar">
            <button class="tab-btn" [class.active]="activeTab() === 'login'"
              (click)="setTab('login')" type="button">Entrar</button>
            <button class="tab-btn" [class.active]="activeTab() === 'cliente'"
              (click)="setTab('cliente')" type="button">Cliente</button>
            <button class="tab-btn tab-func" [class.active]="activeTab() === 'funcionario'"
              (click)="setTab('funcionario')" type="button">Funcionário</button>
            <button class="tab-btn tab-admin" [class.active]="activeTab() === 'admin'"
              (click)="setTab('admin')" type="button">Admin</button>
          </div>

          @if (activeTab() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <div class="field">
                <label for="login-email">E-mail</label>
                <input id="login-email" name="login-email" formControlName="email" type="email" placeholder="seu@email.com" autocomplete="email" />
              </div>
              <div class="field">
                <label for="login-senha">Senha</label>
                <input id="login-senha" name="login-senha" formControlName="senha" type="password" placeholder="••••••••" autocomplete="current-password" />
              </div>
              <button class="btn-submit" type="submit" [disabled]="loginForm.invalid">
                Entrar →
              </button>
            </form>
          }

          @if (activeTab() === 'cliente') {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
              <div class="form-grid-2">
                <div class="field">
                  <label for="reg-nome">Nome completo</label>
                  <input id="reg-nome" name="reg-nome" formControlName="nome" placeholder="João Silva" autocomplete="name" />
                </div>
                <div class="field">
                  <label for="reg-cpf">CPF</label>
                  <input id="reg-cpf" name="reg-cpf" formControlName="cpf" inputmode="numeric" maxlength="14"
                    placeholder="000.000.000-00" (input)="onCpfInput('cliente')" />
                </div>
              </div>
              <div class="field">
                <label for="reg-email">E-mail</label>
                <input id="reg-email" name="reg-email" formControlName="email" type="email" placeholder="seu@email.com" autocomplete="email" />
              </div>
              <div class="form-grid-2">
                <div class="field">
                  <label for="reg-telefone">Telefone</label>
                  <input id="reg-telefone" name="reg-telefone" formControlName="telefone" inputmode="numeric" maxlength="12"
                    placeholder="11999999999" (input)="onTelefoneInput('cliente')" />
                </div>
                <div class="field">
                  <label for="reg-endereco">Endereço</label>
                  <input id="reg-endereco" name="reg-endereco" formControlName="endereco" placeholder="Rua, número" />
                </div>
              </div>
              <div class="form-grid-2">
                <div class="field">
                  <label for="reg-senha">Senha</label>
                  <input id="reg-senha" name="reg-senha" formControlName="senha" type="password" placeholder="••••••••" autocomplete="new-password" />
                </div>
                <div class="field">
                  <label for="reg-confirmar">Confirmar senha</label>
                  <input id="reg-confirmar" name="reg-confirmar" formControlName="confirmarSenha" type="password" placeholder="••••••••" autocomplete="new-password" />
                </div>
              </div>
              <button class="btn-submit" type="submit" [disabled]="registerForm.invalid">
                Criar conta →
              </button>
            </form>
          }

          @if (activeTab() === 'funcionario') {
            @if (!authService.isAdmin()) {
              <div class="tab-locked">
                <div class="lock-icon blue">🔒</div>
                <p class="lock-title">Acesso restrito</p>
                <p class="lock-sub">
                  Faça login como <span class="badge-role blue">Administrador</span>
                  para cadastrar novos funcionários.
                </p>
                <button class="btn-submit" style="max-width:220px" type="button" (click)="setTab('login')">
                  Ir para o Login →
                </button>
              </div>
            } @else {
              <form [formGroup]="funcionarioForm" (ngSubmit)="onRegisterFuncionario()">
                <div class="form-grid-2">
                  <div class="field">
                    <label>Nome completo *</label>
                    <input formControlName="nome" placeholder="Maria Souza" />
                  </div>
                  <div class="field">
                    <label>Login (usuário) *</label>
                    <input formControlName="login" placeholder="maria.souza" />
                  </div>
                </div>
                <div class="field">
                  <label>E-mail *</label>
                  <input formControlName="email" type="email" placeholder="maria@oficina.com" />
                </div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>CPF *</label>
                    <input formControlName="cpf" inputmode="numeric" maxlength="14"
                      placeholder="000.000.000-00" (input)="onCpfInput('funcionario')" />
                  </div>
                  <div class="field">
                    <label>Telefone</label>
                    <input formControlName="telefone" inputmode="numeric" maxlength="12"
                      placeholder="11999999999" (input)="onTelefoneInput('funcionario')" />
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>Cargo</label>
                    <input formControlName="cargo" placeholder="Mecânico" />
                  </div>
                  <div class="field">
                    <label>Especialidade</label>
                    <input formControlName="especialidade" placeholder="Motor, Freios…" />
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>Salário (R$) *</label>
                    <input formControlName="salario" type="number" min="0" step="0.01"
                      placeholder="2500.00" />
                  </div>
                  <div class="field"></div>
                </div>
                <div class="section-sep">Acesso ao sistema</div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>Senha *</label>
                    <input formControlName="senha" type="password" placeholder="••••••••" />
                  </div>
                  <div class="field">
                    <label>Confirmar senha *</label>
                    <input formControlName="confirmarSenha" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <button class="btn-submit" type="submit" [disabled]="funcionarioForm.invalid">
                  Cadastrar Funcionário →
                </button>
              </form>
            }
          }

          @if (activeTab() === 'admin') {
            @if (!authService.isAdmin()) {
              <div class="tab-locked">
                <div class="lock-icon purple">🔒</div>
                <p class="lock-title">Acesso restrito</p>
                <p class="lock-sub">
                  Faça login como <span class="badge-role purple">Administrador</span>
                  para cadastrar novos administradores.
                </p>
                <button class="btn-submit purple" style="max-width:220px" type="button" (click)="setTab('login')">
                  Ir para o Login →
                </button>
              </div>
            } @else {
              <form [formGroup]="adminForm" (ngSubmit)="onRegisterAdmin()">
                <div class="form-grid-2">
                  <div class="field">
                    <label>Nome completo *</label>
                    <input formControlName="nome" placeholder="Carlos Admin" />
                  </div>
                  <div class="field">
                    <label>Login (usuário) *</label>
                    <input formControlName="login" placeholder="carlos.admin" />
                  </div>
                </div>
                <div class="field">
                  <label>E-mail *</label>
                  <input formControlName="email" type="email" placeholder="carlos@oficina.com" />
                </div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>CPF *</label>
                    <input formControlName="cpf" inputmode="numeric" maxlength="14"
                      placeholder="000.000.000-00" (input)="onCpfInput('admin')" />
                  </div>
                  <div class="field">
                    <label>Cargo</label>
                    <input formControlName="cargo" placeholder="Gerente" />
                  </div>
                </div>
                <div class="field">
                  <label>Salário (R$) *</label>
                  <input formControlName="salario" type="number" min="0" step="0.01"
                    placeholder="5000.00" />
                </div>
                <div class="section-sep">Acesso ao sistema</div>
                <div class="form-grid-2">
                  <div class="field">
                    <label>Senha *</label>
                    <input formControlName="senha" type="password" placeholder="••••••••" />
                  </div>
                  <div class="field">
                    <label>Confirmar senha *</label>
                    <input formControlName="confirmarSenha" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <button class="btn-submit purple" type="submit" [disabled]="adminForm.invalid">
                  Cadastrar Administrador →
                </button>
              </form>
            }
          }

        </div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly activeTab = signal<TabId>('login');

  setTab(tabId: TabId): void {
    this.activeTab.set(tabId);
  }

  // ── Forms ────────────────────────────────────────────

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  readonly registerForm = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, digitsLengthValidator(11)]],
    telefone: ['', [Validators.required, digitsLengthValidator(10, 11)]],
    endereco: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
  });

  readonly funcionarioForm = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, digitsLengthValidator(11)]],
    login: ['', [Validators.required]],
    salario: [null as number | null, [Validators.required, Validators.min(0)]],
    cargo: [''],
    especialidade: [''],
    telefone: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
  });

  readonly adminForm = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, digitsLengthValidator(11)]],
    login: ['', [Validators.required]],
    salario: [null as number | null, [Validators.required, Validators.min(0)]],
    cargo: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
  });

  // ── Ações ────────────────────────────────────────────

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.authService
      .login(this.loginForm.getRawValue() as { email: string; senha: string })
      .subscribe({
        next: () => {
          this.notification.success('Login realizado com sucesso.');
          const destino = this.authService.isCliente() ? '/ordem-servicos' : '/dashboard';
          this.router.navigate([destino]);
        },
        error: (error) => this.notification.error(parseApiError(error)),
      });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const fv = this.registerForm.getRawValue();
    if ((fv.senha ?? '') !== (fv.confirmarSenha ?? '')) {
      this.notification.error('As senhas nao conferem.');
      return;
    }

    const payload = {
      nome: (fv.nome ?? '').trim(),
      email: (fv.email ?? '').trim().toLowerCase(),
      cpf: (fv.cpf ?? '').replace(/\D/g, ''),
      telefone: (fv.telefone ?? '').replace(/\D/g, ''),
      endereco: (fv.endereco ?? '').trim(),
      senha: fv.senha ?? '',
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.notification.success('Cliente cadastrado com sucesso.');
        this.registerForm.reset();
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.notification.error(
            'Cadastro bloqueado pelo servidor (403). A API de autenticacao esta recusando o endpoint /register.'
          );
          return;
        }
        this.notification.error(parseApiError(error));
      },
    });
  }

  onRegisterFuncionario(): void {
    if (this.funcionarioForm.invalid) return;

    const fv = this.funcionarioForm.getRawValue();
    if ((fv.senha ?? '') !== (fv.confirmarSenha ?? '')) {
      this.notification.error('As senhas nao conferem.');
      return;
    }

    const payload = {
      nome: (fv.nome ?? '').trim(),
      email: (fv.email ?? '').trim().toLowerCase(),
      cpf: (fv.cpf ?? '').replace(/\D/g, ''),
      login: (fv.login ?? '').trim(),
      password: fv.senha ?? '',
      salario: Number(fv.salario ?? 0),
      cargo: fv.cargo?.trim() || undefined,
      especialidade: fv.especialidade?.trim() || undefined,
      telefone: (fv.telefone ?? '').replace(/\D/g, '') || undefined,
    };

    this.authService.registerFuncionario(payload).subscribe({
      next: () => {
        this.notification.success('Funcionario cadastrado com sucesso.');
        this.funcionarioForm.reset();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  onRegisterAdmin(): void {
    if (this.adminForm.invalid) return;

    const fv = this.adminForm.getRawValue();
    if ((fv.senha ?? '') !== (fv.confirmarSenha ?? '')) {
      this.notification.error('As senhas nao conferem.');
      return;
    }

    const payload = {
      nome: (fv.nome ?? '').trim(),
      email: (fv.email ?? '').trim().toLowerCase(),
      cpf: (fv.cpf ?? '').replace(/\D/g, ''),
      login: (fv.login ?? '').trim(),
      password: fv.senha ?? '',
      salario: Number(fv.salario ?? 0),
      cargo: fv.cargo?.trim() || undefined,
    };

    this.authService.registerAdmin(payload).subscribe({
      next: () => {
        this.notification.success('Administrador cadastrado com sucesso.');
        this.adminForm.reset();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  // ── Formatação de campos ─────────────────────────────

  onCpfInput(form: 'cliente' | 'funcionario' | 'admin'): void {
    const formMap = {
      cliente: this.registerForm,
      funcionario: this.funcionarioForm,
      admin: this.adminForm,
    };
    const ctrl = formMap[form].controls.cpf;
    ctrl.setValue(this.formatCpf(ctrl.value ?? ''), { emitEvent: false });
  }

  onTelefoneInput(form: 'cliente' | 'funcionario'): void {
    const formMap = {
      cliente: this.registerForm,
      funcionario: this.funcionarioForm,
    };
    const ctrl = formMap[form].controls.telefone;
    ctrl.setValue(this.formatTelefone(ctrl.value ?? ''), { emitEvent: false });
  }

  private formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  private formatTelefone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{1,4})(\d{0,4})/, (_, ddd, p1, p2) =>
        p2 ? `${ddd}${p1}-${p2}` : `${ddd}${p1}`
      );
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '$1$2-$3');
  }
}
