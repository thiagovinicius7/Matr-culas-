import React from 'react';
import { Student, Enrollment, ContraturnoSegment } from '../types';
import { REGULAR_CLASSES } from '../data';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  students: Student[];
  enrollments: Enrollment[];
  contraturnos: ContraturnoSegment[];
  onNavigate: (tab: string) => void;
  onImportGeraniumData?: () => void;
  onClearDatabase?: () => void;
}

export default function Dashboard({ students, enrollments, contraturnos, onNavigate, onImportGeraniumData, onClearDatabase }: DashboardProps) {
  // Stats calculations
  const activeStudents = students.filter(s => s.status === 'ativo');
  const totalStudentsCount = students.length;
  const activeStudentsCount = activeStudents.length;

  // Rematrícula Funnel
  const totalEnrollments = enrollments.length;
  const confirmed = enrollments.filter(e => e.statusNegociacao === 'Confirmada').length;
  const negotiating = enrollments.filter(e => e.statusNegociacao === 'Em Negociação').length;
  const pending = enrollments.filter(e => e.statusNegociacao === 'Pendente').length;

  const confirmedPct = totalEnrollments > 0 ? Math.round((confirmed / totalEnrollments) * 100) : 0;
  const negotiatingPct = totalEnrollments > 0 ? Math.round((negotiating / totalEnrollments) * 100) : 0;
  const pendingPct = totalEnrollments > 0 ? Math.round((pending / totalEnrollments) * 100) : 0;

  // Monthly Revenue Estimate
  const regularRevenue = enrollments
    .filter(e => e.statusNegociacao === 'Confirmada')
    .reduce((sum, e) => sum + e.valorFinalRegular, 0);

  const activeContraturnos = contraturnos.filter(c => c.dataFim === null);
  const contraturnoRevenue = activeContraturnos.reduce((sum, c) => sum + c.valorMensal, 0);
  const totalRevenue = regularRevenue + contraturnoRevenue;

  // Distribution by Class
  const classDistribution = REGULAR_CLASSES.map(cls => {
    const enrolledInClass = enrollments.filter(e => e.turmaRegularId === cls.id).length;
    return {
      ...cls,
      count: enrolledInClass
    };
  });

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Header with quick stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold tracking-tight text-brand-green-dark">
            Painel Principal
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Visão geral da comunidade Sítio-escola: alunos, rematrículas e receitas vigentes.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-wider font-bold bg-brand-sand text-brand-green-dark px-3 py-1.5 rounded-md border border-slate-200/60 flex items-center gap-2 self-start md:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
          Período Letivo: 2026
        </div>
      </div>

      {/* Ferramenta de Importação e Gestão de Alunos */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs"
        id="data-management-panel"
      >
        <div className="bg-brand-green-dark px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-orange stroke-[2.5]" />
            <span className="font-display font-bold text-xs uppercase tracking-wider">
              Ferramenta de Importação e Gestão de Alunos
            </span>
          </div>
          <span className="text-[9px] bg-brand-orange text-white px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
            Sítio Geranium
          </span>
        </div>
        
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h4 className="text-sm font-bold text-slate-800 font-display flex flex-wrap items-center gap-2">
              Controle de Dados da Base de Alunos
              {students.some(s => s.id.startsWith('student_12')) ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded-md tracking-wider">
                  Sincronizado (67 Alunos Reais)
                </span>
              ) : students.some(s => !s.id.startsWith('student_12')) ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold uppercase rounded-md tracking-wider animate-pulse">
                  Modo de Demonstração (Alunos Exemplo)
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold uppercase rounded-md tracking-wider">
                  Base de Dados Vazia
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              {students.some(s => s.id.startsWith('student_12')) ? (
                <span>Sua base de dados do Firebase está sincronizada com os <strong>67 alunos ativos</strong> importados do Relatório de Turmas oficial do Sítio-Escola Geranium. Todas as colmeias, responsáveis e contraturnos estão cadastrados em tempo real.</span>
              ) : students.some(s => !s.id.startsWith('student_12')) ? (
                <span>A base de dados possui alunos de exemplo pré-cadastrados para demonstração. Para utilizar o sistema com a base real do Sítio-Escola Geranium, <strong>apague os alunos de exemplo</strong> e importe a lista oficial com os 67 alunos reais.</span>
              ) : (
                <span>O banco de dados do Firebase está limpo e vazio. Clique no botão ao lado para realizar a importação automática de toda a base de <strong>67 alunos oficiais</strong> com seus respectivos responsáveis e turmas.</span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            {students.some(s => !s.id.startsWith('student_12')) && onClearDatabase && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todos os alunos cadastrados como exemplo? Isso removerá as 8 fichas fictícias do Firebase.')) {
                    onClearDatabase();
                  }
                }}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold rounded-lg border border-red-200/60 transition-colors cursor-pointer uppercase tracking-wider font-display"
              >
                Apagar Exemplos
              </button>
            )}
            
            {onImportGeraniumData && (
              <button
                onClick={onImportGeraniumData}
                className={`py-2 px-4 text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider font-display ${
                  students.some(s => s.id.startsWith('student_12'))
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-brand-orange hover:bg-brand-orange-hover'
                }`}
              >
                {students.some(s => s.id.startsWith('student_12')) ? 'Reimportar Lista' : 'Importar 67 Alunos Reais'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

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
          className="bg-white p-4 rounded-lg border border-slate-150 shadow-xs flex items-center gap-4"
        >
          <div className="p-2.5 bg-orange-100 text-brand-clay rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Receita Mensal Ativa</p>
            <h3 className="text-lg font-bold text-brand-green-dark mt-0.5">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Regular + Contraturnos</p>
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
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isBenjoi 
                      ? 'border-brand-orange bg-amber-50/70 shadow-xs ring-1 ring-brand-orange/20' 
                      : 'border-slate-150 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cls.natureza === 'Infantil' ? 'bg-brand-orange' : 'bg-brand-green-light'}`}></span>
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 font-display">
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
                    <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-xs border ${
                      isBenjoi ? 'bg-white border-brand-orange text-brand-orange' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {cls.count}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">alunos</span>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}
