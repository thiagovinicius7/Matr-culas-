export type StudentStatus = 'ativo' | 'trancado' | 'cancelado' | 'inativo';

export interface Student {
  id: string;
  nome: string;
  nascimento: string; // YYYY-MM-DD
  dataEntrada: string; // YYYY-MM-DD
  observacoes: string;
  status: StudentStatus;
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
  adicionarAlmoco?: boolean;
  valorAlmoco?: number;
  diaVencimento?: '01' | '05' | '10' | '15' | '20';
  descontoPontualidade?: boolean; // legacy or backward compatibility alias
  descontoPontualidadeRegular?: boolean;
  descontoPontualidadeContraturno?: boolean;

  // Novos campos para Carta de Intenção e Rematrícula 2027
  valorProposto2027?: number; // Valor personalizado editável para a regular de 2027
  turmaPropostaId2027?: string; // Turma prevista 2027
  contraturnoDesejado2027?: boolean;
  diasContraturno2027?: ('Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex')[];
  horarioSaida2027?: '15:30' | '17:30';
  periodoContraturno2027?: 'Parcial' | 'Completo';
  adicionarLanche2027?: boolean;
  valorLanche2027?: number;
  adicionarAlmoco2027?: boolean;
  valorAlmoco2027?: number;
  diaVencimento2027?: '01' | '05' | '10' | '15' | '20';
  descontoPontualidadeAtivo2027?: boolean;
  valorDescontoPontualidade2027?: number;
  statusIntencao2027?: 'Pendente' | 'Confirmada' | 'Em Análise' | 'Não Renovará';
  observacoesFamilia2027?: string;
  dataIntencao2027?: string;
}

export interface FinancialMovement {
  id: string;
  alunoId: string;
  data: string; // YYYY-MM-DD
  tipo: 'Matrícula' | 'Contraturno_Ativação' | 'Contraturno_Cancelamento' | 'Desconto_Alterado' | 'Reajuste_Geral' | 'Transição_Ano_Letivo';
  descricao: string;
  valorAnterior: number; // Previous total monthly sum
  valorNovo: number; // New total monthly sum
}

export interface ContraturnoPrice {
  id: string;
  frequencia: number; // 0 is avulso, 1-5 is weekly frequency
  valorParcial: number;
  valorCompleto: number;
  valorSomenteContraturnoParcial?: number;
  valorSomenteContraturnoCompleto?: number;
  ano?: number;
}
