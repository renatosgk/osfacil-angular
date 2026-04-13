import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { NotificationService } from '../../core/services/notification.service';
import { Funcionario } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.scss',
})
export class FuncionariosComponent {
  private readonly service = inject(FuncionarioService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  funcionarios: Funcionario[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    cargo: [''],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => (this.funcionarios = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  edit(item: Funcionario): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      nome: String(item.nome ?? ''),
      email: String(item.email ?? ''),
      telefone: String(item.telefone ?? ''),
      cargo: String(item.cargo ?? ''),
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    const request = this.editingId
      ? this.service.update(this.editingId, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.notification.success(
          `Funcionario ${this.editingId ? 'atualizado' : 'criado'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: Funcionario): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Funcionario removido com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset();
  }
}
