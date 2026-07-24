import React, { useState, useEffect } from 'react';
import { RegularClass, ContraturnoPrice } from '../types';
import { REGULAR_CLASSES } from '../data';
import { DollarSign, Check, RotateCcw, Info, Sliders, Shield, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingSettingsProps {
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  onSavePrices: (updatedClasses: RegularClass[], updatedContraturno: ContraturnoPrice[], year: number) => void;
}

export default function PricingSettings({
  classPrices,
  contraturnoPrices,
  onSavePrices
}: PricingSettingsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customYears, setCustomYears] = useState<number[]>([]);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [yearError, setYearError] = useState('');

  const [localClasses, setLocalClasses] = useState<RegularClass[]>([]);
  const [localContraturno, setLocalContraturno] = useState<ContraturnoPrice[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Derive available years
  const availableYears = Array.from(
    new Set([
      2026,
      ...classPrices.map(c => c.ano || 2026),
      ...contraturnoPrices.map(cp => cp.ano || 2026),
      ...customYears
    ])
  ).sort((a, b) => a - b);

  // Sync local states when selectedYear or classPrices change
  useEffect(() => {
    const classesForYear = classPrices.filter(c => (c.ano || 2026) === selectedYear);
    if (classesForYear.length > 0) {
      setLocalClasses(classesForYear.map(c => ({ ...c, ano: selectedYear })));
    } else {
      // Find base classes to copy (prefer 2026, or whatever is available)
      const baseYear = classPrices.some(c => (c.ano || 2026) === 2026) ? 2026 : (classPrices[0]?.ano || 2026);
      const baseClasses = classPrices.filter(c => (c.ano || 2026) === baseYear);
      if (baseClasses.length > 0) {
        const copied = baseClasses.map(c => ({
          ...c,
          id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ano: selectedYear
        }));
        setLocalClasses(copied);
      } else {
        // Fallback to static defaults
        const copied = REGULAR_CLASSES.map(c => ({
          ...c,
          id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ano: selectedYear
        }));
        setLocalClasses(copied);
      }
    }
  }, [classPrices, selectedYear]);

  useEffect(() => {
    const contraturnoForYear = contraturnoPrices.filter(cp => (cp.ano || 2026) === selectedYear);
    if (contraturnoForYear.length > 0) {
      setLocalContraturno(contraturnoForYear.map(cp => ({ ...cp, ano: selectedYear })));
    } else {
      const baseYear = contraturnoPrices.some(cp => (cp.ano || 2026) === 2026) ? 2026 : (contraturnoPrices[0]?.ano || 2026);
      const baseContraturno = contraturnoPrices.filter(cp => (cp.ano || 2026) === baseYear);
      if (baseContraturno.length > 0) {
        const copied = baseContraturno.map(cp => ({
          ...cp,
          id: `freq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ano: selectedYear
        }));
        setLocalContraturno(copied);
      } else {
        const defaultContraturno: ContraturnoPrice[] = [
          { id: 'avulso', frequencia: 0, valorParcial: 100, valorCompleto: 120, ano: selectedYear },
          { id: 'freq_1', frequencia: 1, valorParcial: 220, valorCompleto: 260, ano: selectedYear },
          { id: 'freq_2', frequencia: 2, valorParcial: 460, valorCompleto: 520, ano: selectedYear },
          { id: 'freq_3', frequencia: 3, valorParcial: 630, valorCompleto: 690, ano: selectedYear },
          { id: 'freq_4', frequencia: 4, valorParcial: 775, valorCompleto: 862.5, ano: selectedYear },
          { id: 'freq_5', frequencia: 5, valorParcial: 920, valorCompleto: 1035, ano: selectedYear }
        ];
        setLocalContraturno(defaultContraturno);
      }
    }
  }, [contraturnoPrices, selectedYear]);

  const handleClassFieldChange = (id: string, field: keyof RegularClass, value: any) => {
    setLocalClasses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setIsSaved(false);
  };

  const handleContraturnoPriceChange = (id: string, field: keyof ContraturnoPrice, value: any) => {
    setLocalContraturno(prev => prev.map(cp => cp.id === id ? { ...cp, [field]: value } : cp));
    setIsSaved(false);
  };

  const handleAddClass = () => {
    const newId = `class_${Date.now()}`;
    const newCls: RegularClass = {
      id: newId,
      nome: 'Nova Turma',
      natureza: 'Infantil',
      idadeRef: 4,
      valorMensal: 1000,
      ano: selectedYear
    };
    setLocalClasses(prev => [...prev, newCls]);
    setIsSaved(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma? Todas as simulações futuras que dependam desta idade serão afetadas.')) {
      setLocalClasses(prev => prev.filter(c => c.id !== id));
      setIsSaved(false);
    }
  };

  const handleAddContraturno = () => {
    const newId = `freq_${Date.now()}`;
    const maxFreq = localContraturno.reduce((max, item) => Math.max(max, item.frequencia), 0);
    const newCt: ContraturnoPrice = {
      id: newId,
      frequencia: maxFreq >= 5 ? maxFreq + 1 : maxFreq + 1,
      valorParcial: 300,
      valorCompleto: 500,
      ano: selectedYear
    };
    setLocalContraturno(prev => [...prev, newCt].sort((a, b) => a.frequencia - b.frequencia));
    setIsSaved(false);
  };

  const handleDeleteContraturno = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta frequência de contraturno?')) {
      setLocalContraturno(prev => prev.filter(cp => cp.id !== id));
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    onSavePrices(localClasses, localContraturno, selectedYear);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  const handleRestoreDefaults = () => {
    if (confirm(`Deseja restaurar todos os valores para os padrões originais do Sítio Geranium para o ano ${selectedYear}? Isso substituirá as edições atuais deste ano.`)) {
      const defaultContraturno: ContraturnoPrice[] = [
        { id: `avulso`, frequencia: 0, valorParcial: 100, valorCompleto: 120, ano: selectedYear },
        { id: `freq_1`, frequencia: 1, valorParcial: 220, valorCompleto: 260, ano: selectedYear },
        { id: `freq_2`, frequencia: 2, valorParcial: 460, valorCompleto: 520, ano: selectedYear },
        { id: `freq_3`, frequencia: 3, valorParcial: 630, valorCompleto: 690, ano: selectedYear },
        { id: `freq_4`, frequencia: 4, valorParcial: 775, valorCompleto: 862.5, ano: selectedYear },
        { id: `freq_5`, frequencia: 5, valorParcial: 920, valorCompleto: 1035, ano: selectedYear }
      ];
      const defaultClasses = REGULAR_CLASSES.map(rc => ({ ...rc, id: `${selectedYear}_${rc.id}`, ano: selectedYear }));
      setLocalClasses(defaultClasses);
      setLocalContraturno(defaultContraturno);
      onSavePrices(defaultClasses, defaultContraturno, selectedYear);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="pricing-settings-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Sliders size={18} className="text-orange-500" />
            Configuração de Mensalidades & Contraturno
          </h2>
          <p className="text-xs text-slate-500">
            Crie, remova ou atualize os valores de referência cobrados pelo Sítio-Escola. As simulações utilizarão estes valores em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
            title="Restaurar valores de fábrica"
          >
            <RotateCcw size={12} />
            Padrões
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            {isSaved ? <Check size={12} /> : <DollarSign size={12} />}
            {isSaved ? 'Configurações Salvas!' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-2">
          <Info size={14} />
          Os valores de mensalidade foram gravados na nuvem e atualizados com sucesso em todo o sistema.
        </div>
      )}

      {/* Year Selector Widget */}
      <div className="bg-orange-50/60 p-3 rounded-lg border border-orange-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Ano de Vigência das Mensalidades:</span>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setIsSaved(false);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded-md border border-slate-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {showAddYear ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              pattern="\d*"
              maxLength={4}
              placeholder="Ex: 2027"
              value={newYearInput}
              onChange={(e) => {
                setNewYearInput(e.target.value.replace(/\D/g, ''));
                setYearError('');
              }}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-orange-500 focus:outline-none w-24 bg-white font-bold"
            />
            <button
              onClick={() => {
                const parsed = parseInt(newYearInput, 10);
                if (isNaN(parsed) || parsed < 2000 || parsed > 2100) {
                  setYearError('Ano inválido.');
                  return;
                }
                if (availableYears.includes(parsed)) {
                  setYearError('Ano já cadastrado.');
                  return;
                }
                setCustomYears(prev => [...prev, parsed]);
                setSelectedYear(parsed);
                setShowAddYear(false);
                setNewYearInput('');
                setYearError('');
              }}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold rounded-md cursor-pointer transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                setShowAddYear(false);
                setNewYearInput('');
                setYearError('');
              }}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold"
            >
              Cancelar
            </button>
            {yearError && <span className="text-[10px] font-semibold text-rose-600">{yearError}</span>}
          </div>
        ) : (
          <button
            onClick={() => setShowAddYear(true)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={11} />
            Adicionar Novo Ano
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Regular Classes Column */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🐝</span> Mensalidades Regulares (Por Turma)
              </h3>
              <p className="text-[10px] text-slate-405 mt-0.5">Defina o nome, natureza, idade e valor mensal.</p>
            </div>
            <button
              onClick={handleAddClass}
              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={12} />
              Adicionar Turma
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 space-y-3">
            {localClasses.map((c) => (
              <div key={c.id} className="pt-3 pb-1 space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      value={c.nome}
                      onChange={(e) => handleClassFieldChange(c.id, 'nome', e.target.value)}
                      placeholder="Nome da Turma"
                      className="w-full text-xs font-bold px-2 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <select
                      value={c.natureza}
                      onChange={(e) => handleClassFieldChange(c.id, 'natureza', e.target.value as any)}
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none bg-white"
                    >
                      <option value="Infantil">Infantil</option>
                      <option value="Fundamental">Fundamental</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-2 flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">Idade:</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={c.idadeRef}
                      onChange={(e) => handleClassFieldChange(c.id, 'idadeRef', Number(e.target.value))}
                      className="w-full text-xs px-1.5 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-center"
                    />
                  </div>

                  <div className="col-span-9 sm:col-span-2 flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={c.valorMensal}
                      onChange={(e) => handleClassFieldChange(c.id, 'valorMensal', Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-1.5 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-right"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => handleDeleteClass(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Excluir turma"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {localClasses.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8 italic">Nenhuma turma configurada. Clique em "Adicionar Turma" ou "Padrões".</p>
            )}
          </div>
        </div>

        {/* Contraturno Frequencies Column */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🌳</span> Valores do Contraturno (Frequência)
              </h3>
              <p className="text-[10px] text-slate-405 mt-0.5">Defina diária/frequência e os valores parciais/completos.</p>
            </div>
            <button
              onClick={handleAddContraturno}
              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={12} />
              Adicionar Frequência
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <div className="col-span-4">Freq./Diária</div>
              <div className="col-span-4 text-center">Período Parcial</div>
              <div className="col-span-3 text-center">Completo</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1 space-y-1">
              {localContraturno.map((cp) => (
                <div key={cp.id} className="py-2.5 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={cp.frequencia}
                      onChange={(e) => handleContraturnoPriceChange(cp.id, 'frequencia', Number(e.target.value))}
                      className="w-12 text-xs font-bold px-1 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-center"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">
                      {cp.frequencia === 0 ? 'Avulso (diária)' : 'x / sem'}
                    </span>
                  </div>

                  {/* Parcial input */}
                  <div className="col-span-4 flex items-center gap-1 justify-center">
                    <span className="text-[10px] text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="20"
                      value={cp.valorParcial}
                      onChange={(e) => handleContraturnoPriceChange(cp.id, 'valorParcial', Number(e.target.value))}
                      className="w-20 text-xs font-mono font-bold px-1.5 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-right"
                    />
                  </div>

                  {/* Completo input */}
                  <div className="col-span-3 flex items-center gap-1 justify-center">
                    <span className="text-[10px] text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="20"
                      value={cp.valorCompleto}
                      onChange={(e) => handleContraturnoPriceChange(cp.id, 'valorCompleto', Number(e.target.value))}
                      className="w-20 text-xs font-mono font-bold px-1.5 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-right"
                    />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleDeleteContraturno(cp.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title="Excluir frequência"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {localContraturno.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-8 italic">Nenhuma frequência configurada. Clique em "Adicionar Frequência" ou "Padrões".</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice block */}
      <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg flex items-start gap-3">
        <Shield size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aviso de Segurança e Auditoria</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Alterar estes valores de referência não modificará as rematrículas ou os contratos retroativos que já foram negociados e confirmados. Para aplicar um novo valor ou reajustar uma rematrícula existente, utilize a Calculadora de Acordo na ficha do aluno desejado ou faça o ajuste diretamente através da lista de trabalho.
          </p>
        </div>
      </div>
    </div>
  );
}
