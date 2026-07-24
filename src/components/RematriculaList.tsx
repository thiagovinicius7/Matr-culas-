import React, { useState, useEffect } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, RegularClass, ContraturnoPrice } from '../types';
import { REGULAR_CLASSES, getContraturnoPriceDynamic } from '../data';
import { CheckCircle, Clock, AlertCircle, Phone, Search, Save, MessageSquare, Copy, Edit2, Check, X } from 'lucide-react';
import { motion } from 'motion/react';

interface RematriculaListProps {
  students: Student[];
  guardians: Guardian[];
  enrollments: Enrollment[];
  contraturnos: ContraturnoSegment[];
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  preselectedStudentId?: string;
  onUpdateEnrollmentStatus: (alunoId: string, status: Enrollment['statusNegociacao']) => void;
  onUpdateEnrollmentNotes: (alunoId: string, notes: string) => void;
  onUpdateEnrollmentDiscounts: (alunoId: string, discountRegular: number, discountContraturno: number) => void;
}

export default function RematriculaList({
  students,
  guardians,
  enrollments,
  contraturnos,
  classPrices,
  contraturnoPrices,
  preselectedStudentId,
  onUpdateEnrollmentStatus,
  onUpdateEnrollmentNotes,
  onUpdateEnrollmentDiscounts
}: RematriculaListProps) {
  const [filterStatus, setFilterStatus] = useState<'Todas' | 'Pendente' | 'Em Negociação' | 'Confirmada'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [tempDiscountRegular, setTempDiscountRegular] = useState<number>(0);
  const [tempDiscountContraturno, setTempDiscountContraturno] = useState<number>(0);

  useEffect(() => {
    if (preselectedStudentId) {
      const student = students.find(s => s.id === preselectedStudentId);
      if (student) {
        setSearchQuery(student.nome);
      }
    }
  }, [preselectedStudentId, students]);
  const [editingNotesStudentId, setEditingNotesStudentId] = useState<string | null>(null);
  const [tempNotesValue, setTempNotesValue] = useState('');

  // Available enrollment years
  const availableYears = Array.from(new Set([2026, ...enrollments.map(e => e.ano)])).sort((a, b) => a - b);

  // Filter enrollments by selected year
  const yearEnrollments = enrollments.filter(e => e.ano === selectedYear);

  // Counter summary
  const total = yearEnrollments.length;
  const confirmed = yearEnrollments.filter(e => e.statusNegociacao === 'Confirmada').length;
  const negotiating = yearEnrollments.filter(e => e.statusNegociacao === 'Em Negociação').length;
  const pending = yearEnrollments.filter(e => e.statusNegociacao === 'Pendente').length;

  // Process list with student and guardian joins
  const rematriculaData = yearEnrollments.map(e => {
    const student = students.find(s => s.id === e.alunoId);
    const financialGuardian = guardians.find(g => g.alunoId === e.alunoId && g.financeiro);
    const regularClass = classPrices.find(rc => rc.id === e.turmaRegularId) || REGULAR_CLASSES.find(rc => rc.id === e.turmaRegularId);
    
    // Check if they have an active contraturno
    const activeCont = contraturnos.find(c => c.alunoId === e.alunoId && c.dataFim === null);
    const totalNegotiatedMonthly = e.valorFinalRegular + (activeCont ? activeCont.valorMensal : 0);

    return {
      enrollment: e,
      student,
      guardian: financialGuardian,
      regularClass,
      activeContraturno: activeCont,
      totalNegotiatedMonthly
    };
  });

  // Apply filters
  const filteredData = rematriculaData.filter(item => {
    if (!item.student) return false;
    
    const matchesSearch = 
      item.student.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.guardian?.nome || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todas' || item.enrollment.statusNegociacao === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStartEditingNotes = (alunoId: string, currentNotes: string) => {
    setEditingNotesStudentId(alunoId);
    setTempNotesValue(currentNotes);
  };

  const handleSaveNotes = (alunoId: string) => {
    onUpdateEnrollmentNotes(alunoId, tempNotesValue);
    setEditingNotesStudentId(null);
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Contato copiado para a área de transferência!');
  };

  return (
    <div className="space-y-4" id="rematricula-workspace">
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            Lista de Trabalho de Rematrícula
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie o contato com pais, acompanhe acordos comerciais, salve observações e controle o status da rematrícula.
          </p>
        </div>
      </div>

      {/* Funnel indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="rematricula-counters">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Geral</span>
          <span className="text-xl font-bold text-slate-800">{total}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Confirmadas</span>
          <span className="text-xl font-bold text-emerald-800">{confirmed}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block">Em Negociação</span>
          <span className="text-xl font-bold text-orange-700">{negotiating}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-xs">
          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Pendentes</span>
          <span className="text-xl font-bold text-rose-700">{pending}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        {/* Filter buttons */}
        <div className="flex gap-1 flex-wrap">
          {(['Todas', 'Confirmada', 'Em Negociação', 'Pendente'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'Todas' ? 'Todas' : status}
            </button>
          ))}
        </div>

        {/* Right tools: Year Selector & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 font-bold focus:outline-none cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[240px]">
            <Search size={13} className="absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por aluno ou pai/mãe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Worklist Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden" id="rematricula-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Estudante & Turma</th>
                <th className="p-3">Responsável Financeiro</th>
                <th className="p-3">Preço Base vs. Negociado</th>
                <th className="p-3">Anotações</th>
                <th className="p-3 text-center">Status & Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
              {filteredData.map(({ enrollment, student, guardian, regularClass, activeContraturno, totalNegotiatedMonthly }) => {
                if (!student) return null;
                const isEditingThisNotes = editingNotesStudentId === student.id;

                return (
                  <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Student Column */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block">{student.nome}</span>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[9px] bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.2 rounded font-mono font-bold">
                            {regularClass?.nome}
                          </span>
                          {activeContraturno && (
                            <span className="text-[9px] bg-orange-50 text-orange-800 border border-orange-200 px-1.5 py-0.2 rounded font-semibold">
                              + Contraturno ({activeContraturno.natureza})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Financial Guardian Column */}
                    <td className="p-3">
                      {guardian ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-850">{guardian.nome}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">({guardian.parentesco})</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                            <Phone size={11} className="text-slate-400" />
                            <span>{guardian.contato}</span>
                            <button
                              onClick={() => handleCopyContact(guardian.contato)}
                              className="p-0.5 hover:bg-slate-150 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Copiar contato"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não cadastrado</span>
                      )}
                    </td>

                    {/* Price Comparison Column */}
                    <td className="p-3">
                      {editingDiscountId === enrollment.id ? (
                        <div className="space-y-2 p-2 bg-slate-50 border border-slate-200 rounded-md max-w-[200px]" id={`discount-editor-${enrollment.id}`}>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Desc. Regular (R$)</label>
                            <input
                              type="number"
                              min="0"
                              max={enrollment.valorRegularOriginal}
                              value={tempDiscountRegular}
                              onChange={(e) => setTempDiscountRegular(Number(e.target.value))}
                              className="w-full text-xs font-mono px-2 py-0.5 border border-slate-200 rounded bg-white"
                            />
                          </div>

                          {activeContraturno && (
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Desc. Contraturno (R$)</label>
                              <input
                                type="number"
                                min="0"
                                value={tempDiscountContraturno}
                                onChange={(e) => setTempDiscountContraturno(Number(e.target.value))}
                                className="w-full text-xs font-mono px-2 py-0.5 border border-slate-200 rounded bg-white"
                              />
                            </div>
                          )}

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              onClick={() => setEditingDiscountId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 cursor-pointer"
                              title="Cancelar"
                            >
                              <X size={10} />
                            </button>
                            <button
                              onClick={() => {
                                onUpdateEnrollmentDiscounts(student.id, tempDiscountRegular, tempDiscountContraturno);
                                setEditingDiscountId(null);
                              }}
                              className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 cursor-pointer"
                              title="Salvar"
                            >
                              <Check size={10} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5 group">
                          <div className="flex justify-between max-w-[150px] text-[10px] text-slate-400">
                            <span>Base Regular:</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(enrollment.valorRegularOriginal)}</span>
                          </div>
                          {enrollment.descontoMensal > 0 && (
                            <div className="flex justify-between max-w-[150px] text-[10px] text-rose-500">
                              <span>Desc. Regular:</span>
                              <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(enrollment.descontoMensal)}</span>
                            </div>
                          )}
                          {activeContraturno && (
                            <div className="flex justify-between max-w-[150px] text-[10px] text-slate-400">
                              <span>Base Contraturno:</span>
                              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                getContraturnoPriceDynamic(activeContraturno.diasSemana.length, activeContraturno.periodo, contraturnoPrices)
                              )}</span>
                            </div>
                          )}
                          {activeContraturno && (enrollment.descontoContraturno || 0) > 0 && (
                            <div className="flex justify-between max-w-[150px] text-[10px] text-rose-500">
                              <span>Desc. Contraturno:</span>
                              <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(enrollment.descontoContraturno || 0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center max-w-[150px] font-bold text-slate-900 text-xs">
                            <span>Total Mensal:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalNegotiatedMonthly)}</span>
                              <button
                                onClick={() => {
                                  setEditingDiscountId(enrollment.id);
                                  setTempDiscountRegular(enrollment.descontoMensal);
                                  setTempDiscountContraturno(enrollment.descontoContraturno || 0);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                                title="Editar descontos"
                              >
                                <Edit2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Annotations Column */}
                    <td className="p-3 max-w-[250px]">
                      {isEditingThisNotes ? (
                        <div className="flex gap-1.5 items-center">
                          <textarea
                            value={tempNotesValue}
                            onChange={(e) => setTempNotesValue(e.target.value)}
                            className="w-full border border-slate-200 rounded-md p-1.5 text-xs focus:border-slate-500 focus:outline-none bg-white"
                            rows={2}
                          />
                          <button
                            onClick={() => handleSaveNotes(student.id)}
                            className="p-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer"
                            title="Salvar anotação"
                          >
                            <Save size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-start gap-1.5">
                          <p className="text-slate-600 line-clamp-2 text-xs">
                            {enrollment.anotacoes || <span className="text-slate-400 italic">Nenhuma anotação registrada.</span>}
                          </p>
                          <button
                            onClick={() => handleStartEditingNotes(student.id, enrollment.anotacoes)}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                            title="Editar anotação"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Action & Status Column */}
                    <td className="p-3">
                      <div className="flex flex-col items-center gap-1.5">
                        {/* Status badge */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          enrollment.statusNegociacao === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' :
                          enrollment.statusNegociacao === 'Em Negociação' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {enrollment.statusNegociacao}
                        </span>

                        {/* Quick toggle bar */}
                        <div className="flex border border-slate-200 rounded-md overflow-hidden shrink-0">
                          {(['Pendente', 'Em Negociação', 'Confirmada'] as const).map(st => {
                            const active = enrollment.statusNegociacao === st;
                            return (
                              <button
                                key={st}
                                onClick={() => onUpdateEnrollmentStatus(student.id, st)}
                                className={`px-2 py-1 text-[9px] font-bold transition-colors cursor-pointer ${
                                  active 
                                    ? st === 'Confirmada' ? 'bg-emerald-600 text-white' : st === 'Em Negociação' ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'
                                    : 'bg-white hover:bg-slate-50 text-slate-500'
                                }`}
                                title={`Mudar para ${st}`}
                              >
                                {st === 'Em Negociação' ? 'Negociando' : st === 'Confirmada' ? 'Confirmar' : 'Pendente'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                    Nenhuma rematrícula corresponde aos filtros de busca aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
