import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Produto } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class ProdutoService extends BaseCrudService<Produto> {
  protected override readonly endpoint = 'produtos';
}
