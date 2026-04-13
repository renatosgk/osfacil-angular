import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ItemProdutoService } from '../../core/services/item-produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { PagamentoService } from '../../core/services/pagamento.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ItemProduto, OrdemServico, Pagamento, Produto } from '../../shared/interfaces/entities';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-ordem-servico-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './ordem-servico-detalhe.component.html',
  styleUrl: './ordem-servico-detalhe.component.scss',
})
export class OrdemServicoDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ordemService = inject(OrdemServicoService);
  private readonly itemService = inject(ItemProdutoService);
  private readonly pagamentoService = inject(PagamentoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  ordemId = Number(this.route.snapshot.paramMap.get('id'));
  ordem?: OrdemServico;
  produtos: Produto[] = [];
  itens: ItemProduto[] = [];
  pagamentos: Pagamento[] = [];
  historico: string[] = [];

  readonly itemForm = this.fb.group({
    produtoId: [null as number | null, Validators.required],
    quantidade: [1, Validators.required],
    valorUnitario: [0, Validators.required],
  });

  readonly pagamentoForm = this.fb.group({
    metodo: ['PIX', Validators.required],
    valor: [0, Validators.required],
    status: ['PENDENTE', Validators.required],
  });

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    if (!this.ordemId) return;

    this.produtoService.list().subscribe({ next: (items) => (this.produtos = items) });
    this.ordemService.getById(this.ordemId).subscribe({
      next: (item) => {
        this.ordem = item;
        this.historico = [
          `OS criada com status ${item.status ?? 'ABERTA'}`,
          `Descricao registrada: ${item.descricao ?? '-'}`,
        ];
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });

    this.itemService.list().subscribe({
      next: (items) => {
        this.itens = items.filter(
          (item) => Number(item.ordemServicoId ?? item['ordem_servico_id'] ?? 0) === this.ordemId,
        );
      },
    });

    this.pagamentoService
      .listByOrdemServico(this.ordemId)
      .subscribe({ next: (items) => (this.pagamentos = items) });
  }

  getProdutoNome(id?: number): string {
    return this.produtos.find((item) => item.id === id)?.nome?.toString() ?? '-';
  }

  getStatusLabel(status: unknown): string {
    return String(status ?? 'ABERTA');
  }

  getProdutoId(item: ItemProduto): number | undefined {
    return Number(item.produtoId ?? item['produto_id'] ?? 0) || undefined;
  }

  addItem(): void {
    if (this.itemForm.invalid || !this.ordemId) return;

    const payload = {
      ...this.itemForm.getRawValue(),
      ordemServicoId: this.ordemId,
    };

    this.itemService.create(payload).subscribe({
      next: () => {
        this.notification.success('Item adicionado na OS com sucesso.');
        this.historico.unshift('Item de produto adicionado.');
        this.itemForm.reset({ quantidade: 1, valorUnitario: 0, produtoId: null });
        this.loadAll();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  addPagamento(): void {
    if (this.pagamentoForm.invalid || !this.ordemId) return;

    const payload = {
      ...this.pagamentoForm.getRawValue(),
      ordemServicoId: this.ordemId,
    };

    this.pagamentoService.create(payload).subscribe({
      next: () => {
        this.notification.success('Pagamento registrado com sucesso.');
        this.historico.unshift('Pagamento registrado na OS.');
        this.pagamentoForm.reset({ metodo: 'PIX', valor: 0, status: 'PENDENTE' });
        this.loadAll();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }
}
