import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemProdutoService } from '../../core/services/item-produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ItemProduto, OrdemServico, Produto } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-item-produtos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-produtos.component.html',
  styleUrl: './item-produtos.component.scss',
})
export class ItemProdutosComponent {
  private readonly service = inject(ItemProdutoService);
  private readonly ordemService = inject(OrdemServicoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  itens: ItemProduto[] = [];
  ordens: OrdemServico[] = [];
  produtos: Produto[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    ordemServicoId: [null as number | null, Validators.required],
    produtoId: [null as number | null, Validators.required],
    quantidade: [1, Validators.required],
    valorUnitario: [0, Validators.required],
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.load();
    this.ordemService.list().subscribe({ next: (items) => (this.ordens = items) });
    this.produtoService.list().subscribe({ next: (items) => (this.produtos = items) });
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => (this.itens = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  edit(item: ItemProduto): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      ordemServicoId: Number(item.ordemServicoId ?? item['ordem_servico_id'] ?? 0),
      produtoId: Number(item.produtoId ?? item['produto_id'] ?? 0),
      quantidade: Number(item.quantidade ?? 1),
      valorUnitario: Number(item.valorUnitario ?? item['valor_unitario'] ?? 0),
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
        this.notification.success(`Item ${this.editingId ? 'atualizado' : 'criado'} com sucesso.`);
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: ItemProduto): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Item removido com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  getProdutoNome(id?: number): string {
    return this.produtos.find((item) => item.id === id)?.nome?.toString() ?? '-';
  }

  getProdutoId(item: ItemProduto): number | undefined {
    return Number(item.produtoId ?? item['produto_id'] ?? 0) || undefined;
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ quantidade: 1, valorUnitario: 0, ordemServicoId: null, produtoId: null });
  }
}
