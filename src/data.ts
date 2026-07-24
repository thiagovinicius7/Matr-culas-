import { Student, Guardian, RegularClass, ContraturnoSegment, Enrollment, FinancialMovement, ContraturnoPrice } from './types';

// Catalog of Regular Classes (Bee names theme - Sítio-escola native stingless bees)
export const REGULAR_CLASSES: RegularClass[] = [
  { id: 'mirim_1', nome: 'Mirim 1', natureza: 'Infantil', idadeRef: 2, valorMensal: 1970 },
  { id: 'mirim_2', nome: 'Mirim 2', natureza: 'Infantil', idadeRef: 3, valorMensal: 1970 },
  { id: 'mandacaia_1', nome: 'Mandaçaia 1', natureza: 'Infantil', idadeRef: 4, valorMensal: 1870 },
  { id: 'mandacaia_2', nome: 'Mandaçaia 2', natureza: 'Infantil', idadeRef: 5, valorMensal: 1870 },
  { id: 'jatai', nome: 'Jataí', natureza: 'Fundamental', idadeRef: 6, valorMensal: 1380 },
  { id: 'urucu', nome: 'Uruçu', natureza: 'Fundamental', idadeRef: 7, valorMensal: 1380 },
  { id: 'irai', nome: 'Iraí', natureza: 'Fundamental', idadeRef: 8, valorMensal: 1380 },
  { id: 'abelha_branca', nome: 'Abelha Branca', natureza: 'Fundamental', idadeRef: 9, valorMensal: 1380 },
  { id: 'benjoi', nome: 'Benjoí', natureza: 'Fundamental', idadeRef: 10, valorMensal: 1380 }
];

// Helper to calculate student age at March 31 of enrollment year
export function calculateAgeAtCutoff(birthdateStr: string, enrollmentYear: number = 2026): number {
  if (!birthdateStr) return 0;
  
  // Parse date without timezone offset issues
  const parts = birthdateStr.split('-');
  if (parts.length !== 3) return 0;
  
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10);
  const birthDay = parseInt(parts[2], 10);
  
  let age = enrollmentYear - birthYear;
  
  // Cut-off is 31st of March (Month 3 in JS is April since 0-indexed, so 3 is March if we do 1-indexed)
  if (birthMonth > 3 || (birthMonth === 3 && birthDay > 31)) {
    age--;
  }
  
  return age;
}

// Auto-determine regular class based on age
export function getRegularClassForAge(age: number): RegularClass {
  if (age <= 2) return REGULAR_CLASSES[0]; // Mirim 1
  if (age === 3) return REGULAR_CLASSES[1]; // Mirim 2
  if (age === 4) return REGULAR_CLASSES[2]; // Mandaçaia 1
  if (age === 5) return REGULAR_CLASSES[3]; // Mandaçaia 2
  if (age === 6) return REGULAR_CLASSES[4]; // Jataí
  if (age === 7) return REGULAR_CLASSES[5]; // Uruçu
  if (age === 8) return REGULAR_CLASSES[6]; // Iraí
  if (age === 9) return REGULAR_CLASSES[7]; // Abelha Branca
  return REGULAR_CLASSES[8]; // Benjoí (10+)
}

// Get Contraturno monthly base price or daily fee (avulso)
export function getContraturnoPrice(frequencia: number, periodo: 'Parcial' | 'Completo'): number {
  if (frequencia === 0) { // Avulso price (per unit)
    return periodo === 'Parcial' ? 100 : 120;
  }
  
  const pricingTable: Record<number, { Parcial: number; Completo: number }> = {
    1: { Parcial: 220, Completo: 260 },
    2: { Parcial: 460, Completo: 520 },
    3: { Parcial: 630, Completo: 690 },
    4: { Parcial: 775, Completo: 862.5 },
    5: { Parcial: 920, Completo: 1035 }
  };
  
  return pricingTable[frequencia]?.[periodo] || 0;
}

// Get Regular class dynamically from state-managed database prices
export function getRegularClassForAgeDynamic(
  age: number,
  classPricesList: RegularClass[],
  year: number = 2026
): RegularClass {
  if (!classPricesList || classPricesList.length === 0) {
    return getRegularClassForAge(age);
  }
  
  // Filter by year
  const filtered = classPricesList.filter(c => (c.ano || 2026) === year);
  const listToUse = filtered.length > 0 ? filtered : classPricesList;
  
  const sorted = [...listToUse].sort((a, b) => a.idadeRef - b.idadeRef);
  
  if (age <= 2) return sorted[0];
  if (age === 3) return sorted[1] || sorted[0];
  if (age === 4) return sorted[2] || sorted[0];
  if (age === 5) return sorted[3] || sorted[sorted.length - 1];
  if (age === 6) return sorted[4] || sorted[sorted.length - 1];
  if (age === 7) return sorted[5] || sorted[sorted.length - 1];
  if (age === 8) return sorted[6] || sorted[sorted.length - 1];
  if (age === 9) return sorted[7] || sorted[sorted.length - 1];
  return sorted[8] || sorted[sorted.length - 1];
}

// Get Contraturno price dynamically from state-managed database prices
export function getContraturnoPriceDynamic(
  frequencia: number, 
  periodo: 'Parcial' | 'Completo', 
  contraturnoPricesList: ContraturnoPrice[],
  year: number = 2026
): number {
  if (!contraturnoPricesList || contraturnoPricesList.length === 0) {
    return getContraturnoPrice(frequencia, periodo);
  }
  
  // Filter by year
  const filtered = contraturnoPricesList.filter(cp => (cp.ano || 2026) === year);
  const listToUse = filtered.length > 0 ? filtered : contraturnoPricesList;

  const match = listToUse.find(cp => cp.frequencia === frequencia);
  if (match) {
    return periodo === 'Parcial' ? match.valorParcial : match.valorCompleto;
  }
  return getContraturnoPrice(frequencia, periodo);
}

// Pre-seeded Student Database
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student_1',
    nome: 'Davi Martins Silva',
    nascimento: '2021-02-14', // 5yo on 2026-03-31
    dataEntrada: '2024-02-05',
    observacoes: 'Gosta de jardinagem e atividades de horta.',
    status: 'ativo'
  },
  {
    id: 'student_2',
    nome: 'Beatriz Santos Oliveira',
    nascimento: '2022-04-05', // 3yo on 2026-03-31 (since April is after March 31)
    dataEntrada: '2025-01-15',
    observacoes: 'Alergia alimentar a amendoim.',
    status: 'ativo'
  },
  {
    id: 'student_3',
    nome: 'Guilherme Castro Souza',
    nascimento: '2020-03-10', // 6yo on 2026-03-31
    dataEntrada: '2023-08-10',
    observacoes: 'Acompanhamento fonoaudiológico às quintas.',
    status: 'ativo'
  },
  {
    id: 'student_4',
    nome: 'Clara Costa Rezende',
    nascimento: '2019-09-22', // 6yo on 2026-03-31
    dataEntrada: '2022-02-10',
    observacoes: 'Extremamente comunicativa e criativa.',
    status: 'ativo'
  },
  {
    id: 'student_5',
    nome: 'Alice Xavier Almeida',
    nascimento: '2017-01-05', // 9yo on 2026-03-31
    dataEntrada: '2021-02-01',
    observacoes: 'Faz aulas de violão adicionais.',
    status: 'ativo'
  },
  {
    id: 'student_6',
    nome: 'Theo Pereira Lima',
    nascimento: '2023-11-12', // 2yo on 2026-03-31
    dataEntrada: '2026-02-02',
    observacoes: 'Fase de adaptação tranquila.',
    status: 'ativo'
  },
  {
    id: 'student_7',
    nome: 'Arthur Mendonça Rocha',
    nascimento: '2018-05-18', // 7yo on 2026-03-31
    dataEntrada: '2023-01-20',
    observacoes: 'Precisa de incentivo na leitura.',
    status: 'ativo'
  },
  {
    id: 'student_8',
    nome: 'Mateus Gerânio Silveira',
    nascimento: '2015-08-25', // 10yo on 2026-03-31
    dataEntrada: '2021-03-10',
    observacoes: 'Gosta de trilhas ecológicas, plantio de mudas e oficinas de bioconstrução.',
    status: 'ativo'
  }
];

// Pre-seeded Guardians Database
export const INITIAL_GUARDIANS: Guardian[] = [
  {
    id: 'g_1',
    alunoId: 'student_1',
    nome: 'Mariana Martins Silva',
    parentesco: 'Mãe',
    contato: '(11) 98765-4321',
    financeiro: true
  },
  {
    id: 'g_2',
    alunoId: 'student_1',
    nome: 'Felipe Silva',
    parentesco: 'Pai',
    contato: '(11) 98765-1234',
    financeiro: false
  },
  {
    id: 'g_3',
    alunoId: 'student_2',
    nome: 'Aline Santos Oliveira',
    parentesco: 'Mãe',
    contato: '(11) 99123-4567',
    financeiro: true
  },
  {
    id: 'g_4',
    alunoId: 'student_3',
    nome: 'Roberto Souza',
    parentesco: 'Pai',
    contato: '(11) 99345-6789',
    financeiro: true
  },
  {
    id: 'g_5',
    alunoId: 'student_4',
    nome: 'Paula Costa Rezende',
    parentesco: 'Mãe',
    contato: '(11) 97766-5544',
    financeiro: true
  },
  {
    id: 'g_6',
    alunoId: 'student_5',
    nome: 'Carla Xavier Almeida',
    parentesco: 'Mãe',
    contato: '(11) 98888-7777',
    financeiro: true
  },
  {
    id: 'g_7',
    alunoId: 'student_6',
    nome: 'Juliana Pereira Lima',
    parentesco: 'Mãe',
    contato: '(11) 96543-2109',
    financeiro: true
  },
  {
    id: 'g_8',
    alunoId: 'student_7',
    nome: 'Marcos Rocha',
    parentesco: 'Pai',
    contato: '(11) 95555-4444',
    financeiro: true
  },
  {
    id: 'g_9',
    alunoId: 'student_8',
    nome: 'Luciana Gerânio Silveira',
    parentesco: 'Mãe',
    contato: '(61) 99876-5432',
    financeiro: true
  }
];

// Pre-seeded Annual Enrollments
export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enroll_1',
    alunoId: 'student_1',
    ano: 2026,
    turmaRegularId: 'mandacaia_2', // age 5
    valorRegularOriginal: 1900,
    descontoMensal: 100,
    valorFinalRegular: 1800,
    statusNegociacao: 'Confirmada',
    anotacoes: 'Desconto de R$ 100 concedido por pagamento em dia.'
  },
  {
    id: 'enroll_2',
    alunoId: 'student_2',
    ano: 2026,
    turmaRegularId: 'mirim_2', // age 3
    valorRegularOriginal: 1700,
    descontoMensal: 0,
    valorFinalRegular: 1700,
    statusNegociacao: 'Em Negociação',
    anotacoes: 'Responsável solicitou desconto irmão, aguardando aprovação.'
  },
  {
    id: 'enroll_3',
    alunoId: 'student_3',
    ano: 2026,
    turmaRegularId: 'jatai', // age 6
    valorRegularOriginal: 2100,
    descontoMensal: 150,
    valorFinalRegular: 1950,
    statusNegociacao: 'Pendente',
    anotacoes: 'Negociação anual ainda não iniciada oficialmente.'
  },
  {
    id: 'enroll_4',
    alunoId: 'student_4',
    ano: 2026,
    turmaRegularId: 'jatai', // age 6
    valorRegularOriginal: 2100,
    descontoMensal: 200,
    valorFinalRegular: 1900,
    statusNegociacao: 'Confirmada',
    anotacoes: 'Família antiga do sítio-escola.'
  },
  {
    id: 'enroll_5',
    alunoId: 'student_5',
    ano: 2026,
    turmaRegularId: 'abelha_branca', // age 9
    valorRegularOriginal: 2400,
    descontoMensal: 0,
    valorFinalRegular: 2400,
    statusNegociacao: 'Confirmada',
    anotacoes: 'Matrícula renovada automaticamente.'
  },
  {
    id: 'enroll_6',
    alunoId: 'student_6',
    ano: 2026,
    turmaRegularId: 'mirim_1', // age 2
    valorRegularOriginal: 1600,
    descontoMensal: 0,
    valorFinalRegular: 1600,
    statusNegociacao: 'Pendente',
    anotacoes: 'Aguardando envio dos documentos assinados.'
  },
  {
    id: 'enroll_7',
    alunoId: 'student_7',
    ano: 2026,
    turmaRegularId: 'urucu', // age 7
    valorRegularOriginal: 2200,
    descontoMensal: 100,
    valorFinalRegular: 2100,
    statusNegociacao: 'Em Negociação',
    anotacoes: 'Negociando parcelamento do material pedagógico.'
  },
  {
    id: 'enroll_8',
    alunoId: 'student_8',
    ano: 2026,
    turmaRegularId: 'benjoi', // age 10
    valorRegularOriginal: 2500,
    descontoMensal: 200,
    valorFinalRegular: 2300,
    statusNegociacao: 'Confirmada',
    anotacoes: 'Família do sítio-escola desde a educação infantil. Acordo especial renovado.'
  }
];

// Pre-seeded Contraturno Period blocks
export const INITIAL_CONTRATURNO_SEGMENTS: ContraturnoSegment[] = [
  {
    id: 'seg_1',
    alunoId: 'student_1',
    dataInicio: '2026-02-01',
    dataFim: null,
    natureza: 'Marmelada', // age 5
    diasSemana: ['Seg', 'Qua', 'Sex'],
    periodo: 'Parcial',
    valorMensal: 750 // 3 days/week parcial
  },
  {
    id: 'seg_2',
    alunoId: 'student_4',
    dataInicio: '2026-02-01',
    dataFim: null,
    natureza: 'Marmelada', // age 6
    diasSemana: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    periodo: 'Completo',
    valorMensal: 1800 // 5 days/week completo
  }
];

// Pre-seeded Financial Movements Log
export const INITIAL_FINANCIAL_MOVEMENTS: FinancialMovement[] = [
  {
    id: 'mov_1',
    alunoId: 'student_1',
    data: '2026-02-01',
    tipo: 'Matrícula',
    descricao: 'Matrícula 2026 confirmada na turma Mandaçaia 2 (R$ 1.800/mês com desconto).',
    valorAnterior: 0,
    valorNovo: 1800
  },
  {
    id: 'mov_2',
    alunoId: 'student_1',
    data: '2026-02-05',
    tipo: 'Contraturno_Ativação',
    descricao: 'Ativação do contraturno Marmelada (Seg, Qua, Sex - Parcial) no valor de R$ 750/mês.',
    valorAnterior: 1800,
    valorNovo: 2550
  },
  {
    id: 'mov_3',
    alunoId: 'student_4',
    data: '2026-02-01',
    tipo: 'Matrícula',
    descricao: 'Matrícula 2026 confirmada na turma Jataí (R$ 1.900/mês com desconto).',
    valorAnterior: 0,
    valorNovo: 1900
  },
  {
    id: 'mov_4',
    alunoId: 'student_4',
    data: '2026-02-01',
    tipo: 'Contraturno_Ativação',
    descricao: 'Ativação do contraturno Marmelada (5 dias - Completo) no valor de R$ 1.800/mês.',
    valorAnterior: 1900,
    valorNovo: 3700
  },
  {
    id: 'mov_5',
    alunoId: 'student_5',
    data: '2026-02-02',
    tipo: 'Matrícula',
    descricao: 'Matrícula 2026 confirmada na turma Abelha Branca (R$ 2.400/mês).',
    valorAnterior: 0,
    valorNovo: 2400
  }
];
