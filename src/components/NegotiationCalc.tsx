import React, { useState, useEffect } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, FinancialMovement, ContraturnoNature, ContraturnoPeriod, RegularClass, ContraturnoPrice } from '../types';
import { calculateAgeAtCutoff, getRegularClassForAgeDynamic, getContraturnoPriceDynamic } from '../data';
import { Calculator, CheckCircle2, Shield, AlertTriangle, Sparkles, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NegotiationCalcProps {
  students: Student[];
  guardians: Guardian[];
  enrollments: Enrollment[];
  contraturnos: ContraturnoSegment[];
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
  onConfirmNegotiation: (
    alunoId: string,
    enrollmentData: Omit<Enrollment, 'id' | 'alunoId'>,
    contraturnoData: Omit<ContraturnoSegment, 'id' | 'alunoId'> | null
  ) => void;
}

export default function NegotiationCalc({
  students,
  guardians,
  enrollments,
  contraturnos,
  classPrices,
  contraturnoPrices,
  selectedStudentId: propSelectedStudentId,
  onSelectStudent,
  onConfirmNegotiation
}: NegotiationCalcProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(propSelectedStudentId || '');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  useEffect(() => {
    if (propSelectedStudentId) {
      setSelectedStudentId(propSelectedStudentId);
    }
  }, [propSelectedStudentId]);
  
  // Negotiation states
  const [discountType, setDiscountType] = useState<'reais' | 'porcentagem'>('reais');
  const [discountInput, setDiscountInput] = useState<number>(0);

  const [contraturnoDiscountType, setContraturnoDiscountType] = useState<'reais' | 'porcentagem'>('reais');
  const [contraturnoDiscountInput, setContraturnoDiscountInput] = useState<number>(0);

  const [addLanche, setAddLanche] = useState<boolean>(false);
  const [lancheValue, setLancheValue] = useState<number>(200);

  const [negotiationStatus, setNegotiationStatus] = useState<Enrollment['statusNegociacao']>('Em Negociação');
  const [notes, setNotes] = useState<string>('');

  // Contraturno choice
  const [enableContraturno, setEnableContraturno] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<('Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex')[]>([]);
  const [contraturnoPeriod, setContraturnoPeriod] = useState<ContraturnoPeriod>('Parcial');

  // Result success state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Derive available years
  const availableYears = Array.from(
    new Set([
      2026,
      ...classPrices.map(c => c.ano || 2026),
      ...contraturnoPrices.map(cp => cp.ano || 2026)
    ])
  ).sort((a, b) => a - b);

  // Derive student properties
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const financialGuardian = guardians.find(g => g.alunoId === selectedStudentId && g.financeiro);

  const studentAge = selectedStudent ? calculateAgeAtCutoff(selectedStudent.nascimento, selectedYear) : 0;
  
  // Try to find the enrollment's existing class override first, otherwise fall back to age cut-off suggestion
  const existingEnrollment = selectedStudent ? enrollments.find(e => e.alunoId === selectedStudent.id && e.ano === selectedYear) : null;
  const currentTurmaRegularId = existingEnrollment ? existingEnrollment.turmaRegularId : null;
  const regularClass = selectedStudent 
    ? (currentTurmaRegularId 
        ? (classPrices.find(c => c.id === currentTurmaRegularId) || getRegularClassForAgeDynamic(studentAge, classPrices, selectedYear)) 
        : getRegularClassForAgeDynamic(studentAge, classPrices, selectedYear)) 
    : null;

  // Derive contraturno nature based on student age
  // "Melaço até 4 anos, Marmelada acima de 5 anos"
  const contraturnoNature: ContraturnoNature = studentAge <= 4 ? 'Melaço' : 'Marmelada';

  // Pricing calculations
  const regularBasePrice = regularClass ? regularClass.valorMensal : 0;

  // Calculate discount value in Reais
  const discountVal = discountType === 'porcentagem'
    ? Math.round(regularBasePrice * (discountInput / 100))
    : discountInput;

  const regularWithDiscount = Math.max(0, regularBasePrice - discountVal);

  const weeklyFrequency = selectedDays.length;
  const contraturnoPrice = enableContraturno ? getContraturnoPriceDynamic(weeklyFrequency, contraturnoPeriod, contraturnoPrices, selectedYear) : 0;

  // Calculate contraturno discount value in Reais
  const contraturnoDiscountVal = contraturnoDiscountType === 'porcentagem'
    ? Math.round(contraturnoPrice * (contraturnoDiscountInput / 100))
    : contraturnoDiscountInput;

  const contraturnoDiscounted = Math.max(0, contraturnoPrice - contraturnoDiscountVal);

  const totalMonthlyCommitment = regularWithDiscount + contraturnoDiscounted + (addLanche && regularClass?.natureza === 'Fundamental' ? lancheValue : 0);

  // Auto-fill existing negotiation if student changes or selected year changes
  useEffect(() => {
    if (selectedStudentId) {
      const existing = enrollments.find(e => e.alunoId === selectedStudentId && e.ano === selectedYear);
      if (existing) {
        setDiscountType(existing.tipoDescontoRegular || 'reais');
        setDiscountInput(existing.valorDescontoRegularInput !== undefined ? existing.valorDescontoRegularInput : existing.descontoMensal);
        setContraturnoDiscountType(existing.tipoDescontoContraturno || 'reais');
        setContraturnoDiscountInput(existing.valorDescontoContraturnoInput !== undefined ? existing.valorDescontoContraturnoInput : existing.descontoContraturno || 0);
        setNegotiationStatus(existing.statusNegociacao);
        setNotes(existing.anotacoes);
        setAddLanche(existing.adicionarLanche !== undefined ? existing.adicionarLanche : false);
        setLancheValue(existing.valorLanche !== undefined ? existing.valorLanche : 200);
      } else {
        setDiscountType('reais');
        setDiscountInput(0);
        setContraturnoDiscountType('reais');
        setContraturnoDiscountInput(0);
        setNegotiationStatus('Em Negociação');
        setNotes('');
        setAddLanche(false);
        setLancheValue(200);
      }

      // Check for active contraturno for this student
      const activeCont = contraturnos.find(c => c.alunoId === selectedStudentId && c.dataFim === null);
      if (activeCont) {
        setEnableContraturno(true);
        setSelectedDays(activeCont.diasSemana);
        setContraturnoPeriod(activeCont.periodo);
      } else {
        setEnableContraturno(false);
        setSelectedDays([]);
        setContraturnoPeriod('Parcial');
      }
      setSuccessMsg(null);
    }
  }, [selectedStudentId, selectedYear, enrollments, contraturnos]);

  const toggleDay = (day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex') => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleConfirm = () => {
    if (!selectedStudentId) {
      alert('Selecione um aluno primeiro.');
      return;
    }

    const enrollmentData: Omit<Enrollment, 'id' | 'alunoId'> = {
      ano: selectedYear,
      turmaRegularId: regularClass!.id,
      valorRegularOriginal: regularBasePrice,
      descontoMensal: discountVal,
      valorFinalRegular: regularWithDiscount,
      statusNegociacao: negotiationStatus,
      anotacoes: notes,
      descontoContraturno: contraturnoDiscountVal,
      tipoDescontoRegular: discountType,
      valorDescontoRegularInput: discountInput,
      tipoDescontoContraturno: contraturnoDiscountType,
      valorDescontoContraturnoInput: contraturnoDiscountInput,
      adicionarLanche: addLanche && regularClass?.natureza === 'Fundamental',
      valorLanche: addLanche && regularClass?.natureza === 'Fundamental' ? lancheValue : 0
    };

    const contraturnoData: Omit<ContraturnoSegment, 'id' | 'alunoId'> | null = enableContraturno && weeklyFrequency > 0 ? {
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: null,
      natureza: contraturnoNature,
      diasSemana: selectedDays,
      periodo: contraturnoPeriod,
      valorMensal: contraturnoDiscounted
    } : null;

    onConfirmNegotiation(selectedStudentId, enrollmentData, contraturnoData);
    setSuccessMsg(`Negociação para ${selectedStudent?.nome} salva com sucesso para o ano ${selectedYear}! O contrato e o histórico financeiro foram atualizados.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-4" id="negotiation-calculator-root">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Calculator size={18} className="text-orange-500" />
            Calculadora de Acordo & Rematrícula
          </h2>
          <p className="text-xs text-slate-500">
            Combine as mensalidades regulares e pacotes de contraturno para gerar propostas comerciais integradas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column: Inputs form */}
        <div className="lg:col-span-7 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          {/* Student selection and Year selection */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Selecione o Aluno</label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  onSelectStudent?.(e.target.value);
                }}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="">-- Selecione um aluno cadastrado --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Ano de Acordo</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                }}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-white cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Regular Class locked info */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Turma Regular Designada</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">{regularClass?.nome}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Determinado por nascimento: {studentAge} anos em 31/03.</p>
                  </div>
                  <div className="sm:text-right flex flex-col justify-center sm:items-end">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Preço Base Regular</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(regularBasePrice)}/mês
                    </span>
                  </div>
                </div>

                {/* Option to add snack fee for Fundamental class */}
                {regularClass?.natureza === 'Fundamental' && (
                  <div className="p-3 bg-orange-50/60 rounded-lg border border-orange-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="add-lanche"
                        checked={addLanche}
                        onChange={(e) => {
                          setAddLanche(e.target.checked);
                          if (e.target.checked && !lancheValue) {
                            setLancheValue(200);
                          }
                        }}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                      />
                      <label htmlFor="add-lanche" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                        Acrescentar Valor do Lanche (R$ 200,00)
                      </label>
                    </div>
                    {addLanche && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Valor do Lanche:</span>
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1.5 text-[10px] text-slate-400 font-mono">R$</span>
                          <input
                            type="number"
                            min="0"
                            value={lancheValue || ''}
                            onChange={(e) => setLancheValue(Number(e.target.value))}
                            className="w-full text-xs pl-7 pr-2 py-1 rounded-md border border-slate-200 focus:border-orange-500 focus:outline-none bg-white font-mono font-bold text-slate-800"
                            placeholder="200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discount and negotiation settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600">Desconto Regular</label>
                      <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('reais');
                            setDiscountInput(0);
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            discountType === 'reais' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          R$
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('porcentagem');
                            setDiscountInput(0);
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            discountType === 'porcentagem' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          %
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1.5 text-xs text-slate-400 font-mono">
                        {discountType === 'reais' ? 'R$' : '%'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'reais' ? regularBasePrice : 100}
                        value={discountInput || ''}
                        onChange={(e) => setDiscountInput(Number(e.target.value))}
                        className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    {discountType === 'porcentagem' && discountInput > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Equivale a R$ {discountVal} de desconto.
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Status da Negociação</label>
                    <select
                      value={negotiationStatus}
                      onChange={(e) => setNegotiationStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Negociação">Em Negociação</option>
                      <option value="Confirmada">Confirmada / Renovada</option>
                    </select>
                  </div>
                </div>

                {/* Contraturno Section */}
                <div className="space-y-3 pt-3 border-t border-slate-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enable-contraturno"
                        checked={enableContraturno}
                        onChange={(e) => setEnableContraturno(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                      />
                      <label htmlFor="enable-contraturno" className="text-xs font-bold text-slate-700 uppercase tracking-wider select-none cursor-pointer">
                        Adicionar Contraturno
                      </label>
                    </div>
                    {enableContraturno && (
                      <span className="text-[10px] bg-orange-50 text-orange-800 border border-orange-200 font-bold px-2 py-0.5 rounded-full uppercase">
                        Vigência: {contraturnoNature}
                      </span>
                    )}
                  </div>

                  {enableContraturno && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 p-3 bg-slate-50 rounded-md border border-slate-200"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 block">Selecione os Dias de Frequência</label>
                        <div className="flex gap-2 flex-wrap">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map((day) => {
                            const isSelected = selectedDays.includes(day as any);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day as any)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-xs' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Frequência calculada: <strong className="font-bold">{weeklyFrequency} {weeklyFrequency === 1 ? 'dia' : 'dias'}</strong> por semana.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 block">Período de Permanência</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                            <input
                              type="radio"
                              name="periodo"
                              value="Parcial"
                              checked={contraturnoPeriod === 'Parcial'}
                              onChange={() => setContraturnoPeriod('Parcial')}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            Parcial (Meio período)
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                            <input
                              type="radio"
                              name="periodo"
                              value="Completo"
                              checked={contraturnoPeriod === 'Completo'}
                              onChange={() => setContraturnoPeriod('Completo')}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            Completo (Integral)
                          </label>
                        </div>
                      </div>

                      {/* Contraturno discount field */}
                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-600">Desconto Contraturno</label>
                          <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                setContraturnoDiscountType('reais');
                                setContraturnoDiscountInput(0);
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                contraturnoDiscountType === 'reais' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              R$
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setContraturnoDiscountType('porcentagem');
                                setContraturnoDiscountInput(0);
                              }}
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                contraturnoDiscountType === 'porcentagem' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                              }`}
                            >
                              %
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1.5 text-xs text-slate-400 font-mono">
                            {contraturnoDiscountType === 'reais' ? 'R$' : '%'}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={contraturnoDiscountType === 'reais' ? contraturnoPrice : 100}
                            value={contraturnoDiscountInput || ''}
                            onChange={(e) => setContraturnoDiscountInput(Number(e.target.value))}
                            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-white"
                            placeholder="0"
                          />
                        </div>
                        {contraturnoDiscountType === 'porcentagem' && contraturnoDiscountInput > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Equivale a R$ {contraturnoDiscountVal} de desconto.
                          </span>
                        )}
                        <p className="text-[9px] text-slate-400">Desconto mensal aplicado exclusivamente à mensalidade do Contraturno.</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* General negotiation notes */}
                <div className="space-y-1 pt-3 border-t border-slate-150">
                  <label className="text-xs font-bold text-slate-600 block">Anotações da Negociação / Acordo</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Responsável concordou com reajuste anual de 8%, negociado desconto fidelidade."
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </motion.div>
            ) : (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500">Por favor, selecione um aluno para iniciar a simulação comercial.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Sum and summary panel */}
        <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sparkles size={14} className="text-orange-500" />
              Proposta Financeira Mensal
            </h3>

            {selectedStudent ? (
              <div className="space-y-4">
                {/* Financial contact summary */}
                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-md space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Responsável Financeiro:</span>
                    <span className="text-slate-800">{financialGuardian ? financialGuardian.nome : 'Nenhum definido'}</span>
                  </div>
                  {financialGuardian && (
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>Contato de Cobrança:</span>
                      <span>{financialGuardian.contato}</span>
                    </div>
                  )}
                </div>

                {/* Dynamic sums */}
                <div className="space-y-2">
                  {/* Regular Class */}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Turma Regular ({regularClass?.nome}):</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(regularBasePrice)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discountVal > 0 && (
                    <div className="flex justify-between text-xs text-rose-600">
                      <span>Desconto Especial Concedido:</span>
                      <span className="font-mono font-bold">
                        -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountVal)}
                      </span>
                    </div>
                  )}

                  {/* Regular Final Sum */}
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-1">
                    <span>Subtotal Ensino Regular:</span>
                    <span className="font-mono text-slate-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(regularWithDiscount)}
                    </span>
                  </div>

                  {/* Lanche for Fundamental */}
                  {addLanche && regularClass?.natureza === 'Fundamental' && (
                    <div className="flex justify-between text-xs text-slate-700 pt-1 border-t border-dashed border-slate-100">
                      <span className="text-orange-700 font-medium">Adicional de Lanche (Fundamental):</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancheValue)}
                      </span>
                    </div>
                  )}

                  {/* Contraturno */}
                  {enableContraturno && weeklyFrequency > 0 && (
                    <div className="pt-1 border-t border-dashed border-slate-100 space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>Contraturno {contraturnoNature} ({weeklyFrequency} dias - {contraturnoPeriod}):</span>
                        <span className="font-mono font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contraturnoPrice)}
                        </span>
                      </div>
                      {contraturnoDiscountVal > 0 && (
                        <div className="flex justify-between text-xs text-rose-600">
                          <span>Desconto Contraturno:</span>
                          <span className="font-mono font-bold">
                            -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contraturnoDiscountVal)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-0.5">
                        <span>Subtotal Contraturno:</span>
                        <span className="font-mono text-slate-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contraturnoDiscounted)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grand Total box */}
                <div className="p-4 bg-emerald-950 text-white rounded-lg space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-orange-300">Valor Mensal Integrado</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-bold font-mono">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthlyCommitment)}
                    </span>
                    <span className="text-[10px] text-orange-300">/mês</span>
                  </div>
                  <p className="text-[9px] text-emerald-300 pt-1 border-t border-emerald-900">
                    Soma de Ensino Regular (com desconto) + Contraturno{(addLanche && regularClass?.natureza === 'Fundamental') ? ' + Lanche' : ''}.
                  </p>
                </div>

                {/* Warnings or Guidelines */}
                {enableContraturno && weeklyFrequency === 0 && (
                  <div className="p-2.5 bg-orange-50 text-orange-800 text-[10px] rounded-md border border-orange-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>Selecione pelo menos 1 dia para calcular o valor do pacote de Contraturno.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Selecione um estudante para visualizar o extrato analítico da mensalidade.
              </div>
            )}
          </div>

          <div>
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-md border border-emerald-200 flex items-center gap-2 mb-3"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-700" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleConfirm}
              disabled={!selectedStudentId || (enableContraturno && weeklyFrequency === 0)}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Confirmar & Registrar Acordo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
