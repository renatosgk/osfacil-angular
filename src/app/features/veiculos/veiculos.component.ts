import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { NotificationService } from '../../core/services/notification.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { Cliente, Veiculo } from '../../shared/interfaces/entities';
import { parseApiError } from '../../shared/utils/http-error.util';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './veiculos.component.html',
  styleUrl: './veiculos.component.scss',
})
export class VeiculosComponent {
  private readonly service = inject(VeiculoService);
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  veiculos: Veiculo[] = [];
  clientes: Cliente[] = [];
  editingId: number | null = null;

  readonly form = this.fb.group({
    placa: ['', Validators.required],
    modelo: ['', Validators.required],
    marca: [''],
    ano: [2026],
    clienteId: [null as number | null, Validators.required],
  });

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.load();
    this.clienteService.list().subscribe({
      next: (items) => (this.clientes = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  load(): void {
    this.service.list().subscribe({
      next: (items) => (this.veiculos = items),
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  getClienteNome(id?: number): string {
    if (!id) return '-';
    return this.clientes.find((cliente) => cliente.id === id)?.nome?.toString() ?? '-';
  }

  getClienteId(item: Veiculo): number | undefined {
    return Number(item.clienteId ?? item['cliente_id'] ?? 0) || undefined;
  }

  edit(item: Veiculo): void {
    this.editingId = item.id ?? null;
    this.form.patchValue({
      placa: String(item.placa ?? ''),
      modelo: String(item.modelo ?? ''),
      marca: String(item.marca ?? ''),
      ano: Number(item.ano ?? 2026),
      clienteId: Number(item.clienteId ?? item['cliente_id'] ?? 0),
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
          `Veiculo ${this.editingId ? 'atualizado' : 'criado'} com sucesso.`,
        );
        this.resetForm();
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  remove(item: Veiculo): void {
    if (!item.id) return;

    this.service.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Veiculo removido com sucesso.');
        this.load();
      },
      error: (error) => this.notification.error(parseApiError(error)),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ ano: 2026, clienteId: null });
  }
}
