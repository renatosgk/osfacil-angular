import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { ItemProduto } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class ItemProdutoService extends BaseCrudService<ItemProduto> {
  protected override readonly endpoint = 'item-produtos';
}
