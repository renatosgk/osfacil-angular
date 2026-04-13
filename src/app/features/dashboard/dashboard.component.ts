import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ClienteService } from '../../core/services/cliente.service';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { ProdutoService } from '../../core/services/produto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2 class="text-2xl font-bold">Painel Geral</h2>
      <p class="mt-1 text-sm text-slate-600">Visao rapida da operacao da oficina.</p>
    </section>

    <section class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      @for (item of cards; track item.label) {
        <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-500">{{ item.label }}</p>
          <strong class="mt-1 block text-3xl text-slate-900">{{ item.value }}</strong>
        </article>
      }
    </section>

    <section class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      @for (entry of statusEntries; track entry.key) {
        <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-500">{{ entry.key }}</p>
          <strong class="mt-1 block text-2xl">{{ entry.value }}</strong>
        </article>
      }
    </section>
  `,
})
export class DashboardComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly ordemService = inject(OrdemServicoService);
  private readonly produtoService = inject(ProdutoService);

  cards = [
    { label: 'Clientes', value: 0 },
    { label: 'Funcionarios', value: 0 },
    { label: 'Produtos', value: 0 },
    { label: 'Ordens de Servico', value: 0 },
  ];

  statusEntries: Array<{ key: string; value: number }> = [];

  constructor() {
    forkJoin({
      clientes: this.clienteService.list(),
      funcionarios: this.funcionarioService.list(),
      produtos: this.produtoService.list(),
      ordens: this.ordemService.list(),
    }).subscribe(({ clientes, funcionarios, produtos, ordens }) => {
      this.cards = [
        { label: 'Clientes', value: clientes.length },
        { label: 'Funcionarios', value: funcionarios.length },
        { label: 'Produtos', value: produtos.length },
        { label: 'Ordens de Servico', value: ordens.length },
      ];

      const statusCount = new Map<string, number>();
      ordens.forEach((ordem) => {
        const key = String(ordem.status ?? 'Aberta');
        statusCount.set(key, (statusCount.get(key) ?? 0) + 1);
      });

      this.statusEntries = Array.from(statusCount.entries()).map(([key, value]) => ({
        key,
        value,
      }));
    });
  }
}
