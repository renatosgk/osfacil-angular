import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Cliente } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class ClienteService extends BaseCrudService<Cliente> {
  protected override readonly endpoint = 'clientes';
}
