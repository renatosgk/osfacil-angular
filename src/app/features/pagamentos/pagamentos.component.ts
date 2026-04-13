import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { PagamentoService } from '../../core/services/pagamento.service';
import { OrdemServico, Pagamento } from '../../shared/interfaces/entities';
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
  private readonly ordemService = inject(OrdemServicoService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  pagamentos: Pagamento[] = [];
  ordens: OrdemServico[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    ordemServicoId: [null as number | null, Validators.required],
    metodo: ['PIX', Validators.required],
    valor: [0, Validators.required],
    status: ['PENDENTE', Validators.required],
    dataPagamento: [''],
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.load();
    this.ordemService.list().subscribe({ next: (items) => (this.ordens = items) });
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
      ordemServicoId: Number(item.ordemServicoId ?? item['ordem_servico_id'] ?? 0),
      metodo: String(item.metodo ?? 'PIX'),
      valor: Number(item.valor ?? 0),
      status: String(item.status ?? 'PENDENTE'),
      dataPagamento: String(item.dataPagamento ?? item['data_pagamento'] ?? ''),
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
    this.form.reset({
      ordemServicoId: null,
      metodo: 'PIX',
      valor: 0,
      status: 'PENDENTE',
      dataPagamento: '',
    });
  }
}
