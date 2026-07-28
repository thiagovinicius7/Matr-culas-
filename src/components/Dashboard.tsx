import React, { useState } from 'react';
import { Student, Enrollment, ContraturnoSegment } from '../types';
import { REGULAR_CLASSES, calculateAgeAtCutoff, getRegularClassForAge } from '../data';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar, ArrowRight, Search, FileText, Calculator, ClipboardList, Database, RefreshCw, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  students: Student[];
  enrollments: Enrollment[];
  contraturnos: ContraturnoSegment[];
  onNavigate: (tab: string) => void;
  onNavigateWithStudent?: (tabId: string, studentId: string) => void;
  onImportGeraniumData?: () => void;
  onClearDatabase?: () => void;
}

export default function Dashboard({ 
  students, 
  enrollments, 
  contraturnos, 
  onNavigate, 
  onNavigateWithStudent,
  onImportGeraniumData, 
  onClearDatabase 
}: DashboardProps) {
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedClassForModal, setSelectedClassForModal] = useState<{
    id: string;
    nome: string;
    natureza: string;
    idadeRef: number;
    valorMensal: number;
  } | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  const getModalClassStudents = () => {
    if (!selectedClassForModal) return [];
    const targetClassId = selectedClassForModal.id;
    const classEnrollments = enrollments.filter(e => e.turmaRegularId === targetClassId);
    return classEnrollments
      .map(e => {
        const student = students.find(s => s.id === e.alunoId);
        const activeContraturno = contraturnos.find(c => c.alunoId === e.alunoId && c.dataFim === null);
        return {
          enrollment: e,
          student,
          contraturno: activeContraturno
        };
      })
      .filter((item): item is { enrollment: Enrollment; student: Student; contraturno: ContraturnoSegment | undefined } => item.student !== undefined)
      .filter(item => {
        if (!modalSearch.trim()) return true;
        return item.student.nome.toLowerCase().includes(modalSearch.toLowerCase());
      })
      .sort((a, b) => a.student.nome.localeCompare(b.student.nome, 'pt-BR'));
  };

  // Stats calculations
  const activeStudents = students.filter(s => s.status === 'ativo');
  const totalStudentsCount = students.length;
  const activeStudentsCount = activeStudents.length;

  // Rematrícula Funnel - Filter to valid students only
  const validStudentIds = new Set(students.map(s => s.id));
  const validEnrollments = enrollments.filter(e => validStudentIds.has(e.alunoId));

  const totalEnrollments = validEnrollments.length;
  const confirmed = validEnrollments.filter(e => e.statusNegociacao === 'Confirmada').length;
  const negotiating = validEnrollments.filter(e => e.statusNegociacao === 'Em Negociação').length;
  const pending = validEnrollments.filter(e => e.statusNegociacao === 'Pendente').length;

  const confirmedPct = totalStudentsCount > 0 ? Math.min(100, Math.round((confirmed / totalStudentsCount) * 100)) : 0;
  const negotiatingPct = totalStudentsCount > 0 ? Math.round((negotiating / totalStudentsCount) * 100) : 0;
  const pendingPct = totalStudentsCount > 0 ? Math.round((pending / totalStudentsCount) * 100) : 0;

  // Monthly Revenue Estimate (Regular + Contraturnos)
  const activeContraturnos = contraturnos.filter(c => c.dataFim === null);
  const contraturnoRevenue = activeContraturnos.reduce((sum, c) => sum + c.valorMensal, 0);

  // 1) Regular revenue WITHOUT prompt payment discount (Sem Desconto de Pontualidade)
  const regularRevenueGross = enrollments
    .filter(e => e.statusNegociacao === 'Confirmada')
    .reduce((sum, e) => {
      const regularClass = REGULAR_CLASSES.find(rc => rc.id === e.turmaRegularId);
      const lancheVal = (e.adicionarLanche && regularClass?.natureza === 'Fundamental') ? (e.valorLanche || 0) : 0;
      const almocoVal = e.adicionarAlmoco ? (e.valorAlmoco || 0) : 0;
      return sum + e.valorFinalRegular + lancheVal + almocoVal;
    }, 0);

  // 2) Regular revenue WITH prompt payment discount applied (Com Desconto de Pontualidade de 3%)
  const regularRevenueWithDiscount = enrollments
    .filter(e => e.statusNegociacao === 'Confirmada')
    .reduce((sum, e) => {
      const regularClass = REGULAR_CLASSES.find(rc => rc.id === e.turmaRegularId);
      const lancheVal = (e.adicionarLanche && regularClass?.natureza === 'Fundamental') ? (e.valorLanche || 0) : 0;
      const almocoVal = e.adicionarAlmoco ? (e.valorAlmoco || 0) : 0;
      const subtotal = e.valorFinalRegular + lancheVal + almocoVal;
      const discountVal = e.descontoPontualidade ? Number((subtotal * 0.03).toFixed(2)) : 0;
      return sum + (subtotal - discountVal);
    }, 0);

  // Totals combining Regular + Contraturnos
  const totalRevenueWithoutDiscount = regularRevenueGross + contraturnoRevenue;
  const totalRevenueWithDiscount = regularRevenueWithDiscount + contraturnoRevenue;

  // Distribution by Class
  const classDistribution = REGULAR_CLASSES.map(cls => {
    const enrolledInClass = enrollments.filter(e => e.turmaRegularId === cls.id).length;
    return {
      ...cls,
      count: enrolledInClass
    };
  });

  const contraturnoOnlyCount = enrollments.filter(e => e.turmaRegularId === 'sem_regular').length;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Header with quick stats & discrete data management */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-display font-extrabold tracking-tight text-brand-green-dark">
            Painel Principal
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Visão geral da comunidade Sítio-escola: alunos, rematrículas e receitas vigentes.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Status badge */}
          {students.some(s => s.id.startsWith('student_12')) ? (
            <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded-md border border-emerald-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              67 Alunos Reais Sincronizados
            </span>
          ) : students.some(s => !s.id.startsWith('student_12')) ? (
            <span className="px-2.5 py-1.5 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase rounded-md border border-amber-200/60 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Modo Demonstração (Exemplos)
            </span>
          ) : (
            <span className="px-2.5 py-1.5 bg-slate-50 text-slate-700 text-[10px] font-bold uppercase rounded-md border border-slate-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Base Vazia
            </span>
          )}

          <div className="text-[10px] uppercase tracking-wider font-bold bg-brand-sand text-brand-green-dark px-3 py-1.5 rounded-md border border-slate-200/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
            Período Letivo: 2026
          </div>

          {/* Discrete Data controls for admin */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 ml-1">
            {students.some(s => !s.id.startsWith('student_12')) && onClearDatabase && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todos os alunos cadastrados como exemplo? Isso removerá as 8 fichas fictícias do Firebase.')) {
                    onClearDatabase();
                  }
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-100 hover:border-rose-200 transition-colors cursor-pointer"
                title="Apagar Alunos de Exemplo"
              >
                <Trash2 size={13} />
              </button>
            )}

            {onImportGeraniumData && (
              <button
                onClick={onImportGeraniumData}
                className={`px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 transition-colors cursor-pointer border ${
                  students.some(s => s.id.startsWith('student_12'))
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-brand-orange text-white border-transparent hover:bg-brand-orange-hover'
                }`}
                title={students.some(s => s.id.startsWith('student_12')) ? 'Reimportar Lista Oficial' : 'Importar Lista Oficial de Alunos'}
              >
                <Database size={12} />
                <span>{students.some(s => s.id.startsWith('student_12')) ? 'Reimportar' : 'Importar 67 Alunos Reais'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Busca Rápida de Alunos e Acesso Direto */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs p-5 space-y-4" id="quick-student-search-panel">
        <div className="flex items-center gap-2 text-brand-green-dark">
          <Search size={18} className="text-brand-orange stroke-[2.5]" />
          <h3 className="font-display font-bold text-sm uppercase tracking-wider">
            Busca Rápida de Alunos • Acesso Direto
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Pesquise por qualquer aluno para visualizar ou editar diretamente sua Ficha, calcular seu Acordo de Rematrícula ou gerenciar seus Contatos na Lista de Trabalho.
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="Digite o nome do aluno..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="w-full text-xs px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-green-light focus:ring-1 focus:ring-brand-green-light focus:outline-none bg-slate-50/50"
          />
        </div>

        {quickSearch.trim().length > 0 && (
          <div className="border border-slate-150 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
            {students
              .filter(s => s.nome.toLowerCase().includes(quickSearch.toLowerCase()))
              .slice(0, 5)
              .map(student => {
                const age = calculateAgeAtCutoff(student.nascimento, 2026);
                const regularClass = getRegularClassForAge(age);
                return (
                  <div key={student.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">{student.nome}</h4>
                      <p className="text-[10px] text-slate-500">
                        Idade: {age} anos • Turma Regular: <span className="font-semibold text-brand-green-dark">{regularClass.nome}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => onNavigateWithStudent?.('students', student.id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileText size={12} />
                        Ficha do Aluno
                      </button>
                      <button
                        onClick={() => onNavigateWithStudent?.('negotiation', student.id)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Calculator size={12} />
                        Calculadora
                      </button>
                      <button
                        onClick={() => onNavigateWithStudent?.('rematricula', student.id)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ClipboardList size={12} />
                        Lista de Trabalho
                      </button>
                    </div>
                  </div>
                );
              })}
            {students.filter(s => s.nome.toLowerCase().includes(quickSearch.toLowerCase())).length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                Nenhum aluno encontrado com "{quickSearch}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid font-display">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-center gap-4"
        >
          <div className="p-2.5 bg-emerald-50 text-brand-green-light rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total de Alunos</p>
            <h3 className="text-lg font-bold text-brand-green-dark mt-0.5">{totalStudentsCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{activeStudentsCount} ativos atualmente</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-center gap-4"
        >
          <div className="p-2.5 bg-emerald-100 text-brand-green-dark rounded-lg">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Rematrículas Confirmadas</p>
            <h3 className="text-lg font-bold text-brand-green-dark mt-0.5">{confirmed}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{confirmedPct}% do corpo discente</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-center gap-4"
        >
          <div className="p-2.5 bg-orange-50 text-brand-orange rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Em Negociação</p>
            <h3 className="text-lg font-bold text-brand-green-dark mt-0.5">{negotiating}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{negotiatingPct}% pendentes de desfecho</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-brand-clay rounded-lg shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Receita Mensal Ativa</p>
              <p className="text-[10px] text-slate-400 font-sans">Regular + Contraturnos</p>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 font-sans text-xs">
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 text-[10px] font-medium">Sem desc. pontualidade:</span>
              <span className="font-bold text-slate-800 font-mono text-xs">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenueWithoutDiscount)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
              <span className="text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Com desc. pontualidade (3%):
              </span>
              <span className="font-extrabold text-brand-green-dark font-mono text-xs">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenueWithDiscount)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Sections: Rematrícula funnel + Hive Classes list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-details">
        {/* Left Side: Rematrícula pipeline */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Funil de Rematrícula 2026
            </h3>
            <p className="text-xs text-slate-500">
              Progresso atual de renovação de contratos e matrículas regulares da escola.
            </p>
          </div>

          {/* Visual Bars */}
          <div className="space-y-4 my-auto py-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Confirmadas ({confirmed})
                </span>
                <span className="text-slate-700">{confirmedPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${confirmedPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-orange-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                  Em Negociação ({negotiating})
                </span>
                <span className="text-slate-700">{negotiatingPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${negotiatingPct}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  Não Iniciadas / Pendentes ({pending})
                </span>
                <span className="text-slate-700">{pendingPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pendingPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150">
            <button 
              onClick={() => onNavigate('rematricula')}
              className="w-full py-2 px-4 bg-brand-cream hover:bg-brand-sand text-brand-green-dark border border-brand-sand text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer font-display"
            >
              Gerenciar Lista de Rematrículas
              <ArrowRight size={14} className="text-brand-orange" />
            </button>
          </div>
        </div>

        {/* Right Side: Bees Classes catalog and distribution */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Colmeias de Aprendizado (Turmas Regulares)
            </h3>
            <p className="text-xs text-slate-500">
              Distribuição de alunos matriculados nas turmas baseadas nas espécies de abelhas nativas e idade de corte (31/03).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="classes-grid">
            {classDistribution.map((cls) => {
              const isBenjoi = cls.id === 'benjoi' || cls.nome === 'Benjoi';
              return (
                <div 
                  key={cls.id} 
                  onClick={() => setSelectedClassForModal(cls)}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer group ${
                    isBenjoi 
                      ? 'border-brand-orange bg-amber-50/70 shadow-xs ring-1 ring-brand-orange/20 hover:bg-amber-100/70 hover:shadow-sm' 
                      : 'border-slate-150 bg-slate-50 hover:bg-white hover:border-brand-green-light hover:shadow-xs'
                  }`}
                  title={`Clique para ver os alunos da turma ${cls.nome}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cls.natureza === 'Infantil' ? 'bg-brand-orange' : 'bg-brand-green-light'}`}></span>
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 font-display group-hover:text-brand-green-dark">
                        {cls.nome}
                        {isBenjoi && (
                          <span className="px-1.5 py-0.5 bg-brand-orange text-white text-[8px] font-bold uppercase rounded tracking-wider animate-pulse leading-none">
                            Benjoi
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {cls.idadeRef} anos • {cls.natureza}
                    </div>
                    <div className={`text-[10px] mt-0.5 font-bold ${isBenjoi ? 'text-brand-clay' : 'text-brand-green-light'}`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cls.valorMensal)}/mês
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end font-display">
                    <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-xs border transition-transform group-hover:scale-105 ${
                      isBenjoi ? 'bg-white border-brand-orange text-brand-orange' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {cls.count}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1 font-semibold group-hover:text-brand-orange">ver lista</span>
                  </div>
                </div>
              );
            })}

            {contraturnoOnlyCount > 0 && (
              <div 
                onClick={() => setSelectedClassForModal({ id: 'sem_regular', nome: 'Somente Contraturno', natureza: 'Isento', idadeRef: 0, valorMensal: 0 })}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 shadow-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/80 hover:border-amber-300 transition-all group"
                title="Clique para ver os alunos somente no contraturno"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="font-bold text-xs text-amber-950 font-display">
                      Somente Contraturno
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                    Sem Ensino Regular • Isento
                  </div>
                  <div className="text-[10px] mt-0.5 font-bold text-amber-900">
                    R$ 0,00/mês (Regular)
                  </div>
                </div>
                
                <div className="flex flex-col items-end font-display">
                  <span className="text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-xs border bg-white border-amber-300 text-amber-900 transition-transform group-hover:scale-105">
                    {contraturnoOnlyCount}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-800 mt-1 font-semibold group-hover:text-amber-950">ver lista</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contraturno Highlights */}
      <div className="bg-brand-green-dark text-white rounded-lg p-5 shadow-xs relative overflow-hidden border border-emerald-900/30 font-display" id="contraturno-banner">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 bg-brand-orange text-white rounded text-[9px] font-bold uppercase tracking-wider">Contraturno Escolar</span>
            <h3 className="text-base font-bold text-white font-display">Melaço (até 4 anos) & Marmelada (5+ anos)</h3>
            <p className="text-xs text-slate-300 font-sans">
              Oferecemos atividades lúdicas, vivências integradas na natureza, ateliê de artes e alimentação saudável. Atualmente com <strong className="text-brand-orange font-bold">{activeContraturnos.length} estudantes</strong> no contraturno ativo, somando {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contraturnoRevenue)} mensais.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('escala')}
            className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-md shadow-md transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer uppercase tracking-wider"
          >
            Ver Escala Semanal
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {/* Modal for Class Student List */}
      <AnimatePresence>
        {selectedClassForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-brand-green-dark text-white flex items-center justify-between border-b border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange text-white rounded-lg flex items-center justify-center shadow-xs font-bold text-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white">
                        Turma {selectedClassForModal.nome}
                      </h3>
                      <span className="px-2 py-0.5 bg-brand-orange text-white text-[10px] font-extrabold uppercase rounded-full">
                        {enrollments.filter(e => e.turmaRegularId === selectedClassForModal.id).length} Alunos
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      {selectedClassForModal.id === 'sem_regular' 
                        ? 'Estudantes matriculados exclusivamente no Contraturno'
                        : `${selectedClassForModal.idadeRef} anos • ${selectedClassForModal.natureza} • ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedClassForModal.valorMensal)}/mês`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedClassForModal(null); setModalSearch(''); }}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search inside modal */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <Search size={14} className="text-slate-400 ml-1 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar aluno nesta turma..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 font-sans"
                />
                {modalSearch && (
                  <button onClick={() => setModalSearch('')} className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold cursor-pointer">
                    Limpar
                  </button>
                )}
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
                {getModalClassStudents().length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <Users size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Nenhum aluno encontrado nesta turma.</p>
                  </div>
                ) : (
                  getModalClassStudents().map(({ student, enrollment, contraturno }, idx) => {
                    const age = calculateAgeAtCutoff(student.nascimento, 2026);
                    return (
                      <div 
                        key={student.id} 
                        className="p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs hover:border-brand-green-light transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 font-mono">{idx + 1}.</span>
                            <h4 className="text-xs font-bold text-slate-900 font-display">{student.nome}</h4>
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded">
                              Confirmada
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>Idade: <strong className="text-slate-700 font-semibold">{age} anos</strong></span>
                            {contraturno && (
                              <span className="text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 text-[10px]">
                                Contraturno: {contraturno.natureza} ({contraturno.periodo} • {contraturno.diasSemana.join(', ')})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => {
                              setSelectedClassForModal(null);
                              setModalSearch('');
                              if (onNavigateWithStudent) {
                                onNavigateWithStudent('students', student.id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-brand-cream hover:bg-brand-sand text-brand-green-dark border border-brand-sand text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="Ver Ficha do Aluno"
                          >
                            <FileText size={12} />
                            Ficha
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClassForModal(null);
                              setModalSearch('');
                              if (onNavigateWithStudent) {
                                onNavigateWithStudent('rematricula', student.id);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="Ver Acordo de Rematrícula"
                          >
                            <Calculator size={12} />
                            Acordo
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-sans">
                <span>Total no filtro: <strong className="font-semibold text-slate-800">{getModalClassStudents().length} aluno(s)</strong></span>
                <button
                  onClick={() => { setSelectedClassForModal(null); setModalSearch(''); }}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
