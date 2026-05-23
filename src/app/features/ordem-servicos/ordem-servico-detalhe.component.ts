import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { ItemProdutoService } from '../../core/services/item-produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { PagamentoService } from '../../core/services/pagamento.service';
import { ProdutoService } from '../../core/services/produto.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import {
  Cliente,
  Funcionario,
  ItemProduto,
  OrdemServico,
  Pagamento,
  Produto,
  Veiculo,
} from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-ordem-servico-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent, CurrencyPipe, DatePipe],
  templateUrl: './ordem-servico-detalhe.component.html',
  styleUrl: './ordem-servico-detalhe.component.scss',
})
export class OrdemServicoDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ordemService = inject(OrdemServicoService);
  private readonly itemService = inject(ItemProdutoService);
  private readonly pagamentoService = inject(PagamentoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly clienteService = inject(ClienteService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);
  readonly auth = inject(AuthService);

  ordemId = Number(this.route.snapshot.paramMap.get('id'));
  ordem?: OrdemServico;
  cliente?: Cliente;
  veiculo?: Veiculo;
  funcionario?: Funcionario;
  produtos: Produto[] = [];
  itens: ItemProduto[] = [];
  pagamentos: Pagamento[] = [];
  historico: { texto: string; hora: Date }[] = [];

  readonly statusOptions = [
    { value: 'ABERTA', label: 'Aberta' },
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  readonly itemForm = this.fb.group({
    produtoId: [null as number | null, Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [0, [Validators.required, Validators.min(0)]],
  });

  readonly pagamentoForm = this.fb.group({
    metodo: ['PIX', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    status: ['PENDENTE', Validators.required],
  });

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    if (!this.ordemId) return;

    if (this.auth.isStaff()) {
      this.produtoService.list().subscribe({ next: (items) => (this.produtos = items) });
      this.itemService.list().subscribe({
        next: (items) =>
          (this.itens = items.filter(
            (i) => Number(i.ordemServicoId ?? i['ordem_servico_id'] ?? 0) === this.ordemId,
          )),
      });
    }

    this.ordemService.getById(this.ordemId).subscribe({
      next: (item) => {
        this.ordem = item;
        this.historico = [
          { texto: `OS criada com status ${item.status ?? 'ABERTA'}`, hora: new Date() },
          { texto: `Descrição: ${item.descricao ?? '—'}`, hora: new Date() },
        ];
        this.loadRelated(item);
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });

    this.pagamentoService
      .listByOrdemServico(this.ordemId)
      .subscribe({ next: (items) => (this.pagamentos = items) });
  }

  private loadRelated(ordem: OrdemServico): void {
    const vid = Number(ordem.veiculoId ?? ordem['veiculo_id'] ?? 0);
    if (vid) this.veiculoService.getById(vid).subscribe({ next: (v) => (this.veiculo = v), error: () => {} });

    if (this.auth.isStaff()) {
      const cid = Number(ordem.clienteId ?? ordem['cliente_id'] ?? 0);
      const fid = Number(ordem.funcionarioId ?? ordem['funcionario_id'] ?? 0);
      if (cid) this.clienteService.getById(cid).subscribe({ next: (c) => (this.cliente = c), error: () => {} });
      if (fid) this.funcionarioService.getById(fid).subscribe({ next: (f) => (this.funcionario = f), error: () => {} });
    }
  }

  quickUpdateStatus(status: string): void {
    if (!this.ordemId || !this.ordem) return;

    const payload = {
      clienteId: Number(this.ordem.clienteId ?? this.ordem['cliente_id'] ?? 0) || null,
      veiculoId: Number(this.ordem.veiculoId ?? this.ordem['veiculo_id'] ?? 0) || null,
      funcionarioId: Number(this.ordem.funcionarioId ?? this.ordem['funcionario_id'] ?? 0) || null,
      descricao: this.ordem.descricao ?? '',
      observacao: this.ordem.observacao ?? '',
      status,
    };

    this.ordemService.update(this.ordemId, payload).subscribe({
      next: (updated) => {
        this.ordem = updated;
        this.historico.unshift({ texto: `Status alterado para ${status}.`, hora: new Date() });
        this.notification.success('Status atualizado com sucesso.');
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  getProdutoNome(id?: number): string {
    return this.produtos.find((p) => p.id === id)?.nome?.toString() ?? '—';
  }

  getProdutoValor(id?: number): number {
    return Number(this.produtos.find((p) => p.id === id)?.preco ?? 0);
  }

  getStatusLabel(status: unknown): string {
    return String(status ?? 'ABERTA');
  }

  getProdutoId(item: ItemProduto): number | undefined {
    return Number(item.produtoId ?? item['produto_id'] ?? 0) || undefined;
  }

  getValorUnitario(item: ItemProduto): number {
    return Number(item.valorUnitario ?? item['valor_unitario'] ?? 0);
  }

  getClienteInicial(): string {
    return (this.cliente?.nome ?? '?')[0].toUpperCase();
  }

  totalItens(): number {
    return this.itens.reduce(
      (acc, i) => acc + (i.quantidade ?? 0) * this.getValorUnitario(i),
      0,
    );
  }

  totalPagamentos(): number {
    return this.pagamentos.reduce((acc, p) => acc + Number(p.valor ?? 0), 0);
  }

  addItem(): void {
    if (this.itemForm.invalid || !this.ordemId) return;

    const payload = { ...this.itemForm.getRawValue(), ordemServicoId: this.ordemId };
    this.itemService.create(payload).subscribe({
      next: () => {
        this.notification.success('Produto adicionado à OS.');
        this.historico.unshift({ texto: 'Produto adicionado à OS.', hora: new Date() });
        this.itemForm.reset({ quantidade: 1, valorUnitario: 0, produtoId: null });
        this.loadAll();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  exportarPdf(): void {
    this.ordemService.exportPdf(this.ordemId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `os-${this.ordemId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notification.error('Erro ao gerar PDF.'),
    });
  }

  addPagamento(): void {
    if (this.pagamentoForm.invalid || !this.ordemId) return;

    const payload = { ...this.pagamentoForm.getRawValue(), ordemServicoId: this.ordemId };
    this.pagamentoService.create(payload).subscribe({
      next: () => {
        this.notification.success('Pagamento registrado.');
        this.historico.unshift({ texto: 'Pagamento registrado na OS.', hora: new Date() });
        this.pagamentoForm.reset({ metodo: 'PIX', valor: 0, status: 'PENDENTE' });
        this.loadAll();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }
}
