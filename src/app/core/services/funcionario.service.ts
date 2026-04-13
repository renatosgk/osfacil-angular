import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Funcionario } from '../../shared/interfaces/entities';

@Injectable({ providedIn: 'root' })
export class FuncionarioService extends BaseCrudService<Funcionario> {
  protected override readonly endpoint = 'funcionarios';
}
