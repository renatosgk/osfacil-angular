import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Veiculo } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class VeiculoService extends BaseCrudService<Veiculo> {
  protected override readonly endpoint = 'veiculos';
}
