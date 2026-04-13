import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cliente } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class ClientesComponent {
  private readonly service = inject(ClienteService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    documento: [''],
    endereco: [''],
  });

  readonly searchForm = this.fb.group({
    termo: [''],
  });

  constructor() {
    this.load();
    this.searchForm.valueChanges.subscribe(() => this.applyFilter());
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => {
        this.clientes = items;
        this.applyFilter();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  applyFilter(): void {
    const termo = (this.searchForm.value.termo ?? '').toLowerCase();
    this.filteredClientes = this.clientes.filter((item) => {
      const nome = String(item.nome ?? '').toLowerCase();
      const email = String(item.email ?? '').toLowerCase();
      return nome.includes(termo) || email.includes(termo);
    });
  }

  edit(item: Cliente): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      nome: String(item.nome ?? ''),
      email: String(item.email ?? ''),
      telefone: String(item.telefone ?? ''),
      documento: String(item.documento ?? ''),
      endereco: String(item.endereco ?? ''),
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
          `Cliente ${this.editingId ? 'atualizado' : 'criado'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: Cliente): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Cliente removido com sucesso.');
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
