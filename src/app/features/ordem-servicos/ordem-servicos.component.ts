import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent],
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

  ordens: OrdemServico[] = [];
  filteredOrdens: OrdemServico[] = [];
  clientes: Cliente[] = [];
  veiculos: Veiculo[] = [];
  funcionarios: Funcionario[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    veiculoId: [null as number | null, Validators.required],
    funcionarioId: [null as number | null, Validators.required],
    descricao: ['', Validators.required],
    status: ['ABERTA', Validators.required],
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
    this.clienteService.list().subscribe({ next: (items) => (this.clientes = items) });
    this.veiculoService.list().subscribe({ next: (items) => (this.veiculos = items) });
    this.funcionarioService.list().subscribe({ next: (items) => (this.funcionarios = items) });
  }

  load(): void {
    this.service.list().subscribe({
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
      const ordemStatus = String(ordem.status ?? '').toLowerCase();
      const clienteNome = this.getClienteNome(
        Number(ordem.clienteId ?? ordem['cliente_id'] ?? 0),
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

  getStatusLabel(status: unknown): string {
    return String(status ?? 'ABERTA');
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
      veiculoId: Number(item.veiculoId ?? item['veiculo_id'] ?? 0),
      funcionarioId: Number(item.funcionarioId ?? item['funcionario_id'] ?? 0),
      descricao: String(item.descricao ?? ''),
      status: String(item.status ?? 'ABERTA'),
      observacao: String(item.observacao ?? ''),
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
    this.form.reset({ status: 'ABERTA', clienteId: null, veiculoId: null, funcionarioId: null });
  }
}
