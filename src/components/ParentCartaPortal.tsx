import React, { useState } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, RegularClass, ContraturnoPrice } from '../types';
import { calculateAgeAtCutoff, getRegularClassForAgeDynamic, getContraturnoPriceDynamic } from '../data';
import { Sprout, CheckCircle, HelpCircle, XCircle, Send, Calendar, Clock, DollarSign, Check, Heart, ShieldCheck, Sparkles, MessageSquare, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

interface ParentCartaPortalProps {
  student: Student;
  guardian?: Guardian;
  enrollment?: Enrollment;
  activeContraturno?: ContraturnoSegment;
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  onSaveResponse: (updatedEnrollment: Enrollment) => void;
  onBackToAdmin?: () => void;
}

const WEEKDAYS: Array<{ id: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'; label: string; full: string }> = [
  { id: 'Seg', label: 'Seg', full: 'Segunda-feira' },
  { id: 'Ter', label: 'Ter', full: 'Terça-feira' },
  { id: 'Qua', label: 'Qua', full: 'Quarta-feira' },
  { id: 'Qui', label: 'Qui', full: 'Quinta-feira' },
  { id: 'Sex', label: 'Sex', full: 'Sexta-feira' },
];

const EXIT_TIMES = ['15:30', '17:30'] as const;

export default function ParentCartaPortal({
  student,
  guardian,
  enrollment,
  activeContraturno,
  classPrices,
  contraturnoPrices,
  onSaveResponse,
  onBackToAdmin
}: ParentCartaPortalProps) {
  // Ages & classes
  const age2026 = calculateAgeAtCutoff(student.nascimento, 2026);
  const age2027 = calculateAgeAtCutoff(student.nascimento, 2027);

  const class2026 = getRegularClassForAgeDynamic(age2026, classPrices, 2026);
  const suggestedClass2027 = getRegularClassForAgeDynamic(age2027, classPrices, 2027);

  // Proposal base set by school
  const valorRegularProposto = enrollment?.valorProposto2027 !== undefined 
    ? enrollment.valorProposto2027 
    : suggestedClass2027.valorMensal;

  const turmaPropostaId = enrollment?.turmaPropostaId2027 || suggestedClass2027.id;
  const selectedClassDetails = classPrices.find(c => c.id === turmaPropostaId && (c.ano || 2026) === 2027) || classPrices.find(c => c.id === turmaPropostaId) || suggestedClass2027;

  // Parent Interactive Choices
  const [contraturnoDesejado, setContraturnoDesejado] = useState<boolean>(() => {
    if (enrollment?.contraturnoDesejado2027 !== undefined) return enrollment.contraturnoDesejado2027;
    return !!activeContraturno;
  });

  const [diasContraturno, setDiasContraturno] = useState<Array<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'>>(() => {
    if (enrollment?.diasContraturno2027 && enrollment.diasContraturno2027.length > 0) {
      return enrollment.diasContraturno2027;
    }
    if (activeContraturno?.diasSemana) {
      return activeContraturno.diasSemana;
    }
    return ['Seg', 'Ter', 'Qua'];
  });

  const [horarioSaida, setHorarioSaida] = useState<'15:30' | '17:30'>(() => {
    if (enrollment?.horarioSaida2027 === '15:30' || enrollment?.horarioSaida2027 === '17:30') {
      return enrollment.horarioSaida2027;
    }
    if (enrollment?.periodoContraturno2027 === 'Parcial' || activeContraturno?.periodo === 'Parcial') {
      return '15:30';
    }
    return '17:30';
  });

  const periodoContraturno: 'Parcial' | 'Completo' = horarioSaida === '17:30' ? 'Completo' : 'Parcial';

  const [adicionarLanche, setAdicionarLanche] = useState<boolean>(() => {
    if (enrollment?.adicionarLanche2027 !== undefined) return enrollment.adicionarLanche2027;
    return enrollment?.adicionarLanche || false;
  });

  const [valorLanche, setValorLanche] = useState<number>(() => {
    return enrollment?.valorLanche2027 || enrollment?.valorLanche || 250;
  });

  const [adicionarAlmoco, setAdicionarAlmoco] = useState<boolean>(() => {
    if (enrollment?.adicionarAlmoco2027 !== undefined) return enrollment.adicionarAlmoco2027;
    return enrollment?.adicionarAlmoco || false;
  });

  const [valorAlmoco, setValorAlmoco] = useState<number>(() => {
    return enrollment?.valorAlmoco2027 || enrollment?.valorAlmoco || 500;
  });

  const [diaVencimento, setDiaVencimento] = useState<'01' | '05' | '10' | '15' | '20'>(() => {
    return enrollment?.diaVencimento2027 || '05';
  });

  const [descontoPontualidadeAtivo, setDescontoPontualidadeAtivo] = useState<boolean>(() => {
    if (enrollment?.descontoPontualidadeAtivo2027 !== undefined) return enrollment.descontoPontualidadeAtivo2027;
    return true;
  });

  const [valorDescontoPontualidade, setValorDescontoPontualidade] = useState<number>(() => {
    return enrollment?.valorDescontoPontualidade2027 !== undefined ? enrollment.valorDescontoPontualidade2027 : 50;
  });

  const [statusIntencao, setStatusIntencao] = useState<'Confirmada' | 'Em Análise' | 'Não Renovará'>(() => {
    if (enrollment?.statusIntencao2027 && enrollment.statusIntencao2027 !== 'Pendente') {
      return enrollment.statusIntencao2027;
    }
    return 'Confirmada';
  });

  const [observacoesFamilia, setObservacoesFamilia] = useState<string>(() => {
    return enrollment?.observacoesFamilia2027 || '';
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  // Toggle Weekday
  const toggleWeekday = (day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex') => {
    setDiasContraturno(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // Dynamic calculations
  const frequencia = contraturnoDesejado ? diasContraturno.length : 0;
  const valorContraturno = contraturnoDesejado ? getContraturnoPriceDynamic(frequencia, periodoContraturno, contraturnoPrices, 2027) : 0;
  const lancheVal = adicionarLanche ? valorLanche : 0;
  // Almoço na escola é se a pessoa NÃO optar pelo contraturno, mas quer que a criança almoce
  const almocoVal = (!contraturnoDesejado && adicionarAlmoco) ? valorAlmoco : 0;

  const totalCalculado = Number(valorRegularProposto) + valorContraturno + lancheVal + almocoVal;
  const totalComPontualidade = (descontoPontualidadeAtivo && valorDescontoPontualidade > 0)
    ? Math.max(0, totalCalculado - valorDescontoPontualidade)
    : totalCalculado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment) return;

    let mappedStatus: Enrollment['statusNegociacao'] = 'Confirmada';
    if (statusIntencao === 'Em Análise') mappedStatus = 'Em Negociação';
    if (statusIntencao === 'Não Renovará') mappedStatus = 'Cancelada';

    const updated: Enrollment = {
      ...enrollment,
      statusNegociacao: mappedStatus,
      valorProposto2027: Number(valorRegularProposto),
      turmaPropostaId2027: turmaPropostaId,
      contraturnoDesejado2027: contraturnoDesejado,
      diasContraturno2027: contraturnoDesejado ? diasContraturno : [],
      horarioSaida2027: horarioSaida,
      periodoContraturno2027: periodoContraturno,
      adicionarLanche2027: adicionarLanche,
      valorLanche2027: valorLanche,
      adicionarAlmoco2027: contraturnoDesejado ? false : adicionarAlmoco,
      valorAlmoco2027: valorAlmoco,
      diaVencimento2027: diaVencimento,
      descontoPontualidadeAtivo2027: descontoPontualidadeAtivo,
      valorDescontoPontualidade2027: valorDescontoPontualidade,
      statusIntencao2027: statusIntencao,
      observacoesFamilia2027: observacoesFamilia,
      dataIntencao2027: new Date().toISOString().split('T')[0]
    };

    onSaveResponse(updated);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-green-dark text-white p-6 sm:p-8 text-center relative">
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="absolute top-4 left-4 text-xs font-bold text-emerald-200 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ← Painel da Escola
            </button>
          )}

          <div className="mx-auto mb-3 flex items-center justify-center p-2.5 bg-white/95 rounded-2xl shadow-md max-w-[200px]">
            <img 
              src="https://sitioescolageranium.com.br/imagens/logo-sitio-escola-geranium.png" 
              alt="Sítio-Escola Geranium" 
              className="h-14 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight uppercase">
            Sítio Geranium
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">
            Carta de Intenção de Rematrícula — Ano Letivo 2027
          </p>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-xl font-bold text-brand-green-dark font-display">
              Sua Resposta Foi Registrada com Sucesso!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Agradecemos a confiança na equipe do Sítio Geranium para acompanhar o desenvolvimento e a jornada de <strong className="text-slate-800">{student.nome}</strong> em 2027.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2 text-emerald-900">
              <p className="font-bold border-b border-emerald-200 pb-1">Resumo da sua escolha:</p>
              <p>• <strong>Status:</strong> {statusIntencao}</p>
              <p>• <strong>Turma Prevista:</strong> {selectedClassDetails.nome}</p>
              <p>• <strong>Contraturno:</strong> {contraturnoDesejado ? `${diasContraturno.length}x/semana (${diasContraturno.join(', ')}) - Saída até ${horarioSaida}` : 'Não optante'}</p>
              <p>• <strong>Investimento Estimado:</strong> R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-brand-orange font-bold hover:underline cursor-pointer"
              >
                Alterar ou rever minhas respostas
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Student Greetings */}
            <div className="bg-brand-cream border border-brand-sand rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-green-dark text-white font-bold text-lg rounded-full flex items-center justify-center shrink-0">
                {student.nome.charAt(0)}
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Formulário de Intenção para:</p>
                <h2 className="text-lg font-bold text-brand-green-dark">{student.nome}</h2>
                <p className="text-xs text-slate-600">
                  Responsável: <span className="font-semibold text-slate-800">{guardian?.nome || 'Família'}</span>
                </p>
              </div>
            </div>

            {/* Proposal Details Box */}
            <div className="bg-white border-2 border-brand-orange/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-orange" />
                  <h3 className="font-bold text-sm text-slate-800 font-display uppercase tracking-wider">
                    Proposta para o Ano Letivo 2027
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  2027
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="block text-slate-500 font-medium">Turma Prevista (2027):</span>
                  <span className="text-sm font-bold text-brand-green-dark">{selectedClassDetails.nome}</span>
                  <span className="block text-[10px] text-slate-500">Corte etário em 31/03/2027</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="block text-slate-500 font-medium">Mensalidade Regular Base:</span>
                  <span className="text-sm font-bold text-slate-800">
                    R$ {Number(valorRegularProposto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                  </span>
                  <span className="block text-[10px] text-slate-500">Acordo/Proposta exclusiva da escola</span>
                </div>
              </div>

              {/* Escolha do Dia de Vencimento e Desconto por Pontualidade */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-brand-orange" />
                      Dia de Vencimento Desejado da Mensalidade:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Escolha a melhor data do mês para o vencimento em 2027:
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {(['01', '05', '10', '15', '20'] as const).map(dia => {
                      const isSelected = diaVencimento === dia;
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => setDiaVencimento(dia)}
                          className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-orange text-white border-brand-orange shadow-2xs scale-105'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Dia {dia}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {descontoPontualidadeAtivo && valorDescontoPontualidade > 0 && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-900">
                    <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-emerald-950">Desconto por Pontualidade: </span>
                      Pagando até o <strong>dia {diaVencimento}</strong> de cada mês, a família tem um desconto pontual de <strong>R$ {valorDescontoPontualidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> na mensalidade!
                    </div>
                  </div>
                )}
              </div>

              {/* Lanche Escolar no Ensino Regular */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adicionarLanche}
                      onChange={(e) => setAdicionarLanche(e.target.checked)}
                      className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                    />
                    <span className="font-bold text-slate-800 text-xs">Incluir Lanche Escolar no Regular</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    + R$ {valorLanche.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                  </span>
                </label>
              </div>

              {/* Contraturno Options */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contraturnoDesejado}
                      onChange={(e) => setContraturnoDesejado(e.target.checked)}
                      className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                    />
                    <span className="font-bold text-slate-800 text-xs">Optar pelo Contraturno em 2027</span>
                  </div>
                  {contraturnoDesejado && (
                    <span className="text-xs font-bold text-brand-orange">
                      + R$ {valorContraturno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  )}
                </label>

                {contraturnoDesejado && (
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Selecione os dias da semana desejados ({diasContraturno.length} dia{diasContraturno.length !== 1 ? 's' : ''}):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {WEEKDAYS.map(day => {
                          const isSelected = diasContraturno.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => toggleWeekday(day.id)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-brand-orange text-white shadow-2xs'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block font-bold text-slate-700 mb-1">Horário de Saída (Contraturno):</label>
                      <select
                        value={horarioSaida}
                        onChange={(e) => setHorarioSaida(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-orange outline-none"
                      >
                        {EXIT_TIMES.map(t => (
                          <option key={t} value={t}>Saída até {t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Opcional: Almoço na Escola (Exclusivo para quem NÃO cursa Contraturno) */}
              {!contraturnoDesejado && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adicionarAlmoco}
                        onChange={(e) => setAdicionarAlmoco(e.target.checked)}
                        className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                      />
                      <span className="font-bold text-slate-800 text-xs">Incluir Almoço na Escola (Sem Contraturno)</span>
                    </div>
                    <span className="text-xs font-bold text-brand-orange">
                      + R$ {valorAlmoco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  </label>
                </div>
              )}

              {/* Total Calculation Display */}
              <div className="bg-brand-green-dark text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">Investimento Mensal Estimado 2027</span>
                  <span className="text-[11px] text-emerald-100">
                    Vencimento: Dia {diaVencimento}
                  </span>
                </div>

                <div className="text-right">
                  {descontoPontualidadeAtivo && valorDescontoPontualidade > 0 ? (
                    <div>
                      <span className="text-xs text-emerald-200 line-through block">
                        R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                      </span>
                      <span className="text-xl font-black text-brand-orange font-display">
                        R$ {totalComPontualidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs font-semibold text-emerald-200">com pontualidade</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-extrabold text-brand-orange font-display">
                      R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Parent Intention Choice */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-800 font-display">
                Qual a intenção da família para o ano letivo de 2027?
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  statusIntencao === 'Confirmada'
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-emerald-200'
                }`}>
                  <input
                    type="radio"
                    name="statusIntencao"
                    value="Confirmada"
                    checked={statusIntencao === 'Confirmada'}
                    onChange={() => setStatusIntencao('Confirmada')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle size={16} className="text-emerald-600" />
                      Sim, confirmamos nossa intenção de rematrícula para 2027
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Garantir a vaga do(a) aluno(a) para a turma de 2027 com as condições selecionadas acima.
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  statusIntencao === 'Em Análise'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-amber-200'
                }`}>
                  <input
                    type="radio"
                    name="statusIntencao"
                    value="Em Análise"
                    checked={statusIntencao === 'Em Análise'}
                    onChange={() => setStatusIntencao('Em Análise')}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <HelpCircle size={16} className="text-amber-600" />
                      Gostaríamos de agendar uma conversa com a direção / atendimento
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Temos dúvidas financeiras ou pedagógicas e queremos conversar antes de fechar.
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  statusIntencao === 'Não Renovará'
                    ? 'border-rose-500 bg-rose-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-rose-200'
                }`}>
                  <input
                    type="radio"
                    name="statusIntencao"
                    value="Não Renovará"
                    checked={statusIntencao === 'Não Renovará'}
                    onChange={() => setStatusIntencao('Não Renovará')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="block font-bold text-xs text-rose-900 flex items-center gap-1.5">
                      <XCircle size={16} className="text-rose-600" />
                      Infelizmente não pretendemos renovar a matrícula para 2027
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Iremos mudar de cidade ou optar por outra instituição.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Parent Observations */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações, Dúvidas ou Pedidos da Família:
              </label>
              <textarea
                rows={3}
                value={observacoesFamilia}
                onChange={(e) => setObservacoesFamilia(e.target.value)}
                placeholder="Escreva aqui se tiver alguma observação sobre horários, turmas dos irmãos ou solicitação específica..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-orange outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold font-display uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={18} />
                Enviar Resposta da Família
              </button>
            </div>

          </form>
        )}

        <div className="bg-slate-50 p-4 text-center border-t border-slate-200 text-[10px] text-slate-500">
          Sítio Geranium — Educação com amor e natureza. Em caso de dúvidas, entre em contato com a secretaria.
        </div>
      </div>
    </div>
  );
}
