import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { FuncionarioService } from '../../core/services/funcionario.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Cliente, Funcionario, OrdemServico, Veiculo } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-ordem-servicos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './ordem-servicos.component.html',
  styleUrl: './ordem-servicos.component.scss',
})
export class OrdemServicosComponent {
  private readonly service = inject(OrdemServicoService);
  private readonly clienteService = inject(ClienteService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);
  readonly auth = inject(AuthService);

  ordens: OrdemServico[] = [];
  filteredOrdens: OrdemServico[] = [];
  clientes: Cliente[] = [];
  veiculos: Veiculo[] = [];
  funcionarios: Funcionario[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    veiculoId: [null as number | null],
    funcionarioId: [null as number | null],
    descricao: ['', Validators.required],
    statusOrdemServico: ['ABERTA', Validators.required],
    statusPagamento: ['PENDENTE', Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    observacao: [''],
  });

  readonly filtroForm = this.fb.group({
    status: [''],
    cliente: [''],
  });

  constructor() {
    this.loadAll();
    this.filtroForm.valueChanges.subscribe(() => this.applyFilter());
  }

  private loadAll(): void {
    this.load();
    if (this.auth.isStaff()) {
      this.clienteService.list().subscribe({ next: (items) => (this.clientes = items) });
      this.funcionarioService.list().subscribe({ next: (items) => (this.funcionarios = items) });
    } else {
      this.form.controls.clienteId.clearValidators();
      this.form.controls.clienteId.updateValueAndValidity();
    }
    this.veiculoService.list().subscribe({ next: (items) => (this.veiculos = items) });
  }

  load(): void {
    const request$ = this.auth.isStaff()
      ? this.service.list()
      : this.service.listMinhas();

    request$.subscribe({
      next: (items) => {
        this.ordens = items;
        this.applyFilter();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  applyFilter(): void {
    const status = String(this.filtroForm.value.status ?? '').toLowerCase();
    const clienteBusca = String(this.filtroForm.value.cliente ?? '').toLowerCase();

    this.filteredOrdens = this.ordens.filter((ordem) => {
      const ordemStatus = String(ordem.statusOrdemServico ?? ordem.status ?? '').toLowerCase();
      const clienteNome = (
        ordem.nomeCliente ?? this.getClienteNome(Number(ordem.clienteId ?? ordem['cliente_id'] ?? 0))
      ).toLowerCase();

      const statusMatches = !status || ordemStatus.includes(status);
      const clienteMatches = !clienteBusca || clienteNome.includes(clienteBusca);
      return statusMatches && clienteMatches;
    });
  }

  getClienteNome(id?: number): string {
    if (!id) return '-';
    return this.clientes.find((cliente) => cliente.id === id)?.nome?.toString() ?? '-';
  }

  getVeiculoDesc(id?: number): string {
    if (!id) return '-';
    const veiculo = this.veiculos.find((item) => item.id === id);
    if (!veiculo) return '-';
    return `${veiculo.marca ?? ''} ${veiculo.modelo ?? ''} - ${veiculo.placa ?? ''}`.trim();
  }

  getStatusLabel(item: OrdemServico): string {
    return String(item.statusOrdemServico ?? item.status ?? 'ABERTA');
  }

  getClienteId(item: OrdemServico): number | undefined {
    return Number(item.clienteId ?? item['cliente_id'] ?? 0) || undefined;
  }

  getVeiculoId(item: OrdemServico): number | undefined {
    return Number(item.veiculoId ?? item['veiculo_id'] ?? 0) || undefined;
  }

  edit(item: OrdemServico): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      clienteId: Number(item.clienteId ?? item['cliente_id'] ?? 0),
      veiculoId: Number(item.veiculoId ?? item['veiculo_id'] ?? 0) || null,
      funcionarioId: Number(item.funcionarioId ?? item['funcionario_id'] ?? 0) || null,
      descricao: String(item.descricao ?? ''),
      statusOrdemServico: String(item.statusOrdemServico ?? item.status ?? 'ABERTA'),
      statusPagamento: String(item.statusPagamento ?? 'PENDENTE'),
      valor: item.valor ?? null,
      observacao: String(item.observacao ?? ''),
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      clienteId: raw.clienteId,
      statusOrdemServico: raw.statusOrdemServico,
      descricao: raw.descricao,
      statusPagamento: raw.statusPagamento,
      valor: raw.valor,
    };
    if (raw.funcionarioId != null) {
      payload['funcionarioId'] = raw.funcionarioId;
    }
    const request = this.editingId
      ? this.service.update(this.editingId, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.notification.success(
          `Ordem de servico ${this.editingId ? 'atualizada' : 'criada'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: OrdemServico): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Ordem de servico removida com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      statusOrdemServico: 'ABERTA',
      statusPagamento: 'PENDENTE',
      clienteId: null,
      veiculoId: null,
      funcionarioId: null,
      valor: null,
      observacao: '',
    });
  }
}
