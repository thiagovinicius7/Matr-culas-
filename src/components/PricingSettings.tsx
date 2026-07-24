import React, { useState } from 'react';
import { RegularClass, ContraturnoPrice } from '../types';
import { REGULAR_CLASSES } from '../data';
import { DollarSign, Check, RotateCcw, Info, Sliders, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingSettingsProps {
  classPrices: RegularClass[];
  contraturnoPrices: ContraturnoPrice[];
  onSavePrices: (updatedClasses: RegularClass[], updatedContraturno: ContraturnoPrice[]) => void;
}

export default function PricingSettings({
  classPrices,
  contraturnoPrices,
  onSavePrices
}: PricingSettingsProps) {
  const [localClasses, setLocalClasses] = useState<RegularClass[]>([...classPrices]);
  const [localContraturno, setLocalContraturno] = useState<ContraturnoPrice[]>([...contraturnoPrices]);
  const [isSaved, setIsSaved] = useState(false);

  const handleClassPriceChange = (id: string, value: number) => {
    setLocalClasses(prev => prev.map(c => c.id === id ? { ...c, valorMensal: value } : c));
    setIsSaved(false);
  };

  const handleContraturnoPriceChange = (id: string, field: 'valorParcial' | 'valorCompleto', value: number) => {
    setLocalContraturno(prev => prev.map(cp => cp.id === id ? { ...cp, [field]: value } : cp));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSavePrices(localClasses, localContraturno);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  const handleRestoreDefaults = () => {
    if (confirm('Deseja restaurar todos os valores para os padrões originais do Sítio Geranium?')) {
      const defaultContraturno: ContraturnoPrice[] = [
        { id: 'avulso', frequencia: 0, valorParcial: 80, valorCompleto: 130 },
        { id: 'freq_1', frequencia: 1, valorParcial: 300, valorCompleto: 500 },
        { id: 'freq_2', frequencia: 2, valorParcial: 550, valorCompleto: 900 },
        { id: 'freq_3', frequencia: 3, valorParcial: 750, valorCompleto: 1250 },
        { id: 'freq_4', frequencia: 4, valorParcial: 950, valorCompleto: 1550 },
        { id: 'freq_5', frequencia: 5, valorParcial: 1100, valorCompleto: 1800 }
      ];
      setLocalClasses([...REGULAR_CLASSES]);
      setLocalContraturno(defaultContraturno);
      onSavePrices([...REGULAR_CLASSES], defaultContraturno);
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
          <p className="text-xs text-slate-505">
            Atualize os valores de referência cobrados pelo Sítio-Escola. As novas matrículas e simulações utilizarão estes valores.
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
            {isSaved ? 'Configurações Salvas!' : 'Salvar Novos Valores'}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-2">
          <Info size={14} />
          Os valores de mensalidade foram gravados na nuvem e atualizados com sucesso em todo o sistema.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Classes Column */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🐝</span> Mensalidades Regulares (Por Turma)
            </h3>
            <p className="text-[10px] text-slate-400">Classificação conforme data de corte (31 de Março).</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
            {localClasses.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800">{c.nome}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      c.natureza === 'Fundamental' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.natureza}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Idade de referência: {c.idadeRef} anos</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={c.valorMensal}
                    onChange={(e) => handleClassPriceChange(c.id, Number(e.target.value))}
                    className="w-24 text-xs font-mono font-bold px-2 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contraturno Frequencies Column */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌳</span> Valores do Contraturno (Frequência Semanal)
            </h3>
            <p className="text-[10px] text-slate-400">Valores para os períodos Parcial e Completo.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <div className="col-span-4">Frequência</div>
              <div className="col-span-4 text-center">Período Parcial</div>
              <div className="col-span-4 text-center">Período Completo</div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
              {localContraturno.map((cp) => (
                <div key={cp.id} className="py-2.5 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-xs text-slate-800">
                      {cp.frequencia === 0 ? 'Avulso (diária)' : `${cp.frequencia}x na semana`}
                    </span>
                  </div>

                  {/* Parcial input */}
                  <div className="col-span-4 flex items-center gap-1 justify-center">
                    <span className="text-[10px] text-slate-405 font-bold">R$</span>
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
                  <div className="col-span-4 flex items-center gap-1 justify-center">
                    <span className="text-[10px] text-slate-405 font-bold">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="20"
                      value={cp.valorCompleto}
                      onChange={(e) => handleContraturnoPriceChange(cp.id, 'valorCompleto', Number(e.target.value))}
                      className="w-20 text-xs font-mono font-bold px-1.5 py-1 border border-slate-200 rounded-md focus:border-slate-500 focus:outline-none text-right"
                    />
                  </div>
                </div>
              ))}
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
