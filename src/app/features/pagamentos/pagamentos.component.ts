import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { PagamentoService } from '../../core/services/pagamento.service';
import { Pagamento } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagamentos.component.html',
  styleUrl: './pagamentos.component.scss',
})
export class PagamentosComponent {
  private readonly service = inject(PagamentoService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);
  readonly auth = inject(AuthService);

  pagamentos: Pagamento[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    formaPagamento: ['PIX', Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => (this.pagamentos = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  edit(item: Pagamento): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      formaPagamento: String(item.formaPagamento ?? 'PIX'),
      valor: item.valor ?? null,
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
          `Pagamento ${this.editingId ? 'atualizado' : 'registrado'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: Pagamento): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Pagamento removido com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ formaPagamento: 'PIX', valor: null });
  }
}
