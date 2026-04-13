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

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="grid min-h-dvh place-items-center bg-gradient-to-br from-amber-100 via-sky-50 to-cyan-100 p-6"
    >
      <section
        class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl"
      >
        <h1 class="text-3xl font-bold text-slate-900">OS Facil</h1>
        <p class="mt-1 text-sm text-slate-600">Gestao de ordens de servico para oficinas.</p>

        <div class="mt-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
          @for (tab of tabs; track tab.id) {
            <button
              class="rounded-md px-3 py-1.5 transition"
              [class.bg-white]="activeTab() === tab.id"
              [class.font-semibold]="activeTab() === tab.id"
              [class.text-slate-900]="activeTab() === tab.id"
              [class.text-slate-600]="activeTab() !== tab.id"
              (click)="setTab(tab.id)"
              type="button"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        @if (activeTab() === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="mt-5 grid gap-3">
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Email</span>
              <input class="input" formControlName="email" type="email" />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Senha</span>
              <input class="input" formControlName="senha" type="password" />
            </label>
            <button class="btn-primary mt-2" type="submit" [disabled]="loginForm.invalid">
              Entrar
            </button>
          </form>
        }

        @if (activeTab() === 'cliente') {
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="mt-5 grid gap-3">
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Nome</span>
              <input class="input" formControlName="nome" />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Email</span>
              <input class="input" formControlName="email" type="email" />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">CPF</span>
              <input
                class="input"
                formControlName="cpf"
                inputmode="numeric"
                maxlength="14"
                (input)="onCpfInput()"
              />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Telefone</span>
              <input
                class="input"
                formControlName="telefone"
                inputmode="numeric"
                maxlength="12"
                (input)="onTelefoneInput()"
              />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Endereco</span>
              <input class="input" formControlName="endereco" />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Senha</span>
              <input class="input" formControlName="senha" type="password" />
            </label>
            <label class="grid gap-1">
              <span class="text-sm text-slate-700">Confirmar senha</span>
              <input class="input" formControlName="confirmarSenha" type="password" />
            </label>
            <button class="btn-primary mt-2" type="submit" [disabled]="registerForm.invalid">
              Cadastrar cliente
            </button>
          </form>
        }

      </section>
    </div>
  `,
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  readonly activeTab = signal<'login' | 'cliente'>('login');
  readonly tabs = [
    { id: 'login', label: 'Entrar' },
    { id: 'cliente', label: 'Cadastrar Cliente' },
  ];

  setTab(tabId: string): void {
    this.activeTab.set(tabId as 'login' | 'cliente');
  }

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

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.authService
      .login(this.loginForm.getRawValue() as { email: string; senha: string })
      .subscribe({
        next: () => {
          this.notification.success('Login realizado com sucesso.');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => this.notification.error(parseApiError(error)),
      });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.getRawValue();
    if ((formValue.senha ?? '') !== (formValue.confirmarSenha ?? '')) {
      this.notification.error('As senhas nao conferem.');
      return;
    }

    const payload = {
      nome: (formValue.nome ?? '').trim(),
      email: (formValue.email ?? '').trim().toLowerCase(),
      cpf: (formValue.cpf ?? '').replace(/\D/g, ''),
      telefone: (formValue.telefone ?? '').replace(/\D/g, ''),
      endereco: (formValue.endereco ?? '').trim(),
      senha: formValue.senha ?? '',
    };

    this.authService
      .register(payload)
      .subscribe({
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

  onCpfInput(): void {
    const value = this.registerForm.controls.cpf.value ?? '';
    this.registerForm.controls.cpf.setValue(this.formatCpf(value), { emitEvent: false });
  }

  onTelefoneInput(): void {
    const value = this.registerForm.controls.telefone.value ?? '';
    this.registerForm.controls.telefone.setValue(this.formatTelefone(value), { emitEvent: false });
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
      return digits.replace(/(\d{2})(\d{1,4})(\d{0,4})/, (_, ddd, parte1, parte2) =>
        parte2 ? `${ddd}${parte1}-${parte2}` : `${ddd}${parte1}`
      );
    }

    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '$1$2-$3');
  }

}
