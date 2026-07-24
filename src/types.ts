export interface Student {
  id: string;
  nome: string;
  nascimento: string; // YYYY-MM-DD
  dataEntrada: string; // YYYY-MM-DD
  observacoes: string;
  status: 'ativo' | 'inativo';
}

export interface Guardian {
  id: string;
  alunoId: string;
  nome: string;
  parentesco: string; // e.g. Mãe, Pai, Tio, Avó, etc.
  contato: string;
  financeiro: boolean; // Marks who is responsible for payments
}

export interface RegularClass {
  id: string;
  nome: string;
  natureza: 'Infantil' | 'Fundamental';
  idadeRef: number;
  valorMensal: number;
  ano?: number;
}

export type ContraturnoNature = 'Melaço' | 'Marmelada';
export type ContraturnoPeriod = 'Parcial' | 'Completo';

export interface ContraturnoSegment {
  id: string;
  alunoId: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string | null; // null means active/ongoing
  natureza: ContraturnoNature; // 'Melaço' (up to 4 years old) or 'Marmelada' (5+ years old)
  diasSemana: ('Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex')[];
  periodo: ContraturnoPeriod;
  valorMensal: number;
}

export interface Enrollment {
  id: string;
  alunoId: string;
  ano: number;
  turmaRegularId: string; // locked by birthday cut-off
  valorRegularOriginal: number;
  descontoMensal: number; // monthly discount value in R$
  valorFinalRegular: number; // valorRegularOriginal - descontoMensal
  statusNegociacao: 'Pendente' | 'Em Negociação' | 'Confirmada' | 'Cancelada';
  anotacoes: string;
  descontoContraturno?: number;
  tipoDescontoRegular?: 'reais' | 'porcentagem';
  valorDescontoRegularInput?: number;
  tipoDescontoContraturno?: 'reais' | 'porcentagem';
  valorDescontoContraturnoInput?: number;
  adicionarLanche?: boolean;
  valorLanche?: number;
  descontoPontualidade?: boolean;
}

export interface FinancialMovement {
  id: string;
  alunoId: string;
  data: string; // YYYY-MM-DD
  tipo: 'Matrícula' | 'Contraturno_Ativação' | 'Contraturno_Cancelamento' | 'Desconto_Alterado' | 'Reajuste_Geral';
  descricao: string;
  valorAnterior: number; // Previous total monthly sum
  valorNovo: number; // New total monthly sum
}

export interface ContraturnoPrice {
  id: string;
  frequencia: number; // 0 is avulso, 1-5 is weekly frequency
  valorParcial: number;
  valorCompleto: number;
  ano?: number;
}
