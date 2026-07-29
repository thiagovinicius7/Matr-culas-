import React, { useState, useMemo } from 'react';
import { Student, ContraturnoSegment, Enrollment, RegularClass } from '../types';
import { Printer, CheckSquare, Search, Filter, ArrowUpDown, RotateCcw, X, Info } from 'lucide-react';
import { normalizeClassId, REGULAR_CLASSES } from '../data';

interface ContraturnoScheduleProps {
  students: Student[];
  contraturnos: ContraturnoSegment[];
  enrollments?: Enrollment[];
  classPrices?: RegularClass[];
  onUpdateContraturnoNatureza?: (alunoId: string, segmentId: string, newNatureza: 'Melaço' | 'Marmelada') => void;
  onUpdateContraturnoDays?: (alunoId: string, segmentId: string, newDays: WeekDay[]) => void;
}

type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';

export default function ContraturnoSchedule({ 
  students, 
  contraturnos,
  enrollments = [],
  classPrices = [],
  onUpdateContraturnoNatureza,
  onUpdateContraturnoDays
}: ContraturnoScheduleProps) {
  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('semanal');
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);

  // Filters state for Matriz Geral
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterNatureza, setFilterNatureza] = useState<string>('todas');
  const [filterTurma, setFilterTurma] = useState<string>('todas');
  const [filterDia, setFilterDia] = useState<string>('todos');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'nome_asc' | 'nome_desc' | 'natureza' | 'turma' | 'valor'>('nome_asc');

  const daysOfWeek: WeekDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const dayNamesFull: Record<WeekDay, string> = {
    Seg: 'Segunda-feira',
    Ter: 'Terça-feira',
    Qua: 'Quarta-feira',
    Qui: 'Quinta-feira',
    Sex: 'Sexta-feira'
  };

  // 1) Deduplicate active contraturnos so each student appears at most ONCE
  const activeContraturnos = useMemo(() => {
    const map = new Map<string, ContraturnoSegment>();
    contraturnos.forEach(c => {
      if (c.dataFim === null) {
        map.set(c.alunoId, c);
      }
    });
    return Array.from(map.values());
  }, [contraturnos]);

  // Helper to find student details
  const getStudentInfo = (alunoId: string) => students.find(s => s.id === alunoId);

  // Helper to find student regular class name
  const getStudentRegularClass = (alunoId: string) => {
    const enr = enrollments.find(e => e.alunoId === alunoId && e.ano === 2026) || enrollments.find(e => e.alunoId === alunoId);
    if (!enr) return 'Sem Matrícula';
    if (enr.turmaRegularId === 'sem_regular') return 'Somente Contraturno';
    const cls = (classPrices.length > 0 ? classPrices : REGULAR_CLASSES).find(
      c => normalizeClassId(c.id) === normalizeClassId(enr.turmaRegularId)
    );
    return cls ? cls.nome : 'Outra';
  };

  // Horário de saída string
  const horarioSaida = (periodo: 'Parcial' | 'Completo') => periodo === 'Parcial' ? 'Saída 15h' : 'Saída 17h30';

  // Group active contraturnos by day of week, deduplicated and sorted A-Z by student name
  const getAttendeesForDay = (day: WeekDay) => {
    const seenStudentIds = new Set<string>();
    const list = activeContraturnos
      .filter(c => c.diasSemana.includes(day))
      .map(c => {
        const student = getStudentInfo(c.alunoId);
        return { segment: c, student };
      })
      .filter((item): item is { segment: ContraturnoSegment; student: Student } => {
        if (!item.student || seenStudentIds.has(item.student.id)) return false;
        seenStudentIds.add(item.student.id);
        return true;
      });

    return list.sort((a, b) => a.student.nome.localeCompare(b.student.nome, 'pt-BR'));
  };

  // Unique list of available regular classes for filtering
  const availableTurmas = useMemo(() => {
    const set = new Set<string>();
    activeContraturnos.forEach(c => {
      const regClass = getStudentRegularClass(c.alunoId);
      if (regClass) set.add(regClass);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [activeContraturnos, enrollments, classPrices]);

  // Filtered and sorted list for Matriz Geral
  const filteredAndSortedMatrix = useMemo(() => {
    return activeContraturnos
      .map(c => {
        const student = getStudentInfo(c.alunoId);
        const regularClass = getStudentRegularClass(c.alunoId);
        return { segment: c, student, regularClass };
      })
      .filter((item): item is { segment: ContraturnoSegment; student: Student; regularClass: string } => {
        if (!item.student) return false;

        // Search term
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          if (!item.student.nome.toLowerCase().includes(term)) return false;
        }

        // Natureza
        if (filterNatureza !== 'todas' && item.segment.natureza !== filterNatureza) {
          return false;
        }

        // Turma
        if (filterTurma !== 'todas' && item.regularClass !== filterTurma) {
          return false;
        }

        // Dia de semana
        if (filterDia !== 'todos' && !item.segment.diasSemana.includes(filterDia as WeekDay)) {
          return false;
        }

        // Período / Saída
        if (filterPeriodo !== 'todos' && item.segment.periodo !== filterPeriodo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nome_asc') {
          return a.student.nome.localeCompare(b.student.nome, 'pt-BR');
        }
        if (sortBy === 'nome_desc') {
          return b.student.nome.localeCompare(a.student.nome, 'pt-BR');
        }
        if (sortBy === 'natureza') {
          return a.segment.natureza.localeCompare(b.segment.natureza);
        }
        if (sortBy === 'turma') {
          return a.regularClass.localeCompare(b.regularClass, 'pt-BR');
        }
        if (sortBy === 'valor') {
          return b.segment.valorMensal - a.segment.valorMensal;
        }
        return 0;
      });
  }, [activeContraturnos, students, enrollments, classPrices, searchTerm, filterNatureza, filterTurma, filterDia, filterPeriodo, sortBy]);

  const hasActiveFilters = searchTerm !== '' || filterNatureza !== 'todas' || filterTurma !== 'todas' || filterDia !== 'todos' || filterPeriodo !== 'todos' || sortBy !== 'nome_asc';

  const resetFilters = () => {
    setSearchTerm('');
    setFilterNatureza('todas');
    setFilterTurma('todas');
    setFilterDia('todos');
    setFilterPeriodo('todos');
    setSortBy('nome_asc');
  };

  // Print schedule helper
  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 300);
  };

  if (isPrintMode) {
    return (
      <div className="p-6 bg-white text-black min-h-screen" id="print-view">
        <div className="text-center pb-4 border-b border-slate-300 mb-4">
          <h1 className="text-lg font-bold uppercase tracking-wide">Sítio-escola — Escala de Contraturno</h1>
          <p className="text-[10px] font-mono mt-0.5">Impresso em {new Date().toLocaleDateString('pt-BR')} • Período: 2026</p>
        </div>

        {viewMode === 'semanal' ? (
          /* WEEKLY PRINT MATRIX */
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Escala Semanal de Presença</h2>
            <div className="grid grid-cols-5 gap-2 border border-slate-300 divide-x divide-slate-300">
              {daysOfWeek.map(day => {
                const attendees = getAttendeesForDay(day);
                const melaco = attendees.filter(a => a.segment.natureza === 'Melaço');
                const marmelada = attendees.filter(a => a.segment.natureza === 'Marmelada');

                return (
                  <div key={day} className="p-2 space-y-2">
                    <div className="border-b border-slate-300 pb-1">
                      <h3 className="font-bold text-xs text-center">{dayNamesFull[day]}</h3>
                      <p className="text-[9px] text-center font-mono font-bold">Total: {attendees.length}</p>
                    </div>

                    {/* Melaço group */}
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-bold uppercase border-b border-dashed border-slate-300">Melaço</h4>
                      {melaco.map(a => (
                        <div key={a.segment.id} className="text-[9px] font-medium">
                          • {a.student?.nome}{a.segment.periodo === 'Parcial' ? ' *' : ''}
                        </div>
                      ))}
                      {melaco.length === 0 && <p className="text-[9px] italic text-slate-400">Ninguém</p>}
                    </div>

                    {/* Marmelada group */}
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-bold uppercase border-b border-dashed border-slate-300">Marmelada</h4>
                      {marmelada.map(a => (
                        <div key={a.segment.id} className="text-[9px] font-medium">
                          • {a.student?.nome}{a.segment.periodo === 'Parcial' ? ' *' : ''}
                        </div>
                      ))}
                      {marmelada.length === 0 && <p className="text-[9px] italic text-slate-400">Ninguém</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] italic text-slate-600 mt-2">* Crianças com saída antecipada às 15h (Parcial). As demais saem às 17h30.</p>
          </div>
        ) : (
          /* MONTHLY MATRIX PRINT */
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">Matriz Geral do Contraturno</h2>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300 text-[10px] font-bold font-mono">
                    <th className="p-2 border-r border-slate-300">Estudante</th>
                    <th className="p-2 border-r border-slate-300">Turma Regular</th>
                    <th className="p-2 border-r border-slate-300">Grupo</th>
                    <th className="p-2 border-r border-slate-300 text-center">Seg</th>
                    <th className="p-2 border-r border-slate-300 text-center">Ter</th>
                    <th className="p-2 border-r border-slate-300 text-center">Qua</th>
                    <th className="p-2 border-r border-slate-300 text-center">Qui</th>
                    <th className="p-2 border-r border-slate-300 text-center">Sex</th>
                    <th className="p-2 text-center">Saída</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-[10px]">
                  {filteredAndSortedMatrix.map(({ segment: c, student, regularClass }) => {
                    return (
                      <tr key={c.id}>
                        <td className="p-2 border-r border-slate-300 font-semibold">
                          {student.nome}{c.periodo === 'Parcial' ? ' *' : ''}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">{regularClass}</td>
                        <td className="p-2 border-r border-slate-300">{c.natureza}</td>
                        {daysOfWeek.map(day => (
                          <td key={day} className="p-2 border-r border-slate-300 text-center font-mono">
                            {c.diasSemana.includes(day) ? 'X' : ''}
                          </td>
                        ))}
                        <td className="p-2 text-center font-medium">{horarioSaida(c.periodo)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] italic text-slate-600 mt-2">* Crianças com saída antecipada às 15h (Parcial).</p>
          </div>
        )}

        <div className="mt-8 text-center text-[9px] border-t border-slate-300 pt-2">
          <p>Documento de circulação interna — Sítio-escola</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="schedule-dashboard">
      {/* Header and print button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            Escalas de Frequência do Contraturno
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe a lista de alunos presentes por dia e emita relatórios amigáveis para impressão.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('semanal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                viewMode === 'semanal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semanal (Diário)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mensal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                viewMode === 'mensal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Matriz Geral
            </button>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            title="Imprimir Escala do Contraturno"
          >
            <Printer size={13} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Dynamic Views */}
      {viewMode === 'semanal' ? (
        <div className="space-y-3">
          {/* Legend Banner */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-2.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong className="text-amber-900 font-bold">* Asterisco (*):</strong> Crianças com saída antecipada às 15h (Parcial). As demais saem às 17h30.
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Altere a turma (Melaço / Marmelada) no próprio card do aluno ou na Matriz Geral.
            </span>
          </div>

          {/* WEEKLY DIARY COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3" id="weekly-columns-container">
            {daysOfWeek.map((day) => {
              const attendees = getAttendeesForDay(day);
              const melaco = attendees.filter(a => a.segment.natureza === 'Melaço');
              const marmelada = attendees.filter(a => a.segment.natureza === 'Marmelada');

              return (
                <div 
                  key={day} 
                  className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[380px]"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-200 text-center space-y-0.5">
                    <h4 className="font-sans font-bold text-slate-800 text-xs">{dayNamesFull[day]}</h4>
                    <span className="inline-block text-[9px] uppercase tracking-wide font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      {attendees.length} {attendees.length === 1 ? 'aluno' : 'alunos'}
                    </span>
                  </div>

                  <div className="p-3 space-y-4 flex-1 divide-y divide-slate-150">
                    {/* Melaço block (under 4) */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-slate-700 tracking-wider flex items-center justify-between bg-slate-100 px-2 py-0.5 rounded">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Melaço (Até 4)
                        </span>
                        <span>({melaco.length})</span>
                      </span>
                      <div className="space-y-1">
                        {melaco.map(({ segment, student }) => (
                          <div key={segment.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-2xs transition-all flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-slate-800 block leading-tight">
                              {student?.nome}
                              {segment.periodo === 'Parcial' && (
                                <span className="text-amber-600 font-extrabold ml-1" title="Saída às 15h (Parcial)">*</span>
                              )}
                            </span>

                            {onUpdateContraturnoNatureza && (
                              <select
                                value={segment.natureza}
                                onChange={(e) => onUpdateContraturnoNatureza(student.id, segment.id, e.target.value as 'Melaço' | 'Marmelada')}
                                className="text-[9px] font-bold px-1 py-0.2 rounded border border-slate-200 bg-white text-slate-600 cursor-pointer hover:border-orange-400 focus:outline-none shrink-0"
                                title="Trocar turma de contraturno"
                              >
                                <option value="Melaço">Melaço</option>
                                <option value="Marmelada">Marmelada</option>
                              </select>
                            )}
                          </div>
                        ))}
                        {melaco.length === 0 && (
                          <p className="text-[10px] text-slate-400 italic text-center py-2">Nenhum ativo.</p>
                        )}
                      </div>
                    </div>

                    {/* Marmelada block (5+) */}
                    <div className="space-y-1.5 pt-3">
                      <span className="text-[9px] uppercase font-bold text-slate-700 tracking-wider flex items-center justify-between bg-slate-100 px-2 py-0.5 rounded">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Marmelada (5+)
                        </span>
                        <span>({marmelada.length})</span>
                      </span>
                      <div className="space-y-1">
                        {marmelada.map(({ segment, student }) => (
                          <div key={segment.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-2xs transition-all flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-slate-800 block leading-tight">
                              {student?.nome}
                              {segment.periodo === 'Parcial' && (
                                <span className="text-amber-600 font-extrabold ml-1" title="Saída às 15h (Parcial)">*</span>
                              )}
                            </span>

                            {onUpdateContraturnoNatureza && (
                              <select
                                value={segment.natureza}
                                onChange={(e) => onUpdateContraturnoNatureza(student.id, segment.id, e.target.value as 'Melaço' | 'Marmelada')}
                                className="text-[9px] font-bold px-1 py-0.2 rounded border border-slate-200 bg-white text-slate-600 cursor-pointer hover:border-orange-400 focus:outline-none shrink-0"
                                title="Trocar turma de contraturno"
                              >
                                <option value="Melaço">Melaço</option>
                                <option value="Marmelada">Marmelada</option>
                              </select>
                            )}
                          </div>
                        ))}
                        {marmelada.length === 0 && (
                          <p className="text-[10px] text-slate-400 italic text-center py-2">Nenhum ativo.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GENERAL MATRIX / CHECKLIST VIEW WITH ADVANCED FILTERS */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden" id="matrix-checklist-view">
          {/* Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <CheckSquare size={14} className="text-orange-500" />
                Matriz Geral de Presenças do Contraturno
              </h3>
              <p className="text-[10px] text-slate-500">Grade completa de presenças, turmas e opções de filtragem</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              Exibindo {filteredAndSortedMatrix.length} de {activeContraturnos.length} alunos
            </span>
          </div>

          {/* FILTER TOOLBAR */}
          <div className="p-3 bg-slate-100/70 border-b border-slate-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              {/* Search by name */}
              <div className="relative lg:col-span-2">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-800"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter by Turma Regular */}
              <div>
                <select
                  value={filterTurma}
                  onChange={(e) => setFilterTurma(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-800 font-medium"
                >
                  <option value="todas">Todas as Turmas Regulares</option>
                  {availableTurmas.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Contraturno Natureza */}
              <div>
                <select
                  value={filterNatureza}
                  onChange={(e) => setFilterNatureza(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-800 font-medium"
                >
                  <option value="todas">Todos os Grupos</option>
                  <option value="Melaço">Melaço (Até 4)</option>
                  <option value="Marmelada">Marmelada (5+)</option>
                </select>
              </div>

              {/* Filter by Day */}
              <div>
                <select
                  value={filterDia}
                  onChange={(e) => setFilterDia(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-slate-800 font-medium"
                >
                  <option value="todos">Todos os Dias</option>
                  <option value="Seg">Segunda-feira</option>
                  <option value="Ter">Terça-feira</option>
                  <option value="Qua">Quarta-feira</option>
                  <option value="Qui">Quinta-feira</option>
                  <option value="Sex">Sexta-feira</option>
                </select>
              </div>

              {/* Sort selector */}
              <div>
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                  <ArrowUpDown size={12} className="text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="nome_asc">Nome (A - Z)</option>
                    <option value="nome_desc">Nome (Z - A)</option>
                    <option value="turma">Por Turma Regular</option>
                    <option value="natureza">Por Grupo Contraturno</option>
                    <option value="valor">Por Valor Mensal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clear filters trigger if active */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Filter size={11} className="text-orange-500" />
                  Filtros ativos no momento
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-orange-600 hover:text-orange-800 text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw size={11} />
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Estudante</th>
                  <th className="p-3">Turma Regular</th>
                  <th className="p-3">Grupo Contraturno</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="p-3 text-center">{day}</th>
                  ))}
                  <th className="p-3 text-center">Frequência</th>
                  <th className="p-3 text-center">Saída</th>
                  <th className="p-3 text-right">Valor Mensal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {filteredAndSortedMatrix.map(({ segment: c, student, regularClass }) => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {student.nome}
                        {c.periodo === 'Parcial' && (
                          <span className="text-amber-600 font-extrabold ml-1" title="Saída às 15h (Parcial)">*</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                          {regularClass}
                        </span>
                      </td>
                      <td className="p-3">
                        {onUpdateContraturnoNatureza ? (
                          <select
                            value={c.natureza}
                            onChange={(e) => onUpdateContraturnoNatureza(student.id, c.id, e.target.value as 'Melaço' | 'Marmelada')}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer focus:outline-none ${
                              c.natureza === 'Melaço' 
                                ? 'bg-orange-100 text-orange-900 border-orange-300 hover:bg-orange-200' 
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                            }`}
                            title="Clique para alterar a turma do contraturno"
                          >
                            <option value="Melaço">Melaço (Até 4)</option>
                            <option value="Marmelada">Marmelada (5+)</option>
                          </select>
                        ) : (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            c.natureza === 'Melaço' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {c.natureza}
                          </span>
                        )}
                      </td>
                      {daysOfWeek.map(day => {
                        const attends = c.diasSemana.includes(day);
                        return (
                          <td key={day} className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (!onUpdateContraturnoDays) return;
                                const current = c.diasSemana || [];
                                let updatedDays: WeekDay[];
                                if (current.includes(day)) {
                                  if (current.length === 1) return; // Keep at least 1 day
                                  updatedDays = current.filter(d => d !== day);
                                } else {
                                  updatedDays = [...current, day];
                                }
                                const sortedDays = daysOfWeek.filter(d => updatedDays.includes(d));
                                onUpdateContraturnoDays(student.id, c.id, sortedDays);
                              }}
                              disabled={!onUpdateContraturnoDays}
                              title={onUpdateContraturnoDays ? (attends ? `Clique para remover ${day}` : `Clique para incluir ${day}`) : undefined}
                              className={`w-6 h-6 rounded inline-flex items-center justify-center font-bold text-xs transition-all ${
                                onUpdateContraturnoDays ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                              } ${
                                attends 
                                  ? 'bg-emerald-600 text-white border border-emerald-600 shadow-2xs hover:bg-emerald-700' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 hover:text-slate-600'
                              }`}
                            >
                              {attends ? '✓' : '•'}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-bold text-slate-500 text-[11px]">{c.diasSemana.length}x / sem</td>
                      <td className="p-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {horarioSaida(c.periodo)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valorMensal)}
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSortedMatrix.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-slate-400 space-y-2">
                      <p className="font-semibold text-sm">Nenhum aluno encontrado com os filtros selecionados.</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw size={12} />
                          Limpar Filtros
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
