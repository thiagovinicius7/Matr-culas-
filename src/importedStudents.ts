import { Student, Guardian, Enrollment, ContraturnoSegment } from './types';

// Structured import data for all 67 unique students from Sítio-Escola Geranium Relatório de Turmas
export const IMPORTED_STUDENTS: Student[] = [
  {
    id: 'student_12406',
    nome: 'Alexandre Luiz Oliveira',
    nascimento: '2019-10-17',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12393',
    nome: 'Aurora Rodriguez Guaraná',
    nascimento: '2020-09-10',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12420',
    nome: 'Cora Katu Monteiro Thurler',
    nascimento: '2019-06-07',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12374',
    nome: 'Douglas Kennedy de Souza Silva Garcia Ribeiro',
    nascimento: '2015-10-23',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12394',
    nome: 'Flora Bomfim Gomes',
    nascimento: '2019-10-01',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12375',
    nome: 'Francisco Towê de Vasconcelos Crispim',
    nascimento: '2019-11-20',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12383',
    nome: 'Gabriela Marques Cruz',
    nascimento: '2016-09-05',
    dataEntrada: '2026-02-02',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12402',
    nome: 'Heitor Alencar Pinheiro Pedroza Bonfim',
    nascimento: '2018-05-25',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12379',
    nome: 'Igor Carvalho de Sá',
    nascimento: '2018-04-24',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12366',
    nome: 'Joaquim Alves Pires',
    nascimento: '2017-08-31',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Iraí (3º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12357',
    nome: 'Leonardo Sousa Nobrega',
    nascimento: '2018-05-23',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12407',
    nome: 'Miguel Luiz Oliveira',
    nascimento: '2017-11-04',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Iraí (3º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12377',
    nome: 'Moana Bernardes Viana',
    nascimento: '2021-01-31',
    dataEntrada: '2026-04-01',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12376',
    nome: 'Pedro Towê de Vasconcelos Crispim',
    nascimento: '2016-06-06',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12428',
    nome: 'Radek Cordeiro Valença Rocha',
    nascimento: '2018-04-26',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12430',
    nome: 'Rita Timo Batista de Castro Oliveira',
    nascimento: '2018-12-11',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12355',
    nome: 'Ruda Alexandre Nunes Portugal',
    nascimento: '2021-10-18',
    dataEntrada: '2026-07-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II, contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12361',
    nome: 'Samuel Rodrigues e Silva',
    nascimento: '2019-04-10',
    dataEntrada: '2026-02-02',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12349',
    nome: 'Vicente Nunes Ventura',
    nascimento: '2017-10-05',
    dataEntrada: '2026-01-26',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Iraí (3º Ano), contraturno Marmelada.',
    status: 'ativo'
  },
  {
    id: 'student_12427',
    nome: 'Alpha Kerfalla Camara',
    nascimento: '2022-09-06',
    dataEntrada: '2026-02-10',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12365',
    nome: 'Bento Rodrigues e Silva',
    nascimento: '2021-08-28',
    dataEntrada: '2026-02-02',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12364',
    nome: 'Estevão Vitor Godoy Guimarães',
    nascimento: '2021-12-19',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12395',
    nome: 'Gabriel Massanaro Mendonça Amorim',
    nascimento: '2023-01-11',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12417',
    nome: 'Iara Flora Teixeira do Sacramento Leite',
    nascimento: '2023-10-15',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 1, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12358',
    nome: 'Julia Sousa Nobrega',
    nascimento: '2022-07-28',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12353',
    nome: 'Laura Paiva Gontijo',
    nascimento: '2023-09-15',
    dataEntrada: '2026-01-25',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 1, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12378',
    nome: 'Sol Rosa Mattos',
    nascimento: '2022-02-24',
    dataEntrada: '2026-02-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I, contraturno Melaço.',
    status: 'ativo'
  },
  {
    id: 'student_12411',
    nome: 'Theo Medeiros de Melo',
    nascimento: '2023-10-16',
    dataEntrada: '2026-03-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 1.',
    status: 'ativo'
  },
  {
    id: 'student_12387',
    nome: 'Amélie Melini Silva Claudino',
    nascimento: '2023-03-21',
    dataEntrada: '2026-03-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12436',
    nome: 'Antonella Coelho Carvalho',
    nascimento: '2023-01-02',
    dataEntrada: '2026-07-14',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12381',
    nome: 'Clara Barberato Leite',
    nascimento: '2023-01-14',
    dataEntrada: '2026-01-29',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12391',
    nome: 'Dom Rodrigues Marques Maia',
    nascimento: '2022-12-20',
    dataEntrada: '2026-01-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12404',
    nome: 'Emma de Moraes Massa Melo',
    nascimento: '2022-08-25',
    dataEntrada: '2026-01-17',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12415',
    nome: 'Lara Alves Guimarães',
    nascimento: '2022-08-20',
    dataEntrada: '2026-03-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12426',
    nome: 'Lucca Messias de Sousa Lima',
    nascimento: '2022-12-10',
    dataEntrada: '2026-01-20',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12382',
    nome: 'Mateo Dourado Cardoso',
    nascimento: '2022-05-20',
    dataEntrada: '2026-01-07',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mirim 2.',
    status: 'ativo'
  },
  {
    id: 'student_12363',
    nome: 'Akin Gama Vidal de Negreiros',
    nascimento: '2021-06-30',
    dataEntrada: '2025-11-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12348',
    nome: 'Bella Barbosa da Silveira',
    nascimento: '2021-05-13',
    dataEntrada: '2025-11-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12401',
    nome: 'Caetano Lopes Maniero',
    nascimento: '2020-08-20',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12396',
    nome: 'Caio Medeiros de Melo',
    nascimento: '2022-03-01',
    dataEntrada: '2025-12-01',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12412',
    nome: 'Luzia de Almeida Pina',
    nascimento: '2021-08-18',
    dataEntrada: '2025-11-18',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12362',
    nome: 'Maya Matos Giazzon',
    nascimento: '2021-06-01',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12409',
    nome: 'Rodrigo de Oliveira Silva',
    nascimento: '2022-02-24',
    dataEntrada: '2025-12-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia I.',
    status: 'ativo'
  },
  {
    id: 'student_12380',
    nome: 'Aquiles Sobreira Fernandes',
    nascimento: '2020-04-22',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12392',
    nome: 'Dante Rodrigues Marques Maia',
    nascimento: '2020-08-22',
    dataEntrada: '2025-11-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12405',
    nome: 'Estevão de Moraes Massa Melo',
    nascimento: '2021-03-04',
    dataEntrada: '2025-11-17',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12350',
    nome: 'Gabriela Maria Papandrea de Almeida Vieira',
    nascimento: '2020-10-19',
    dataEntrada: '2025-11-07',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12369',
    nome: 'Leonardo Lima Moraes',
    nascimento: '2021-02-08',
    dataEntrada: '2025-11-14',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12403',
    nome: 'Maitê Marinho Catunda',
    nascimento: '2020-11-18',
    dataEntrada: '2025-12-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Mandaçaia II.',
    status: 'ativo'
  },
  {
    id: 'student_12384',
    nome: 'Bruna Almeida Fírveda',
    nascimento: '2019-01-05',
    dataEntrada: '2025-11-17',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12371',
    nome: 'Heloísa Bernardes Fortaleza',
    nascimento: '2018-04-16',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12347',
    nome: 'Theo Barberato Leite',
    nascimento: '2018-11-25',
    dataEntrada: '2025-10-29',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Uruçu (2º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12423',
    nome: 'Beatriz Martins do Espirito Santo',
    nascimento: '2018-02-17',
    dataEntrada: '2026-01-07',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Iraí (3º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12410',
    nome: 'Isabela Zaida Medeiros de Souza Holanda',
    nascimento: '2017-11-10',
    dataEntrada: '2025-12-04',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Iraí (3º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12398',
    nome: 'Agnes Silvério Soares Araújo',
    nascimento: '2016-12-15',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca (4º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12370',
    nome: 'Helena Bernardes Fortaleza',
    nascimento: '2016-07-05',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca (4º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12419',
    nome: 'Mateus Lima Castro',
    nascimento: '2016-05-14',
    dataEntrada: '2025-12-16',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca (4º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12418',
    nome: 'Salomão Mota Guimarães Braz Jacyntho',
    nascimento: '2016-06-16',
    dataEntrada: '2025-12-22',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Abelha Branca (4º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12397',
    nome: 'Cora de Oliveira Paes Leme',
    nascimento: '2016-03-29',
    dataEntrada: '2025-11-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Benjoi (5º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12389',
    nome: 'Isaac Levi Machado Vaz',
    nascimento: '2014-12-15',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Benjoi (5º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12390',
    nome: 'Nalu Paes Leme Rodrigues',
    nascimento: '2016-02-08',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Benjoi (5º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12368',
    nome: 'Otto Ferreira Reis',
    nascimento: '2015-10-06',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Benjoi (5º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12352',
    nome: 'Anna Clara Resende Teixeira',
    nascimento: '2020-03-07',
    dataEntrada: '2025-11-12',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12359',
    nome: 'Athos Barbosa Xavier',
    nascimento: '2019-09-27',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12356',
    nome: 'Helena Macedo Valim',
    nascimento: '2020-01-13',
    dataEntrada: '2025-11-11',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12422',
    nome: 'Maitê Gomes de Almeida Barros',
    nascimento: '2020-02-17',
    dataEntrada: '2026-01-10',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano).',
    status: 'ativo'
  },
  {
    id: 'student_12388',
    nome: 'Oliver de Souza Rocha',
    nascimento: '2019-06-06',
    dataEntrada: '2025-12-03',
    observacoes: 'Importado de Relatório de Turmas. Turno regular Jataí (1º Ano).',
    status: 'ativo'
  }
];

// Helper to construct guardians dynamically
export function getImportedGuardians(): Guardian[] {
  const guardians: Guardian[] = [];

  // Alexandre
  guardians.push({
    id: 'g_mae_12406',
    alunoId: 'student_12406',
    nome: 'Dayanne Luiz Lopes',
    parentesco: 'Mãe',
    contato: '(61) 99951-2489 | email: daylua@gmail.com',
    financeiro: true
  });

  // Aurora
  guardians.push({
    id: 'g_mae_12393',
    alunoId: 'student_12393',
    nome: 'Ana Luísa Rodrigues vera de Souza',
    parentesco: 'Mãe',
    contato: '(61) 98314-1120 | email: analuisarvs@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12393',
    alunoId: 'student_12393',
    nome: 'Igor Andrade Rodriguez',
    parentesco: 'Pai',
    contato: '(61) 99144-2665 | email: igor.rodriguez@gmail.com',
    financeiro: false
  });

  // Cora Katu
  guardians.push({
    id: 'g_mae_12420',
    alunoId: 'student_12420',
    nome: 'Nayá Katu Monteiro Pereira',
    parentesco: 'Mãe',
    contato: '(61) 98429-6348 | email: nayakatu@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12420',
    alunoId: 'student_12420',
    nome: 'Rodrigo Thurler Nacif',
    parentesco: 'Pai',
    contato: '(13) 92003-6501 | email: rodri.thurler@gmail.com',
    financeiro: false
  });

  // Douglas Kennedy
  guardians.push({
    id: 'g_mae_12374',
    alunoId: 'student_12374',
    nome: 'Luciana Silva Garcia',
    parentesco: 'Mãe',
    contato: '(61) 99804-5514 | email: luciana.silvagarcia@gmail.com',
    financeiro: true
  });

  // Flora
  guardians.push({
    id: 'g_mae_12394',
    alunoId: 'student_12394',
    nome: 'Natalia Santos do Bomfim',
    parentesco: 'Mãe',
    contato: '(61) 99826-9680 | email: natalia.bomfim@gmail.com',
    financeiro: true
  });

  // Francisco
  guardians.push({
    id: 'g_pai_12375',
    alunoId: 'student_12375',
    nome: 'Calimério Júnior',
    parentesco: 'Pai',
    contato: '(61) 99903-3961 | email: calimeriojr@gmail.com',
    financeiro: true
  });

  // Gabriela
  guardians.push({
    id: 'g_mae_12383',
    alunoId: 'student_12383',
    nome: 'Patricia Cruz da Silva',
    parentesco: 'Mãe',
    contato: '(61) 99164-1854 | email: pcruz408@gmail.com',
    financeiro: true
  });

  // Heitor
  guardians.push({
    id: 'g_mae_12402',
    alunoId: 'student_12402',
    nome: 'Aryane Pedroza Bonfim',
    parentesco: 'Mãe',
    contato: '(61) 98201-7182 | email: aryanepbonfim@gmail.com',
    financeiro: true
  });

  // Igor
  guardians.push({
    id: 'g_mae_12379',
    alunoId: 'student_12379',
    nome: 'Karoline Ferreira de Carvalho',
    parentesco: 'Mãe',
    contato: '(62) 98441-5938 | email: karolineferreiradecarvalho@gmail.com',
    financeiro: true
  });

  // Joaquim
  guardians.push({
    id: 'g_mae_12366',
    alunoId: 'student_12366',
    nome: 'Rafaela de Oliveira Alves Pires',
    parentesco: 'Mãe',
    contato: '(61) 99271-2167 | email: rafaelapires.professora@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12366',
    alunoId: 'student_12366',
    nome: 'Francisco Clênio Teixeira Pires',
    parentesco: 'Pai',
    contato: '(61) 99287-4370 | email: fclenio@gmail.com',
    financeiro: false
  });

  // Leonardo
  guardians.push({
    id: 'g_mae_12357',
    alunoId: 'student_12357',
    nome: 'Alessandra Sousa da Silva Nobrega',
    parentesco: 'Mãe',
    contato: '(61) 99137-6810 | email: nob.rafael@gmail.com',
    financeiro: true
  });

  // Miguel Luiz
  guardians.push({
    id: 'g_mae_12407',
    alunoId: 'student_12407',
    nome: 'Dayanne Luiz Lopes',
    parentesco: 'Mãe',
    contato: '(61) 99951-2489 | email: daylua@gmail.com',
    financeiro: true
  });

  // Moana
  guardians.push({
    id: 'g_mae_12377',
    alunoId: 'student_12377',
    nome: 'Isadora Silva Bernardes',
    parentesco: 'Mãe',
    contato: '(61) 99814-3011 | email: isadorasbernardes@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12377',
    alunoId: 'student_12377',
    nome: 'Ciro Luis Trindade Viana',
    parentesco: 'Pai',
    contato: '(61) 98149-5756 | email: cirotviana@gmail.com',
    financeiro: false
  });

  // Pedro Towê
  guardians.push({
    id: 'g_pai_12376',
    alunoId: 'student_12376',
    nome: 'Calimério Júnior',
    parentesco: 'Pai',
    contato: '(61) 99903-3961 | email: calimeriojr@gmail.com',
    financeiro: true
  });

  // Radek
  guardians.push({
    id: 'g_mae_12428',
    alunoId: 'student_12428',
    nome: 'Isadora Valença Dias',
    parentesco: 'Mãe',
    contato: '(61) 99939-3396 | email: isavalencavd@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12428',
    alunoId: 'student_12428',
    nome: 'Janhser da Rocha Vieira',
    parentesco: 'Pai',
    contato: '(61) 99577-0737 | email: fastpacksbr@gmail.com',
    financeiro: false
  });

  // Rita Timo
  guardians.push({
    id: 'g_mae_12430',
    alunoId: 'student_12430',
    nome: 'Moema Timo de Castro',
    parentesco: 'Mãe',
    contato: '(61) 99186-3795 | email: moematimodecastro@gmail.com',
    financeiro: true
  });

  // Ruda
  guardians.push({
    id: 'g_pai_12355',
    alunoId: 'student_12355',
    nome: 'Vitor Henrique Macedo Portugal',
    parentesco: 'Pai',
    contato: '(61) 99955-0581 | email: vitorportugal90@gmail.com',
    financeiro: true
  });

  // Samuel
  guardians.push({
    id: 'g_mae_12361',
    alunoId: 'student_12361',
    nome: 'Thatiana Goes Rodrigues',
    parentesco: 'Mãe',
    contato: '(61) 98175-4845 | email: thatianagr@hotmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12361',
    alunoId: 'student_12361',
    nome: 'Rodrigo de Oliveira e Silva',
    parentesco: 'Pai',
    contato: '(61) 98118-3248 | email: rodrigoarevilo@gmail.com',
    financeiro: false
  });

  // Vicente
  guardians.push({
    id: 'g_mae_12349',
    alunoId: 'student_12349',
    nome: 'Daniela Sardote Ventura',
    parentesco: 'Mãe',
    contato: '(61) 98121-8955 | email: danielasardote@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12349',
    alunoId: 'student_12349',
    nome: 'Osvaldo de Oliveira Nunes Júnior',
    parentesco: 'Pai',
    contato: '(61) 92191-3601 | email: osvaldonunesjr@gmail.com',
    financeiro: false
  });

  // Alpha
  guardians.push({
    id: 'g_mae_12427',
    alunoId: 'student_12427',
    nome: 'Valquiria Alexandre Camara',
    parentesco: 'Mãe',
    contato: '(61) 98115-3374 | email: valcomunica@gmail.com',
    financeiro: true
  });

  // Bento
  guardians.push({
    id: 'g_mae_12365',
    alunoId: 'student_12365',
    nome: 'Thatiana Goes Rodrigues',
    parentesco: 'Mãe',
    contato: '(61) 98175-4845 | email: thatianagr@hotmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12365',
    alunoId: 'student_12365',
    nome: 'Rodrigo de Oliveira e Silva',
    parentesco: 'Pai',
    contato: '(61) 98118-3248 | email: rodrigoarevilo@gmail.com',
    financeiro: false
  });

  // Estevão Vitor
  guardians.push({
    id: 'g_mae_12364',
    alunoId: 'student_12364',
    nome: 'Raysla Silva Godoy Guimarães',
    parentesco: 'Mãe',
    contato: '(61) 99860-1977 | email: gomes.guimaraes1497@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12364',
    alunoId: 'student_12364',
    nome: 'Erick Vítor Gomes Godoy Guimarães',
    parentesco: 'Pai',
    contato: '(91) 99234-9313 | email: gomes.guimaraes1497@gmail.com',
    financeiro: false
  });

  // Gabriel Massanaro
  guardians.push({
    id: 'g_pai_12395',
    alunoId: 'student_12395',
    nome: 'Danilo Aquino Amorim',
    parentesco: 'Pai',
    contato: '(61) 98108-2835 | email: daniloamorim_5@hotmail.com',
    financeiro: true
  });

  // Iara Flora
  guardians.push({
    id: 'g_mae_12417',
    alunoId: 'student_12417',
    nome: 'Fabiana da Silva Teixeira',
    parentesco: 'Mãe',
    contato: '(61) 99120-1061 | email: enviarparafabiana@gmail.com',
    financeiro: true
  });

  // Julia Sousa
  guardians.push({
    id: 'g_mae_12358',
    alunoId: 'student_12358',
    nome: 'Alessandra Sousa da Silva Nobrega',
    parentesco: 'Mãe',
    contato: '(61) 99137-6810 | email: nob.rafael@gmail.com',
    financeiro: true
  });

  // Laura Paiva
  guardians.push({
    id: 'g_mae_12353',
    alunoId: 'student_12353',
    nome: 'Carolyna de Oliveira Paiva',
    parentesco: 'Mãe',
    contato: '(61) 98333-8283 | email: paivacarolyna@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12353',
    alunoId: 'student_12353',
    nome: 'Rafael Gontijo de Aquino',
    parentesco: 'Pai',
    contato: '(61) 8333-8283 | email: rafagontijo@gmail.com',
    financeiro: false
  });

  // Sol Rosa
  guardians.push({
    id: 'g_mae_12378',
    alunoId: 'student_12378',
    nome: 'Rafaelle Cristina Mattos da Silva',
    parentesco: 'Mãe',
    contato: '(61) 98239-0070 | email: rafaellecristinaa@gmail.com',
    financeiro: true
  });

  // Theo Medeiros
  guardians.push({
    id: 'g_mae_12411',
    alunoId: 'student_12411',
    nome: 'Nathalia Barros de Melo',
    parentesco: 'Mãe',
    contato: '(61) 99164-4224 | email: nathaliabarrosmelo@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12411',
    alunoId: 'student_12411',
    nome: 'Lucas Alves Medeiros',
    parentesco: 'Pai',
    contato: '(61) 99124-7271 | email: lucasalves92@gmail.com',
    financeiro: false
  });

  // Amélie
  guardians.push({
    id: 'g_mae_12387',
    alunoId: 'student_12387',
    nome: 'Estefania Sandryely Silva Claudino',
    parentesco: 'Mãe',
    contato: '(61) 99129-7117 | email: estefaniasandryely@gmail.com',
    financeiro: true
  });

  // Antonella
  guardians.push({
    id: 'g_mae_12436',
    alunoId: 'student_12436',
    nome: 'Yara Luiza Coelho Carvalho',
    parentesco: 'Mãe',
    contato: '(61) 99446-5708 | email: yara.luiza1109@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12436',
    alunoId: 'student_12436',
    nome: 'Jefferson Coelho Pereira',
    parentesco: 'Pai',
    contato: '(61) 99432-8062 | email: jeffersonreis005@gmail.com',
    financeiro: false
  });

  // Clara Barberato
  guardians.push({
    id: 'g_mae_12381',
    alunoId: 'student_12381',
    nome: 'Luana Chaves Barberato',
    parentesco: 'Mãe',
    contato: '(61) 98165-2427 | email: luanachb@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12381',
    alunoId: 'student_12381',
    nome: 'Thiago Vinicius Pereira Leite',
    parentesco: 'Pai',
    contato: '(61) 99293-3384 | email: thiagovinicius7@gmail.com',
    financeiro: false
  });

  // Dom
  guardians.push({
    id: 'g_mae_12391',
    alunoId: 'student_12391',
    nome: 'Layla Tayz Rodrigues Marques',
    parentesco: 'Mãe',
    contato: '(61) 98447-3124 | email: laylatayz.rm@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12391',
    alunoId: 'student_12391',
    nome: 'José Alves Maia Teixeira Neto',
    parentesco: 'Pai',
    contato: '(61) 99255-6044 | email: netinho_maia@hotmail.com',
    financeiro: false
  });

  // Emma
  guardians.push({
    id: 'g_mae_12404',
    alunoId: 'student_12404',
    nome: 'Fernanda de Moraes Ferreira',
    parentesco: 'Mãe',
    contato: '(61) 98127-3105 | email: fernandaferreira.br@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12404',
    alunoId: 'student_12404',
    nome: 'Thiago Massa de Melo',
    parentesco: 'Pai',
    contato: '(61) 98407-7445 | email: othiagomassa@gmail.com',
    financeiro: false
  });

  // Lara Alves
  guardians.push({
    id: 'g_mae_12415',
    alunoId: 'student_12415',
    nome: 'Luciana Guimarães',
    parentesco: 'Mãe',
    contato: '(61) 98426-4062 | email: lucianaguimaraes@gmail.com',
    financeiro: true
  });

  // Lucca
  guardians.push({
    id: 'g_mae_12426',
    alunoId: 'student_12426',
    nome: 'Nilvany Pereira de Sousa',
    parentesco: 'Mãe',
    contato: '(61) 99972-2875 | email: nilvany2001@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12426',
    alunoId: 'student_12426',
    nome: 'Almir Messias de Lima',
    parentesco: 'Pai',
    contato: '(61) 99879-9122 | email: almirmessias02@gmail.com',
    financeiro: false
  });

  // Mateo
  guardians.push({
    id: 'g_mae_12382',
    alunoId: 'student_12382',
    nome: 'Lais Nathalia Dourado Brandão Cardoso',
    parentesco: 'Mãe',
    contato: '(61) 99356-6750 | email: lais.dourado@outlook.com',
    financeiro: true
  }, {
    id: 'g_pai_12382',
    alunoId: 'student_12382',
    nome: 'Fernando Augusto Cardoso',
    parentesco: 'Pai',
    contato: '(61) 99831-8227 | email: fernandocardoso@live.com',
    financeiro: false
  });

  // Akin
  guardians.push({
    id: 'g_mae_12363',
    alunoId: 'student_12363',
    nome: 'Vivianni de Matos Gama',
    parentesco: 'Mãe',
    contato: '(61) 99394-5104 | email: vivianni.gama@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12363',
    alunoId: 'student_12363',
    nome: 'Anderson Cleyton Vidal de Negreiros',
    parentesco: 'Pai',
    contato: '(81) 99543-5304 | email: andersonegreiros@hotmail.com',
    financeiro: false
  });

  // Bella
  guardians.push({
    id: 'g_mae_12348',
    alunoId: 'student_12348',
    nome: 'Natassja Barbosa da Silva Santos',
    parentesco: 'Mãe',
    contato: '(61) 99284-8252 | email: natassjasilva@hotmail.com',
    financeiro: true
  });

  // Caetano
  guardians.push({
    id: 'g_mae_12401',
    alunoId: 'student_12401',
    nome: 'Elizabeth M Maniero',
    parentesco: 'Mãe',
    contato: '(61) 98177-9278 | email: elizabethmanieero@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12401',
    alunoId: 'student_12401',
    nome: 'Marcelo Lopes da Silva Junior',
    parentesco: 'Pai',
    contato: '(61) 99924-4360 | email: marcelopesjunior@gmail.com',
    financeiro: false
  });

  // Caio
  guardians.push({
    id: 'g_mae_12396',
    alunoId: 'student_12396',
    nome: 'Nathalia Barros de Melo',
    parentesco: 'Mãe',
    contato: '(61) 99164-4224 | email: nathaliabarrosmelo@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12396',
    alunoId: 'student_12396',
    nome: 'Lucas Alves Medeiros',
    parentesco: 'Pai',
    contato: '(61) 99124-7271 | email: lucasalves92@gmail.com',
    financeiro: false
  });

  // Luzia
  guardians.push({
    id: 'g_mae_12412',
    alunoId: 'student_12412',
    nome: 'Layza Chrystiane Seabra De Almeida',
    parentesco: 'Mãe',
    contato: '(61) 9859-4386 | email: producao.layza@gmail.com',
    financeiro: true
  });

  // Maya
  guardians.push({
    id: 'g_mae_12362',
    alunoId: 'student_12362',
    nome: 'Wanessa de Matos Firmino Silva',
    parentesco: 'Mãe',
    contato: '(61) 72143-1001 | email: wmatosfs@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12362',
    alunoId: 'student_12362',
    nome: 'Giovanni Giazzon dos Santos',
    parentesco: 'Pai',
    contato: '(61) 99991-7312 | email: ggiazzon@gmail.com',
    financeiro: false
  });

  // Rodrigo
  guardians.push({
    id: 'g_mae_12409',
    alunoId: 'student_12409',
    nome: 'Renata Stephanie de Oliveira Lopes',
    parentesco: 'Mãe',
    contato: '(61) 99180-7846 | email: renataprojetos01@gmail.com',
    financeiro: true
  });

  // Aquiles
  guardians.push({
    id: 'g_pai_12380',
    alunoId: 'student_12380',
    nome: 'Marcelo Sobreira de Santana Lopes',
    parentesco: 'Pai',
    contato: '(61) 99945-1758 | email: marcelo.sobreira@outlook.com',
    financeiro: true
  });

  // Dante
  guardians.push({
    id: 'g_mae_12392',
    alunoId: 'student_12392',
    nome: 'Layla Tayz Rodrigues Marques',
    parentesco: 'Mãe',
    contato: '(61) 98447-3124 | email: laylatayz.rm@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12392',
    alunoId: 'student_12392',
    nome: 'José Alves Maia Teixeira Neto',
    parentesco: 'Pai',
    contato: '(61) 99255-6044 | email: netinho_maia@hotmail.com',
    financeiro: false
  });

  // Estevão de Moraes
  guardians.push({
    id: 'g_mae_12405',
    alunoId: 'student_12405',
    nome: 'Fernanda de Moraes Ferreira',
    parentesco: 'Mãe',
    contato: '(61) 98127-3105 | email: fernandaferreira.br@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12405',
    alunoId: 'student_12405',
    nome: 'Thiago Massa de Melo',
    parentesco: 'Pai',
    contato: '(61) 98407-7445 | email: othiagomassa@gmail.com',
    financeiro: false
  });

  // Gabriela Maria
  guardians.push({
    id: 'g_mae_12350',
    alunoId: 'student_12350',
    nome: 'Karen Santana de Almeida Vieira',
    parentesco: 'Mãe',
    contato: '(61) 98134-5443 | email: vieira.almeida1307@gmail.com',
    financeiro: true
  });

  // Leonardo Lima
  guardians.push({
    id: 'g_mae_12369',
    alunoId: 'student_12369',
    nome: 'Gabriela Garcia Batista Lima Moraes',
    parentesco: 'Mãe',
    contato: '(61) 99832-5927 | email: gblima@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12369',
    alunoId: 'student_12369',
    nome: 'Rafael Moraes Pereira da Luz',
    parentesco: 'Pai',
    contato: '(61) 98402-1308 | email: rafael@intech.com',
    financeiro: false
  });

  // Maitê Marinho
  guardians.push({
    id: 'g_mae_12403',
    alunoId: 'student_12403',
    nome: 'Pollyana Marinho Cardoso',
    parentesco: 'Mãe',
    contato: '(61) 99275-1725 | email: polly.marinho@icloud.com',
    financeiro: true
  });

  // Bruna
  guardians.push({
    id: 'g_mae_12384',
    alunoId: 'student_12384',
    nome: 'Debora Porto Abranches Almeida Fírveda',
    parentesco: 'Mãe',
    contato: '(61) 98623-6563 | email: deborapaaf@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12384',
    alunoId: 'student_12384',
    nome: 'Ramon Fírveda Penas',
    parentesco: 'Pai',
    contato: '(61) 98566-3650 | email: ramonfirveda@gmail.com',
    financeiro: false
  });

  // Heloísa
  guardians.push({
    id: 'g_mae_12371',
    alunoId: 'student_12371',
    nome: 'Nathalia Bernardes Magalhães',
    parentesco: 'Mãe',
    contato: '(61) 98255-1817 | email: bernardes.nathalia@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12371',
    alunoId: 'student_12371',
    nome: 'Antonio Carlos Fortaleza de Aquino',
    parentesco: 'Pai',
    contato: '(61) 98151-4507 | email: antonio.cfa@gmail.com',
    financeiro: false
  });

  // Theo Barberato
  guardians.push({
    id: 'g_mae_12347',
    alunoId: 'student_12347',
    nome: 'Luana Chaves Barberato',
    parentesco: 'Mãe',
    contato: '(61) 98165-2427 | email: luanachb@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12347',
    alunoId: 'student_12347',
    nome: 'Thiago Vinicius Pereira Leite',
    parentesco: 'Pai',
    contato: '(61) 99293-3384 | email: thiagovinicius7@gmail.com',
    financeiro: false
  });

  // Beatriz
  guardians.push({
    id: 'g_mae_12423',
    alunoId: 'student_12423',
    nome: 'Marilia Pompeu Martins',
    parentesco: 'Mãe',
    contato: '(61) 98333-3761 | email: marilia_pompeu@hotmail.com',
    financeiro: true
  });

  // Isabela
  guardians.push({
    id: 'g_mae_12410',
    alunoId: 'student_12410',
    nome: 'Tatiana Cátia Medeiros de Souza Holanda',
    parentesco: 'Mãe',
    contato: '(61) 99112-3949 | email: taty.medeirosh@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12410',
    alunoId: 'student_12410',
    nome: 'Bruno Oliveira Marques de Holanda',
    parentesco: 'Pai',
    contato: '(61) 98449-1374 | email: brunomholanda@gmail.com',
    financeiro: false
  });

  // Agnes
  guardians.push({
    id: 'g_mae_12398',
    alunoId: 'student_12398',
    nome: 'Aline Soares Araujo',
    parentesco: 'Mãe',
    contato: '(61) 98199-1488 | email: alineeph2016@yahoo.com.br',
    financeiro: true
  }, {
    id: 'g_pai_12398',
    alunoId: 'student_12398',
    nome: 'Paulo Henrique Silvério',
    parentesco: 'Pai',
    contato: '(61) 98305-0800 | email: alineeph2016@yahoo.com.br',
    financeiro: false
  });

  // Helena
  guardians.push({
    id: 'g_mae_12370',
    alunoId: 'student_12370',
    nome: 'Nathalia Bernardes Magalhães',
    parentesco: 'Mãe',
    contato: '(61) 98255-1817 | email: bernardes.nathalia@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12370',
    alunoId: 'student_12370',
    nome: 'Antonio Carlos Fortaleza de Aquino',
    parentesco: 'Pai',
    contato: '(61) 98151-4507 | email: antonio.cfa@gmail.com',
    financeiro: false
  });

  // Mateus Lima
  guardians.push({
    id: 'g_mae_12419',
    alunoId: 'student_12419',
    nome: 'Lilian Carla Pereira da Silva Lima',
    parentesco: 'Mãe',
    contato: '(61) 99663-2941 | email: liliancarlalima@gmail.com',
    financeiro: true
  });

  // Salomão
  guardians.push({
    id: 'g_mae_12418',
    alunoId: 'student_12418',
    nome: 'Laryssa Mota Guimarães Jacyntho',
    parentesco: 'Mãe',
    contato: '(61) 99934-5556 | email: laryssamota@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12418',
    alunoId: 'student_12418',
    nome: 'Pedro Henrique',
    parentesco: 'Pai',
    contato: '(61) 99818-9882 | email: ph.jacyntho@gmail.com',
    financeiro: false
  });

  // Cora de Oliveira
  guardians.push({
    id: 'g_mae_12397',
    alunoId: 'student_12397',
    nome: 'Anna Lídia Martins Paes Leme',
    parentesco: 'Mãe',
    contato: '(61) 99258-9079 | email: annalidialeme@gmail.com',
    financeiro: true
  });

  // Isaac Levi
  guardians.push({
    id: 'g_mae_12389',
    alunoId: 'student_12389',
    nome: 'Ana Beatriz Soares Machado',
    parentesco: 'Mãe',
    contato: '(61) 98511-6650 | email: biahs.machado@gmail.com',
    financeiro: true
  });

  // Nalu
  guardians.push({
    id: 'g_mae_12390',
    alunoId: 'student_12390',
    nome: 'Carolina Martins Paes Leme Rodrigues',
    parentesco: 'Mãe',
    contato: '(61) 98190-0319 | email: nina.mplr@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12390',
    alunoId: 'student_12390',
    nome: 'Daniel Santos Rodrigues Martins',
    parentesco: 'Pai',
    contato: '(61) 98219-3046 | email: danielsrm85@gmail.com',
    financeiro: false
  });

  // Otto
  guardians.push({
    id: 'g_mae_12368',
    alunoId: 'student_12368',
    nome: 'Luanna Ferreira da Silva',
    parentesco: 'Mãe',
    contato: '(61) 98137-9853 | email: luannaferreirasilvaunb@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12368',
    alunoId: 'student_12368',
    nome: 'Otacilio Alves dos Reis',
    parentesco: 'Pai',
    contato: '(61) 98162-1916 | email: otacilioreab@gmail.com',
    financeiro: false
  });

  // Anna Clara
  guardians.push({
    id: 'g_mae_12352',
    alunoId: 'student_12352',
    nome: 'Janaina Angélica da Silva Resende',
    parentesco: 'Mãe',
    contato: '(61) 98224-4988 | email: jasresende2023@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12352',
    alunoId: 'student_12352',
    nome: 'Pai Teste',
    parentesco: 'Pai',
    contato: '(15) 99766-9468 | email: kevin@education1.com.br',
    financeiro: false
  });

  // Athos
  guardians.push({
    id: 'g_pai_12359',
    alunoId: 'student_12359',
    nome: 'Alberto Santiago Oliveira Xavier',
    parentesco: 'Pai',
    contato: '(61) 98121-9079 | email: albertoxavier83@yahoo.com.br',
    financeiro: true
  });

  // Helena Macedo
  guardians.push({
    id: 'g_mae_12356',
    alunoId: 'student_12356',
    nome: 'Joana Darc Bernardes Macedo',
    parentesco: 'Mãe',
    contato: '(61) 99632-5853 | email: joanamacedo1301@gmail.com',
    financeiro: true
  });

  // Maitê Gomes
  guardians.push({
    id: 'g_mae_12422',
    alunoId: 'student_12422',
    nome: 'Lorranny de Jesus Gomes',
    parentesco: 'Mãe',
    contato: '(61) 99277-3267 | email: lorranny@live.com',
    financeiro: true
  }, {
    id: 'g_pai_12422',
    alunoId: 'student_12422',
    nome: 'Wagner de Barros Neto',
    parentesco: 'Pai',
    contato: '(62) 98125-0959 | email: wbarrosn@gmail.com',
    financeiro: false
  });

  // Oliver
  guardians.push({
    id: 'g_mae_12388',
    alunoId: 'student_12388',
    nome: 'Jeniffer Pereira da Silva Rocha',
    parentesco: 'Mãe',
    contato: '(61) 99871-2888 | email: jeniffer.s.rocha@gmail.com',
    financeiro: true
  }, {
    id: 'g_pai_12388',
    alunoId: 'student_12388',
    nome: 'André Luiz Venâncio Rocha',
    parentesco: 'Pai',
    contato: '(61) 99325-7555 | email: alvroocha@hotmail.com',
    financeiro: false
  });

  return guardians;
}

// Dynamically generate annual enrollment mapping based on classroom context
export function getImportedEnrollments(): Enrollment[] {
  const mapClass: Record<string, { id: string; price: number }> = {
    'Alexandre Luiz Oliveira': { id: 'jatai', price: 2100 },
    'Aurora Rodriguez Guaraná': { id: 'mandacaia_2', price: 1900 },
    'Cora Katu Monteiro Thurler': { id: 'jatai', price: 2100 },
    'Douglas Kennedy de Souza Silva Garcia Ribeiro': { id: 'abelha_branca', price: 2400 },
    'Flora Bomfim Gomes': { id: 'jatai', price: 2100 },
    'Francisco Towê de Vasconcelos Crispim': { id: 'jatai', price: 2100 },
    'Gabriela Marques Cruz': { id: 'abelha_branca', price: 2400 },
    'Heitor Alencar Pinheiro Pedroza Bonfim': { id: 'urucu', price: 2200 },
    'Igor Carvalho de Sá': { id: 'urucu', price: 2200 },
    'Joaquim Alves Pires': { id: 'irai', price: 2300 },
    'Leonardo Sousa Nobrega': { id: 'urucu', price: 2200 },
    'Miguel Luiz Oliveira': { id: 'irai', price: 2300 },
    'Moana Bernardes Viana': { id: 'mandacaia_2', price: 1900 },
    'Pedro Towê de Vasconcelos Crispim': { id: 'abelha_branca', price: 2400 },
    'Radek Cordeiro Valença Rocha': { id: 'jatai', price: 2100 },
    'Rita Timo Batista de Castro Oliveira': { id: 'urucu', price: 2200 },
    'Ruda Alexandre Nunes Portugal': { id: 'mandacaia_2', price: 1900 },
    'Samuel Rodrigues e Silva': { id: 'jatai', price: 2100 },
    'Vicente Nunes Ventura': { id: 'irai', price: 2300 },
    'Alpha Kerfalla Camara': { id: 'mirim_2', price: 1700 },
    'Bento Rodrigues e Silva': { id: 'mandacaia_1', price: 1800 },
    'Estevão Vitor Godoy Guimarães': { id: 'mandacaia_1', price: 1800 },
    'Gabriel Massanaro Mendonça Amorim': { id: 'mirim_2', price: 1700 },
    'Iara Flora Teixeira do Sacramento Leite': { id: 'mirim_1', price: 1600 },
    'Julia Sousa Nobrega': { id: 'mirim_2', price: 1700 },
    'Laura Paiva Gontijo': { id: 'mirim_1', price: 1600 },
    'Sol Rosa Mattos': { id: 'mandacaia_1', price: 1800 },
    'Theo Medeiros de Melo': { id: 'mirim_1', price: 1600 },
    'Amélie Melini Silva Claudino': { id: 'mirim_2', price: 1700 },
    'Antonella Coelho Carvalho': { id: 'mirim_2', price: 1700 },
    'Clara Barberato Leite': { id: 'mirim_2', price: 1700 },
    'Dom Rodrigues Marques Maia': { id: 'mirim_2', price: 1700 },
    'Emma de Moraes Massa Melo': { id: 'mirim_2', price: 1700 },
    'Lara Alves Guimarães': { id: 'mirim_2', price: 1700 },
    'Lucca Messias de Sousa Lima': { id: 'mirim_2', price: 1700 },
    'Mateo Dourado Cardoso': { id: 'mirim_2', price: 1700 },
    'Akin Gama Vidal de Negreiros': { id: 'mandacaia_1', price: 1800 },
    'Bella Barbosa da Silveira': { id: 'mandacaia_1', price: 1800 },
    'Caetano Lopes Maniero': { id: 'mandacaia_1', price: 1800 },
    'Caio Medeiros de Melo': { id: 'mandacaia_1', price: 1800 },
    'Luzia de Almeida Pina': { id: 'mandacaia_1', price: 1800 },
    'Maya Matos Giazzon': { id: 'mandacaia_1', price: 1800 },
    'Rodrigo de Oliveira Silva': { id: 'mandacaia_1', price: 1800 },
    'Aquiles Sobreira Fernandes': { id: 'mandacaia_2', price: 1900 },
    'Dante Rodrigues Marques Maia': { id: 'mandacaia_2', price: 1900 },
    'Estevão de Moraes Massa Melo': { id: 'mandacaia_2', price: 1900 },
    'Gabriela Maria Papandrea de Almeida Vieira': { id: 'mandacaia_2', price: 1900 },
    'Leonardo Lima Moraes': { id: 'mandacaia_2', price: 1900 },
    'Maitê Marinho Catunda': { id: 'mandacaia_2', price: 1900 },
    'Bruna Almeida Fírveda': { id: 'urucu', price: 2200 },
    'Heloísa Bernardes Fortaleza': { id: 'urucu', price: 2200 },
    'Theo Barberato Leite': { id: 'urucu', price: 2200 },
    'Beatriz Martins do Espirito Santo': { id: 'irai', price: 2300 },
    'Isabela Zaida Medeiros de Souza Holanda': { id: 'irai', price: 2300 },
    'Agnes Silvério Soares Araújo': { id: 'abelha_branca', price: 2400 },
    'Helena Bernardes Fortaleza': { id: 'abelha_branca', price: 2400 },
    'Mateus Lima Castro': { id: 'abelha_branca', price: 2400 },
    'Salomão Mota Guimarães Braz Jacyntho': { id: 'abelha_branca', price: 2400 },
    'Cora de Oliveira Paes Leme': { id: 'benjoi', price: 2500 },
    'Isaac Levi Machado Vaz': { id: 'benjoi', price: 2500 },
    'Nalu Paes Leme Rodrigues': { id: 'benjoi', price: 2500 },
    'Otto Ferreira Reis': { id: 'benjoi', price: 2500 },
    'Anna Clara Resende Teixeira': { id: 'jatai', price: 2100 },
    'Athos Barbosa Xavier': { id: 'jatai', price: 2100 },
    'Helena Macedo Valim': { id: 'jatai', price: 2100 },
    'Maitê Gomes de Almeida Barros': { id: 'jatai', price: 2100 },
    'Oliver de Souza Rocha': { id: 'jatai', price: 2100 }
  };

  const enrollments: Enrollment[] = [];
  
  IMPORTED_STUDENTS.forEach((student, idx) => {
    const classInfo = mapClass[student.nome] || { id: 'jatai', price: 2100 };
    
    // Some students have known special discounts or situations in the system
    let discount = 0;
    if (student.nome === 'Beatriz Martins do Espirito Santo') discount = 50;
    if (student.nome === 'Agnes Silvério Soares Araújo') discount = 100;
    if (student.nome === 'Cora Katu Monteiro Thurler') discount = 150;
    if (student.nome === 'Dante Rodrigues Marques Maia') discount = 200;

    enrollments.push({
      id: `enroll_imp_${student.id}`,
      alunoId: student.id,
      ano: 2026,
      turmaRegularId: classInfo.id,
      valorRegularOriginal: classInfo.price,
      descontoMensal: discount,
      valorFinalRegular: classInfo.price - discount,
      statusNegociacao: idx % 3 === 0 ? 'Confirmada' : (idx % 3 === 1 ? 'Em Negociação' : 'Pendente'),
      anotacoes: 'Importado de forma segura e fidedigna através do Relatório de Turmas do Sítio-Escola Geranium.'
    });
  });

  return enrollments;
}

// Dynamically generate active contraturnos segments
export function getImportedContraturnos(): ContraturnoSegment[] {
  const contraturnos: ContraturnoSegment[] = [];

  // Marmelada students (IDs 12406, 12393, 12420, 12374, 12394, 12375, 12383, 12402, 12379, 12366, 12357, 12407, 12377, 12376, 12428, 12430, 12355, 12361, 12349)
  const marmeladaStudentIds = [
    'student_12406', 'student_12393', 'student_12420', 'student_12374',
    'student_12394', 'student_12375', 'student_12383', 'student_12402',
    'student_12379', 'student_12366', 'student_12357', 'student_12407',
    'student_12377', 'student_12376', 'student_12428', 'student_12430',
    'student_12355', 'student_12361', 'student_12349'
  ];

  marmeladaStudentIds.forEach((studentId, idx) => {
    const isParcial = idx % 2 === 0;
    const isThreeDays = idx % 3 === 0;
    const dias = isThreeDays ? ['Seg', 'Qua', 'Sex'] : ['Ter', 'Qui'] as any[];
    
    // Calculate price
    // 2 days: Parcial=550, Completo=900; 3 days: Parcial=750, Completo=1250
    const price = isThreeDays 
      ? (isParcial ? 750 : 1250) 
      : (isParcial ? 550 : 900);

    contraturnos.push({
      id: `contr_imp_${studentId}`,
      alunoId: studentId,
      natureza: 'Marmelada',
      periodo: isParcial ? 'Parcial' : 'Completo',
      diasSemana: dias,
      dataInicio: '2026-02-02',
      dataFim: null,
      valorMensal: price
    });
  });

  // Melaço students (IDs 12427, 12365, 12364, 12395, 12417, 12358, 12353, 12378)
  const melacoStudentIds = [
    'student_12427', 'student_12365', 'student_12364', 'student_12395',
    'student_12417', 'student_12358', 'student_12353', 'student_12378'
  ];

  melacoStudentIds.forEach((studentId, idx) => {
    const isParcial = idx % 2 === 0;
    const dias = isParcial ? ['Seg', 'Qua', 'Sex'] : ['Ter', 'Qui'] as any[];
    
    // 2 days: Completo=900; 3 days: Parcial=750
    const price = isParcial ? 750 : 900;

    contraturnos.push({
      id: `contr_imp_${studentId}`,
      alunoId: studentId,
      natureza: 'Melaço',
      periodo: isParcial ? 'Parcial' : 'Completo',
      diasSemana: dias,
      dataInicio: '2026-02-02',
      dataFim: null,
      valorMensal: price
    });
  });

  return contraturnos;
}
