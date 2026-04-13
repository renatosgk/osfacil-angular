export interface ApiEntity {
  id?: number;
}

export type OrdemServicoStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
export type PagamentoStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type PagamentoMetodo = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';

export interface Cliente extends ApiEntity {
  nome?: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
}

export interface Funcionario extends ApiEntity {
  nome?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
}

export interface Veiculo extends ApiEntity {
  placa?: string;
  modelo?: string;
  marca?: string;
  ano?: number;
  clienteId?: number;
  cliente_id?: number;
}

export interface OrdemServico extends ApiEntity {
  clienteId?: number;
  veiculoId?: number;
  funcionarioId?: number;
  cliente_id?: number;
  veiculo_id?: number;
  funcionario_id?: number;
  descricao?: string;
  status?: OrdemServicoStatus | string;
  observacao?: string;
  valorTotal?: number;
  valor_total?: number;
}

export interface Produto extends ApiEntity {
  nome?: string;
  descricao?: string;
  valor?: number;
  estoque?: number;
}

export interface ItemProduto extends ApiEntity {
  ordemServicoId?: number;
  produtoId?: number;
  ordem_servico_id?: number;
  produto_id?: number;
  quantidade?: number;
  valorUnitario?: number;
  valor_unitario?: number;
}

export interface Pagamento extends ApiEntity {
  ordemServicoId?: number;
  ordem_servico_id?: number;
  metodo?: PagamentoMetodo | string;
  valor?: number;
  status?: PagamentoStatus | string;
  dataPagamento?: string;
  data_pagamento?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario?: {
    id?: number;
    nome?: string;
    email?: string;
    perfil?: string;
  };
}
