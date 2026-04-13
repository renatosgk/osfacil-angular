import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { Pagamento } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class PagamentoService extends BaseCrudService<Pagamento> {
  protected override readonly endpoint = 'pagamentos';

  listByOrdemServico(ordemServicoId: number) {
    return this.list().pipe(
      map((items) =>
        items.filter((pagamento) => {
          const fk = pagamento.ordemServicoId ?? pagamento['ordem_servico_id'];
          return Number(fk) === ordemServicoId;
        })
      )
    );
  }
}
