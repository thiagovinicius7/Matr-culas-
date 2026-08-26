import React, { useState, useEffect } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, RegularClass, ContraturnoPrice } from '../types';
import { calculateAgeAtCutoff, getRegularClassForAgeDynamic, getContraturnoPriceDynamic, REGULAR_CLASSES } from '../data';
import { FileText, Save, Printer, Share2, MessageCircle, Calendar, Clock, DollarSign, UserCheck, AlertCircle, CheckCircle, HelpCircle, XCircle, Edit3, ArrowRight, ShieldCheck, Sparkles, Check, ChevronDown, Link2, ExternalLink, Utensils } from 'lucide-react';

interface CartaIntencaoFormProps {
  student: Student;
  guardian?: Guardian;
  enrollment?: Enrollment;
  activeContraturno?: ContraturnoSegment;
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  onSave: (updatedEnrollment: Enrollment, logMovement?: boolean) => void;
  onClose?: () => void;
  onOpenParentPortal?: (studentId: string) => void;
}

const WEEKDAYS: Array<{ id: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'; label: string; full: string }> = [
  { id: 'Seg', label: 'Seg', full: 'Segunda-feira' },
  { id: 'Ter', label: 'Ter', full: 'Terça-feira' },
  { id: 'Qua', label: 'Qua', full: 'Quarta-feira' },
  { id: 'Qui', label: 'Qui', full: 'Quinta-feira' },
  { id: 'Sex', label: 'Sex', full: 'Sexta-feira' },
];

const EXIT_TIMES = ['15:30', '17:30'] as const;

export default function CartaIntencaoForm({
  student,
  guardian,
  enrollment,
  activeContraturno,
  classPrices,
  contraturnoPrices,
  onSave,
  onClose,
  onOpenParentPortal
}: CartaIntencaoFormProps) {
  // Age in 2026 vs 2027
  const age2026 = calculateAgeAtCutoff(student.nascimento, 2026);
  const age2027 = calculateAgeAtCutoff(student.nascimento, 2027);

  // Suggested class for 2027 based on cutoff
  const class2026 = getRegularClassForAgeDynamic(age2026, classPrices, 2026);
  const suggestedClass2027 = getRegularClassForAgeDynamic(age2027, classPrices, 2027);

  // 2026 Current Financial State
  const currentRegularVal = enrollment?.valorFinalRegular || class2026.valorMensal;
  const currentContVal = activeContraturno?.valorMensal || 0;
  const currentLancheVal = (enrollment?.adicionarLanche && class2026.natureza === 'Fundamental') ? (enrollment.valorLanche || 0) : 0;
  const currentAlmocoVal = enrollment?.adicionarAlmoco ? (enrollment.valorAlmoco || 0) : 0;
  const currentTotal = currentRegularVal + currentContVal + currentLancheVal + currentAlmocoVal;

  const [turmaPropostaId2027, setTurmaPropostaId2027] = useState<string>(() => {
    return enrollment?.turmaPropostaId2027 || suggestedClass2027.id;
  });

  // Selected Class details for 2027 from pricing table
  const selectedClass2027Details = classPrices.find(c => c.id === turmaPropostaId2027 && (c.ano || 2026) === 2027) 
    || classPrices.find(c => c.id === turmaPropostaId2027) 
    || suggestedClass2027;

  const valorTabelaRegular2027 = selectedClass2027Details.valorMensal;

  // Discount / Negotiation state for 2027
  const [descontoRegular2027, setDescontoRegular2027] = useState<number>(() => {
    if (enrollment?.valorProposto2027 !== undefined) {
      return Math.max(0, valorTabelaRegular2027 - enrollment.valorProposto2027);
    }
    return enrollment?.descontoMensal || 0;
  });

  // State for 2027 Custom Final Proposed Price
  const [valorProposto2027, setValorProposto2027] = useState<number>(() => {
    if (enrollment?.valorProposto2027 !== undefined) return enrollment.valorProposto2027;
    const disc = enrollment?.descontoMensal || 0;
    return Math.max(0, valorTabelaRegular2027 - disc);
  });

  const [contraturnoDesejado, setContraturnoDesejado] = useState<boolean>(() => {
    if (enrollment?.contraturnoDesejado2027 !== undefined) return enrollment.contraturnoDesejado2027;
    return !!activeContraturno || (enrollment?.diasContraturno2027 && enrollment.diasContraturno2027.length > 0);
  });

  const [diasContraturno, setDiasContraturno] = useState<Array<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'>>(() => {
    if (enrollment?.diasContraturno2027 && enrollment.diasContraturno2027.length > 0) {
      return enrollment.diasContraturno2027;
    }
    if (activeContraturno?.diasSemana) {
      return activeContraturno.diasSemana;
    }
    return ['Seg', 'Ter', 'Qua']; // Default 3 days
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

  const [valorLanche2027, setValorLanche2027] = useState<number>(() => {
    if (enrollment?.valorLanche2027 !== undefined) return enrollment.valorLanche2027;
    if (enrollment?.valorLanche !== undefined) return enrollment.valorLanche;
    return 250;
  });

  const [adicionarAlmoco, setAdicionarAlmoco] = useState<boolean>(() => {
    if (enrollment?.adicionarAlmoco2027 !== undefined) return enrollment.adicionarAlmoco2027;
    return enrollment?.adicionarAlmoco || false;
  });

  const [valorAlmoco2027, setValorAlmoco2027] = useState<number>(() => {
    if (enrollment?.valorAlmoco2027 !== undefined) return enrollment.valorAlmoco2027;
    if (enrollment?.valorAlmoco !== undefined) return enrollment.valorAlmoco;
    return 500;
  });

  const [diaVencimento, setDiaVencimento] = useState<'01' | '05' | '10' | '15' | '20'>(() => {
    return enrollment?.diaVencimento2027 || '05';
  });

  const [descontoPontualidadeAtivo, setDescontoPontualidadeAtivo] = useState<boolean>(() => {
    if (enrollment?.descontoPontualidadeAtivo2027 !== undefined) return enrollment.descontoPontualidadeAtivo2027;
    return true;
  });

  const [valorDescontoPontualidade, setValorDescontoPontualidade] = useState<number>(() => {
    if (enrollment?.valorDescontoPontualidade2027 !== undefined) return enrollment.valorDescontoPontualidade2027;
    return 50;
  });

  const [statusIntencao, setStatusIntencao] = useState<'Pendente' | 'Confirmada' | 'Em Análise' | 'Não Renovará'>(() => {
    return enrollment?.statusIntencao2027 || 'Pendente';
  });

  const [observacoesFamilia, setObservacoesFamilia] = useState<string>(() => {
    return enrollment?.observacoesFamilia2027 || '';
  });

  const [isCopied, setIsCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const parentUrl = `${window.location.origin}${window.location.pathname}?alunoId=${student.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(parentUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

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

  // Calculate 2027 Contraturno Price dynamically
  const frequencia = contraturnoDesejado ? diasContraturno.length : 0;
  const valorContraturno2027 = contraturnoDesejado ? getContraturnoPriceDynamic(frequencia, periodoContraturno, contraturnoPrices, 2027) : 0;

  // Lanche (Ensino Regular) and Almoco (Alimentação na escola apenas para quem NÃO faz Contraturno)
  const lanchePrice2027 = adicionarLanche ? valorLanche2027 : 0;
  const almocoPrice2027 = (!contraturnoDesejado && adicionarAlmoco) ? valorAlmoco2027 : 0;

  // Total 2027 Estimated
  const total2027 = Number(valorProposto2027 || 0) + valorContraturno2027 + lanchePrice2027 + almocoPrice2027;
  const diffTotal = total2027 - currentTotal;

  // Handle Save
  const handleSaveForm = () => {
    if (!enrollment) return;

    // Sync negotiation status
    let mappedStatus: Enrollment['statusNegociacao'] = enrollment.statusNegociacao;
    if (statusIntencao === 'Confirmada') mappedStatus = 'Confirmada';
    else if (statusIntencao === 'Em Análise') mappedStatus = 'Em Negociação';
    else if (statusIntencao === 'Não Renovará') mappedStatus = 'Cancelada';

    const updated: Enrollment = {
      ...enrollment,
      statusNegociacao: mappedStatus,
      valorProposto2027: Number(valorProposto2027),
      turmaPropostaId2027,
      contraturnoDesejado2027: contraturnoDesejado,
      diasContraturno2027: contraturnoDesejado ? diasContraturno : [],
      horarioSaida2027: horarioSaida,
      periodoContraturno2027: periodoContraturno,
      adicionarLanche2027: adicionarLanche,
      valorLanche2027: valorLanche2027,
      adicionarAlmoco2027: contraturnoDesejado ? false : adicionarAlmoco,
      valorAlmoco2027: valorAlmoco2027,
      diaVencimento2027: diaVencimento,
      descontoPontualidadeAtivo2027: descontoPontualidadeAtivo,
      valorDescontoPontualidade2027: valorDescontoPontualidade,
      statusIntencao2027: statusIntencao,
      observacoesFamilia2027: observacoesFamilia,
      dataIntencao2027: new Date().toISOString().split('T')[0]
    };

    onSave(updated, true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    return (
      `🌿 *Sítio-Escola Geranium*\n` +
      `*Carta de Intenção de Rematrícula — Ano Letivo 2027*\n\n` +
      `Olá, família de *${student.nome}*!\n\n` +
      `Já estamos organizando o ano letivo de 2027 com muito carinho. Convidamos vocês a acessarem o link abaixo para conferir a proposta do próximo ano e confirmar a intenção de rematrícula:\n\n` +
      `🔗 ${parentUrl}\n\n` +
      `No link vocês poderão conferir a turma prevista, selecionar opções de Contraturno e registrar a decisão da família.\n\n` +
      `Ficamos à disposição para qualquer dúvida!\n` +
      `Atenciosamente,\n` +
      `*Sítio-Escola Geranium*`
    );
  };

  const handleCopyWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (guardian?.contato) {
      const cleanPhone = guardian.contato.replace(/\D/g, '');
      if (cleanPhone) {
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans print:shadow-none print:border-none">
      {/* Printable Header - Only visible when printing */}
      <div className="hidden print:block p-6 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">SÍTIO GERANIUM - CARTA DE INTENÇÃO DE REMATRÍCULA 2027</h1>
            <p className="text-xs text-slate-600">Sítio-escola | Educação Infantil e Ensino Fundamental</p>
          </div>
          <p className="text-xs text-slate-500 font-mono">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Screen Top Bar - Sticky Header */}
      <div className="bg-brand-green-dark text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 print:hidden sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-brand-orange text-white rounded-lg shadow-xs shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold font-display tracking-tight leading-snug truncate">
              Carta de Intenção de Rematrícula 2027
            </h2>
            <p className="text-[11px] text-emerald-200 truncate">
              {student.nome} • Nascimento: {new Date(student.nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Fechar Carta de Intenção"
            >
              <XCircle size={16} />
              <span>Fechar</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Student & Guardian Info Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Aluno(a)</p>
            <p className="text-base font-bold text-brand-green-dark">{student.nome}</p>
            <p className="text-xs text-slate-600">
              Turma Atual (2026): <span className="font-semibold text-slate-800">{class2026.nome}</span> ({age2026} anos)
            </p>
          </div>

          <div className="space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsável Financeiro</p>
            <p className="text-sm font-semibold text-slate-800">{guardian?.nome || 'Não cadastrado'}</p>
            <p className="text-xs text-slate-600">Contato: {guardian?.contato || 'Sem telefone'}</p>
          </div>
        </div>

        {/* 2-Column Comparison Layout: 2026 Current vs 2027 Proposed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN 1: Current Year 2026 */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-green-dark" />
                <h3 className="font-bold text-sm text-brand-green-dark font-display uppercase tracking-wider">
                  Condição Atual (Ano 2026)
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                2026
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                <span className="text-slate-600">Turma e Idade:</span>
                <span className="font-semibold text-slate-800">{class2026.nome} ({age2026} anos)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                <span className="text-slate-600">Mensalidade Regular 2026:</span>
                <span className="font-bold text-slate-800">
                  R$ {currentRegularVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                <span className="text-slate-600">Contraturno Atual (2026):</span>
                <span className="font-medium text-slate-800">
                  {activeContraturno 
                    ? `${activeContraturno.diasSemana.length}x/sem (${activeContraturno.periodo}) - R$ ${currentContVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Não contratado'
                  }
                </span>
              </div>

              {(currentLancheVal > 0 || currentAlmocoVal > 0) && (
                <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600">Alimentação Adicional:</span>
                  <span className="font-medium text-slate-800">
                    R$ {(currentLancheVal + currentAlmocoVal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center text-sm font-bold text-brand-green-dark bg-white/80 p-3 rounded-lg border border-emerald-200">
                <span>Total Atual Mensal:</span>
                <span className="text-base font-extrabold text-brand-green-dark">
                  R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Proposta para 2027 (Fully Editable) */}
          <div className="bg-amber-50/40 border-2 border-brand-orange/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand-orange" />
                <h3 className="font-bold text-sm text-slate-900 font-display uppercase tracking-wider">
                  Proposta Ano Letivo 2027
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-orange text-white">
                EDITÁVEL 2027
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Turma Prevista 2027 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Turma Prevista para 2027 (Corte Etário em 31/03/2027):
                </label>
                <div className="relative">
                  <select
                    value={turmaPropostaId2027}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setTurmaPropostaId2027(newId);
                      const selected = classPrices.find(c => c.id === newId && (c.ano || 2026) === 2027) 
                        || classPrices.find(c => c.id === newId) 
                        || suggestedClass2027;
                      if (selected) {
                        setValorProposto2027(Math.max(0, selected.valorMensal - descontoRegular2027));
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-800 font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                  >
                    {classPrices.filter(c => (c.ano || 2026) === 2027).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.natureza}) - Tabela 2027: R$ {c.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Valor Regular 2027 & Personalização de Negociação */}
              <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Edit3 size={14} className="text-brand-orange" />
                    Ensino Regular 2027 — Tabela x Desconto Concedido:
                  </span>
                  <span className="text-xs font-extrabold text-brand-green-dark bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Tabela 2027: R$ {valorTabelaRegular2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Desconto / Abatimento de Negociação (R$):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">R$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={descontoRegular2027}
                        onChange={(e) => {
                          const disc = Number(e.target.value);
                          setDescontoRegular2027(disc);
                          setValorProposto2027(Math.max(0, valorTabelaRegular2027 - disc));
                        }}
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Valor Final Proposto para o Aluno (R$):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">R$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={valorProposto2027}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setValorProposto2027(val);
                          setDescontoRegular2027(Math.max(0, valorTabelaRegular2027 - val));
                        }}
                        className="w-full pl-8 pr-2 py-1.5 bg-amber-50/50 border border-brand-orange/40 rounded text-xs font-extrabold text-brand-orange focus:ring-2 focus:ring-brand-orange outline-none"
                        placeholder="Digite o valor mensal final"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  * Os valores base de tabela de 2027 vêm da tela de Configuração de Mensalidades. Aqui você ajusta o desconto específico deste aluno antes de disponibilizar aos pais.
                </p>

                {/* Desconto por Pontualidade & Vencimento */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={descontoPontualidadeAtivo}
                        onChange={(e) => setDescontoPontualidadeAtivo(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-600" />
                        Conceder Desconto por Pontualidade no Pagamento em Dia
                      </span>
                    </label>
                  </div>

                  {descontoPontualidadeAtivo && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Valor do Desconto por Pontualidade (R$):
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-400 font-semibold text-xs">R$</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={valorDescontoPontualidade}
                            onChange={(e) => setValorDescontoPontualidade(Number(e.target.value))}
                            className="w-full pl-8 pr-2 py-1 bg-emerald-50/50 border border-emerald-300 rounded text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="50,00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Dia de Vencimento Padrão / Sugerido:
                        </label>
                        <div className="flex gap-1">
                          {(['01', '05', '10', '15', '20'] as const).map(dia => (
                            <button
                              key={dia}
                              type="button"
                              onClick={() => setDiaVencimento(dia)}
                              className={`flex-1 py-1 text-xs font-bold rounded border cursor-pointer transition-colors ${
                                diaVencimento === dia
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {dia}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option for Lanche in Ensino Regular */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={adicionarLanche}
                      onChange={(e) => setAdicionarLanche(e.target.checked)}
                      className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                    />
                    <span className="font-bold text-slate-700 text-xs">Incluir Lanche Escolar no Regular</span>
                  </label>
                  {adicionarLanche && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">R$</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={valorLanche2027}
                        onChange={(e) => setValorLanche2027(Number(e.target.value))}
                        className="w-20 px-2 py-0.5 border border-slate-300 rounded text-xs font-bold text-slate-800 text-right focus:ring-1 focus:ring-brand-orange outline-none"
                      />
                      <span className="text-[10px] text-slate-500">/mês</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contraturno 2027 Selection */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contraturnoDesejado}
                      onChange={(e) => setContraturnoDesejado(e.target.checked)}
                      className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                    />
                    <span className="font-bold text-slate-800 text-xs">Optar por Contraturno em 2027</span>
                  </label>
                  {contraturnoDesejado && (
                    <span className="text-[11px] font-bold text-brand-orange">
                      R$ {valorContraturno2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  )}
                </div>

                {contraturnoDesejado && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {/* Days of week selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Dias da Semana Desejados ({diasContraturno.length} dia{diasContraturno.length !== 1 ? 's' : ''}):
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
                                  ? 'bg-brand-orange text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Exit Time Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Horário de Saída (Contraturno):
                      </label>
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

              {/* Servico Opcional: Almoço na Escola (Apenas se NÃO optar por Contraturno) */}
              {!contraturnoDesejado && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={adicionarAlmoco}
                        onChange={(e) => setAdicionarAlmoco(e.target.checked)}
                        className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
                      />
                      <span className="font-bold text-slate-800 text-xs">Incluir Almoço na Escola (Sem Contraturno)</span>
                    </label>
                    {adicionarAlmoco && (
                      <span className="text-[11px] font-bold text-emerald-700">
                        + R$ {valorAlmoco2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                      </span>
                    )}
                  </div>

                  {adicionarAlmoco && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <label className="text-[11px] font-bold text-slate-600">
                        Valor Mensal do Almoço na Escola (R$):
                      </label>
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-1.5 text-slate-400 font-semibold text-xs">R$</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={valorAlmoco2027}
                          onChange={(e) => setValorAlmoco2027(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-1 bg-amber-50/50 border border-brand-orange/40 rounded text-xs font-bold text-brand-orange text-right focus:ring-2 focus:ring-brand-orange outline-none"
                          placeholder="500,00"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Total 2027 Summary Box */}
              <div className="bg-brand-green-dark text-white p-4 rounded-xl space-y-1 shadow-sm">
                <div className="flex justify-between items-center text-xs text-emerald-200">
                  <span>Valor Estimado Total para 2027:</span>
                  <span>{diffTotal >= 0 ? `+ R$ ${diffTotal.toFixed(2)}` : `- R$ ${Math.abs(diffTotal).toFixed(2)}`} em relação a 2026</span>
                </div>
                <div className="flex justify-between items-end pt-1">
                  <span className="text-sm font-bold font-display uppercase tracking-wider text-emerald-100">
                    Mensalidade Proposta 2027:
                  </span>
                  <span className="text-xl font-extrabold text-brand-orange font-display">
                    R$ {total2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION: Status da Resposta dos Pais / Atendimento */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 font-display uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={18} className="text-brand-green-dark" />
            Resposta da Família / Status da Intenção de Rematrícula 2027
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setStatusIntencao('Confirmada')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                statusIntencao === 'Confirmada'
                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Sim, Rematricular</span>
                <CheckCircle size={16} className={statusIntencao === 'Confirmada' ? 'text-white' : 'text-emerald-500'} />
              </div>
              <span className="text-[10px] opacity-80">Família confirma interesse na rematrícula 2027</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusIntencao('Em Análise')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                statusIntencao === 'Em Análise'
                  ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Em Análise / Contato</span>
                <HelpCircle size={16} className={statusIntencao === 'Em Análise' ? 'text-white' : 'text-amber-500'} />
              </div>
              <span className="text-[10px] opacity-80">Solicitou conversa ou revisão de valor</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusIntencao('Não Renovará')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                statusIntencao === 'Não Renovará'
                  ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Não Pretende Renovar</span>
                <XCircle size={16} className={statusIntencao === 'Não Renovará' ? 'text-white' : 'text-rose-500'} />
              </div>
              <span className="text-[10px] opacity-80">Não continuará no próximo ano letivo</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusIntencao('Pendente')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                statusIntencao === 'Pendente'
                  ? 'bg-slate-700 text-white border-slate-800 ring-2 ring-slate-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Aguardando Retorno</span>
                <Clock size={16} className={statusIntencao === 'Pendente' ? 'text-white' : 'text-slate-400'} />
              </div>
              <span className="text-[10px] opacity-80">Ainda não enviou a carta de intenção</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações e Comentários da Família / Atendimento:
            </label>
            <textarea
              rows={2}
              value={observacoesFamilia}
              onChange={(e) => setObservacoesFamilia(e.target.value)}
              placeholder="Ex: Família solicitou manutenção do desconto do irmão; prefere horário de saída às 17:30."
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-orange outline-none"
            />
          </div>
        </div>

        {/* ACTION BUTTONS FOOTER */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copiar link direto para o responsável preencher a carta no celular"
            >
              <Link2 size={16} className="text-amber-700" />
              {linkCopied ? 'Link Copiado!' : 'Copiar Link para os Pais'}
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Copiar mensagem formatada com link e abrir WhatsApp"
            >
              <MessageCircle size={16} />
              {isCopied ? 'Copiado & Abrindo WhatsApp!' : 'Enviar no WhatsApp'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenParentPortal) {
                  onOpenParentPortal(student.id);
                } else {
                  window.open(parentUrl, '_blank');
                }
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Abrir a visão pública dos pais para testar a experiência no navegador"
            >
              <ExternalLink size={16} className="text-slate-600" />
              Testar Visão dos Pais
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={16} />
              Imprimir Carta (PDF)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={16} /> Salvo no sistema!
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveForm}
              className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold font-display uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={18} />
              Salvar Intenção no Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
