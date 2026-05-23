import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { parseApiError } from '../../shared/utils/http-error.util';

function senhaConfirmadaValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const senha = group.get('password')?.value ?? '';
    const confirmar = group.get('confirmarSenha')?.value ?? '';
    return senha && confirmar && senha !== confirmar ? { senhasDivergentes: true } : null;
  };
}

@Component({
  selector: 'app-registro-funcionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [`
    .registro-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .registro-card {
      background: #fff;
      border-radius: 20px;
      width: 100%;
      max-width: 680px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.35);
      overflow: hidden;
    }
    .card-banner {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      padding: 2rem 2rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .banner-mascot {
      width: 72px;
      height: 72px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
      flex-shrink: 0;
    }
    .banner-text h1 {
      color: #fff;
      font-size: 1.375rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
    }
    .banner-text p {
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      margin: 0;
    }
    .card-body {
      padding: 2rem;
    }
    .section-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin: 0 0 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .field.wide { grid-column: 1 / -1; }
    .field label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #374151;
    }
    .field label span.req { color: #ef4444; margin-left: 2px; }
    .field input {
      padding: 0.625rem 0.875rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      color: #1e293b;
      background: #f8fafc;
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }
    .field input:focus {
      border-color: #2563eb;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .field input.invalid {
      border-color: #ef4444;
      background: #fff5f5;
    }
    .field-error {
      font-size: 0.75rem;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .hint {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .form-actions {
      display: flex;
      gap: 0.875rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn-primary {
      padding: 0.6875rem 1.5rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-ghost {
      padding: 0.6875rem 1.25rem;
      background: transparent;
      color: #64748b;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
    }
    .btn-ghost:hover { background: #f8fafc; color: #334155; }
    .alert {
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      margin-bottom: 1.25rem;
    }
    .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .alert-error { background: #fff5f5; color: #991b1b; border: 1px solid #fecaca; }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .card-body { padding: 1.25rem; }
      .card-banner { padding: 1.25rem; }
      .banner-mascot { width: 52px; height: 52px; }
    }
  `],
  template: `
    <div class="registro-page">
      <div class="registro-card">

        <div class="card-banner">
          <img
            class="banner-mascot"
            src="mascote.png"
            alt="Mascote OS Fácil"
            (error)="$any($event.target).style.display='none'"
          />
          <div class="banner-text">
            <h1>Cadastro de Funcionário</h1>
            <p>Preencha os dados para criar o acesso do funcionário</p>
          </div>
        </div>

        <div class="card-body">

          @if (successMsg()) {
            <div class="alert alert-success">
              <span>✓</span>
              <span>{{ successMsg() }}</span>
            </div>
          }

          @if (errorMsg()) {
            <div class="alert alert-error">
              <span>✕</span>
              <span>{{ errorMsg() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()">

            <!-- Dados Pessoais -->
            <p class="section-label">Dados Pessoais</p>
            <div class="form-grid">
              <div class="field">
                <label>Nome completo <span class="req">*</span></label>
                <input
                  type="text"
                  formControlName="nome"
                  placeholder="Ex.: João da Silva"
                  [class.invalid]="isInvalid('nome')"
                />
                @if (isInvalid('nome')) {
                  <span class="field-error">Campo obrigatório</span>
                }
              </div>
              <div class="field">
                <label>CPF <span class="req">*</span></label>
                <input
                  type="text"
                  formControlName="cpf"
                  placeholder="000.000.000-00"
                  maxlength="14"
                  [class.invalid]="isInvalid('cpf')"
                />
                @if (isInvalid('cpf')) {
                  <span class="field-error">CPF inválido (mín. 11 dígitos)</span>
                }
              </div>
              <div class="field">
                <label>E-mail <span class="req">*</span></label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="funcionario@osfacil.com"
                  [class.invalid]="isInvalid('email')"
                />
                @if (isInvalid('email')) {
                  <span class="field-error">E-mail inválido</span>
                }
              </div>
              <div class="field">
                <label>Telefone</label>
                <input
                  type="tel"
                  formControlName="telefone"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <!-- Acesso ao sistema -->
            <p class="section-label">Acesso ao Sistema</p>
            <div class="form-grid">
              <div class="field">
                <label>Login <span class="req">*</span></label>
                <input
                  type="text"
                  formControlName="login"
                  placeholder="usuario.login"
                  [class.invalid]="isInvalid('login')"
                />
                @if (isInvalid('login')) {
                  <span class="field-error">Campo obrigatório</span>
                }
              </div>
              <div class="field">
                <label>Salário <span class="req">*</span></label>
                <input
                  type="number"
                  formControlName="salario"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  [class.invalid]="isInvalid('salario')"
                />
                @if (isInvalid('salario')) {
                  <span class="field-error">Salário inválido</span>
                }
              </div>
              <div class="field">
                <label>Senha <span class="req">*</span></label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  [class.invalid]="isInvalid('password')"
                />
                @if (isInvalid('password')) {
                  <span class="field-error">Mínimo 6 caracteres</span>
                }
              </div>
              <div class="field">
                <label>Confirmar senha <span class="req">*</span></label>
                <input
                  type="password"
                  formControlName="confirmarSenha"
                  placeholder="Repita a senha"
                  [class.invalid]="isInvalidConfirmacao()"
                />
                @if (isInvalidConfirmacao()) {
                  <span class="field-error">As senhas não coincidem</span>
                }
              </div>
            </div>

            <!-- Cargo e Especialidade -->
            <p class="section-label">Cargo & Especialidade</p>
            <div class="form-grid">
              <div class="field">
                <label>Cargo / Função</label>
                <input
                  type="text"
                  formControlName="cargo"
                  placeholder="Ex.: Mecânico, Eletricista"
                />
              </div>
              <div class="field">
                <label>Especialidade</label>
                <input
                  type="text"
                  formControlName="especialidade"
                  placeholder="Ex.: Motor, Suspensão, Elétrica"
                />
              </div>
            </div>

            <div class="form-actions">
              <a routerLink="/funcionarios" class="btn-ghost">Cancelar</a>
              <button type="submit" class="btn-primary" [disabled]="loading()">
                @if (loading()) {
                  <span class="spinner"></span> Cadastrando...
                } @else {
                  Cadastrar Funcionário
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegistroFuncionarioComponent {
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      login: ['', Validators.required],
      salario: [null as number | null, [Validators.required, Validators.min(0)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required],
      cargo: [''],
      especialidade: [''],
    },
    { validators: senhaConfirmadaValidator() }
  );

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl?.dirty || ctrl?.touched));
  }

  isInvalidConfirmacao(): boolean {
    const ctrl = this.form.get('confirmarSenha');
    const mismatch = this.form.hasError('senhasDivergentes');
    return !!((ctrl?.dirty || ctrl?.touched) && (ctrl?.invalid || mismatch));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.loading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    this.authService
      .registerFuncionario({
        nome: v.nome!,
        email: v.email!,
        cpf: v.cpf!.replace(/\D/g, ''),
        login: v.login!,
        password: v.password!,
        salario: v.salario ?? 0,
        cargo: v.cargo || undefined,
        especialidade: v.especialidade || undefined,
        telefone: v.telefone || undefined,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMsg.set('Funcionário cadastrado com sucesso!');
          this.form.reset();
          setTimeout(() => this.router.navigate(['/funcionarios']), 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(parseApiError(err));
        },
      });
  }
}
