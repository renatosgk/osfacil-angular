import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { OrdemServico } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService extends BaseCrudService<OrdemServico> {
  protected override readonly endpoint = 'ordem-servicos';
}
