import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdemServico } from '../../shared/interfaces/entities';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService extends BaseCrudService<OrdemServico> {
  protected override readonly endpoint = 'ordem-servicos';

  exportPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/ordem-servicos/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  listMinhas(): Observable<OrdemServico[]> {
    return this.http.get<any>(`${this.baseUrl}/ordem-servicos/minhas`).pipe(
      map((r) => {
        if (Array.isArray(r)) return r as OrdemServico[];
        if (r?._embedded) {
          const key = Object.keys(r._embedded)[0];
          const value = r._embedded[key];
          return (Array.isArray(value) ? value : []) as OrdemServico[];
        }
        if (r?.content && Array.isArray(r.content)) return r.content as OrdemServico[];
        return [];
      })
    );
  }
}
