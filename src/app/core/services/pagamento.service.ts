import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Pagamento } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class PagamentoService extends BaseCrudService<Pagamento> {
  protected override readonly endpoint = 'pagamentos';

  listByOrdemServico(_ordemServicoId: number) {
    return this.list();
  }
}
