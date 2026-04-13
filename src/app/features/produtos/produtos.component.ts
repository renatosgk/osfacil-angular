import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { ProdutoService } from '../../core/services/produto.service';
import { Produto } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})
export class ProdutosComponent {
  private readonly service = inject(ProdutoService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  produtos: Produto[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    descricao: [''],
    valor: [0, Validators.required],
    estoque: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => (this.produtos = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  edit(item: Produto): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      nome: String(item.nome ?? ''),
      descricao: String(item.descricao ?? ''),
      valor: Number(item.valor ?? 0),
      estoque: Number(item.estoque ?? 0),
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
          `Produto ${this.editingId ? 'atualizado' : 'criado'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: Produto): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Produto removido com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ valor: 0, estoque: 0 });
  }
}
