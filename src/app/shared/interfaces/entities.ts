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
  cpf?: string;
  documento?: string;
  endereco?: string;
}

export interface Funcionario extends ApiEntity {
  nome?: string;
  email?: string;
  cpf?: string;
  login?: string;
  role?: string;
  salario?: number;
  telefone?: string;
  cargo?: string;
  especialidade?: string;
}

export interface Veiculo extends ApiEntity {
  placa?: string;
  modelo?: string;
  marca?: string;
  cor?: string;
  ano?: number;
  clienteId?: number;
  cliente_id?: number;
}

export interface OrdemServico extends ApiEntity {
  clienteId?: number;
  nomeCliente?: string;
  veiculoId?: number;
  funcionarioId?: number;
  cliente_id?: number;
  veiculo_id?: number;
  funcionario_id?: number;
  descricao?: string;
  status?: OrdemServicoStatus | string;
  statusOrdemServico?: OrdemServicoStatus | string;
  statusPagamento?: PagamentoStatus | string;
  observacao?: string;
  valor?: number;
  valorTotal?: number;
  valor_total?: number;
}

export interface Produto extends ApiEntity {
  nome?: string;
  preco?: number;
  quantidade?: number;
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
  valor?: number;
  formaPagamento?: string;
  clienteId?: number;
  nomeCliente?: string;
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

export interface RegisterFuncionarioPayload {
  nome: string;
  email: string;
  cpf: string;
  login: string;
  password: string;
  salario: number;
  cargo?: string;
  especialidade?: string;
  telefone?: string;
}

export interface RegisterAdminPayload {
  nome: string;
  email: string;
  cpf: string;
  login: string;
  password: string;
  salario: number;
  cargo?: string;
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
