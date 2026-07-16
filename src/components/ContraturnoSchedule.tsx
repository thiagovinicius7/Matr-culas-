import React, { useState } from 'react';
import { Student, ContraturnoSegment } from '../types';
import { Printer, Calendar, ListFilter, Users, CheckSquare, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ContraturnoScheduleProps {
  students: Student[];
  contraturnos: ContraturnoSegment[];
}

type WeekDay = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';

export default function ContraturnoSchedule({ students, contraturnos }: ContraturnoScheduleProps) {
  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('semanal');
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);

  const activeContraturnos = contraturnos.filter(c => c.dataFim === null);

  const daysOfWeek: WeekDay[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const dayNamesFull: Record<WeekDay, string> = {
    Seg: 'Segunda-feira',
    Ter: 'Terça-feira',
    Qua: 'Quarta-feira',
    Qui: 'Quinta-feira',
    Sex: 'Sexta-feira'
  };

  // Helper to find student details
  const getStudentInfo = (alunoId: string) => students.find(s => s.id === alunoId);

  // Group active contraturnos by day of week
  const getAttendeesForDay = (day: WeekDay) => {
    return activeContraturnos
      .filter(c => c.diasSemana.includes(day))
      .map(c => {
        const student = getStudentInfo(c.alunoId);
        return {
          segment: c,
          student
        };
      })
      .filter(item => item.student !== undefined);
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
                        <div key={a.segment.id} className="text-[9px]">
                          <span className="font-medium">• {a.student?.nome.split(' ')[0]}</span>
                        </div>
                      ))}
                      {melaco.length === 0 && <p className="text-[9px] italic text-slate-400">Ninguém</p>}
                    </div>

                    {/* Marmelada group */}
                    <div className="space-y-1">
                      <h4 className="text-[9px] font-bold uppercase border-b border-dashed border-slate-300">Marmelada</h4>
                      {marmelada.map(a => (
                        <div key={a.segment.id} className="text-[9px]">
                          <span className="font-medium">• {a.student?.nome.split(' ')[0]}</span>
                        </div>
                      ))}
                      {marmelada.length === 0 && <p className="text-[9px] italic text-slate-400">Ninguém</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MONTHLY MATRIX PRINT */
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">Grade Geral do Contraturno</h2>
            <table className="w-full text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300 text-[10px] font-bold font-mono">
                  <th className="p-2 border-r border-slate-300">Estudante</th>
                  <th className="p-2 border-r border-slate-300">Grupo</th>
                  <th className="p-2 border-r border-slate-300 text-center">Seg</th>
                  <th className="p-2 border-r border-slate-300 text-center">Ter</th>
                  <th className="p-2 border-r border-slate-300 text-center">Qua</th>
                  <th className="p-2 border-r border-slate-300 text-center">Qui</th>
                  <th className="p-2 border-r border-slate-300 text-center">Sex</th>
                  <th className="p-2 text-center">Período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[10px]">
                {activeContraturnos.map(c => {
                  const student = getStudentInfo(c.alunoId);
                  if (!student) return null;
                  return (
                    <tr key={c.id}>
                      <td className="p-2 border-r border-slate-300 font-semibold">{student.nome}</td>
                      <td className="p-2 border-r border-slate-300">{c.natureza}</td>
                      {daysOfWeek.map(day => (
                        <td key={day} className="p-2 border-r border-slate-300 text-center font-mono">
                          {c.diasSemana.includes(day) ? 'X' : ''}
                        </td>
                      ))}
                      <td className="p-2 text-center font-medium">{c.periodo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              onClick={() => setViewMode('semanal')}
              className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                viewMode === 'semanal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Semanal (Diário)
            </button>
            <button
              onClick={() => setViewMode('mensal')}
              className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                viewMode === 'mensal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Matriz Geral
            </button>
          </div>

          {/* Print button */}
          <button
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
        /* WEEKLY DIARY COLUMNS */
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
                    <span className="text-[9px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1 bg-slate-105 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      Melaço (Até 4) ({melaco.length})
                    </span>
                    <div className="space-y-1">
                      {melaco.map(({ segment, student }) => (
                        <div key={segment.id} className="p-1.5 rounded bg-slate-50 border border-slate-100 hover:bg-white transition-all space-y-1">
                          <span className="font-bold text-[11px] text-slate-800 block leading-tight">{student?.nome}</span>
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-200 text-slate-700">
                            {segment.periodo}
                          </span>
                        </div>
                      ))}
                      {melaco.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-2">Nenhum ativo.</p>
                      )}
                    </div>
                  </div>

                  {/* Marmelada block (5+) */}
                  <div className="space-y-1.5 pt-3">
                    <span className="text-[9px] uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1 bg-slate-105 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Marmelada (5+) ({marmelada.length})
                    </span>
                    <div className="space-y-1">
                      {marmelada.map(({ segment, student }) => (
                        <div key={segment.id} className="p-1.5 rounded bg-slate-50 border border-slate-100 hover:bg-white transition-all space-y-1">
                          <span className="font-bold text-[11px] text-slate-800 block leading-tight">{student?.nome}</span>
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-200 text-slate-700">
                            {segment.periodo}
                          </span>
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
      ) : (
        /* GENERAL MATRIX / CHECKLIST VIEW */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden" id="matrix-checklist-view">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h3 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <CheckSquare size={14} className="text-orange-500" />
              Matriz Geral de Presenças do Contraturno
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Frequências periódicas recorrentes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Estudante</th>
                  <th className="p-3">Turma/Grupo</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="p-3 text-center">{day}</th>
                  ))}
                  <th className="p-3 text-center">Frequência</th>
                  <th className="p-3 text-center">Período</th>
                  <th className="p-3 text-right">Valor Mensal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                {activeContraturnos.map((c) => {
                  const student = getStudentInfo(c.alunoId);
                  if (!student) return null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{student.nome}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.natureza === 'Melaço' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.natureza}
                        </span>
                      </td>
                      {daysOfWeek.map(day => {
                        const attends = c.diasSemana.includes(day);
                        return (
                          <td key={day} className="p-3 text-center">
                            <span className={`w-5 h-5 rounded inline-flex items-center justify-center font-bold text-xs ${
                              attends ? 'bg-emerald-600 text-white border border-emerald-600' : 'text-slate-300 font-light'
                            }`}>
                              {attends ? '✓' : '•'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-bold text-slate-500 text-[11px]">{c.diasSemana.length}x / semana</td>
                      <td className="p-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {c.periodo}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valorMensal)}
                      </td>
                    </tr>
                  );
                })}
                {activeContraturnos.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-400 font-semibold">
                      Nenhum contraturno ativo no momento para preencher a matriz.
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
