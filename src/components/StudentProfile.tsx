import React, { useState, useEffect, useRef } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, FinancialMovement, RegularClass } from '../types';
import { REGULAR_CLASSES, calculateAgeAtCutoff, getRegularClassForAge } from '../data';
import { User, Phone, Shield, Plus, Edit2, Trash2, Calendar, FileText, Check, X, AlertCircle, FileImage, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';

interface StudentProfileProps {
  students: Student[];
  guardians: Guardian[];
  enrollments: Enrollment[];
  contraturnos: ContraturnoSegment[];
  movements: FinancialMovement[];
  classPrices: RegularClass[];
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
  onNavigateWithStudent?: (tabId: string, studentId: string) => void;
  onAddStudent: (student: Student, guardiansList: Omit<Guardian, 'id' | 'alunoId'>[]) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddGuardian: (guardian: Omit<Guardian, 'id'>) => void;
  onDeleteGuardian: (id: string) => void;
  onUpdateGuardian: (guardian: Guardian) => void;
  onUpdateEnrollmentClass: (alunoId: string, turmaRegularId: string) => void;
}

export default function StudentProfile({
  students,
  guardians,
  enrollments,
  contraturnos,
  movements,
  classPrices,
  selectedStudentId: propSelectedStudentId,
  onSelectStudent,
  onNavigateWithStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddGuardian,
  onDeleteGuardian,
  onUpdateGuardian,
  onUpdateEnrollmentClass
}: StudentProfileProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(propSelectedStudentId || students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  // Controla se o painel de detalhes aparece como overlay em telas pequenas
  // (evita ter que rolar até o fim da lista para ver a ficha do aluno)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (propSelectedStudentId) {
      setSelectedStudentId(propSelectedStudentId);
    }
  }, [propSelectedStudentId]);

  // Form states for new/editing student
  const [formNome, setFormNome] = useState('');
  const [formNascimento, setFormNascimento] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formStatus, setFormStatus] = useState<'ativo' | 'inativo'>('ativo');
  
  // Guardians list during student creation
  const [tempGuardians, setTempGuardians] = useState<Omit<Guardian, 'id' | 'alunoId'>[]>([
    { nome: '', parentesco: 'Mãe', contato: '', financeiro: true }
  ]);

  // Form state for adding single guardian to existing student
  const [newGuardianNome, setNewGuardianNome] = useState('');
  const [newGuardianParentesco, setNewGuardianParentesco] = useState('Mãe');
  const [newGuardianContato, setNewGuardianContato] = useState('');
  const [newGuardianFinanceiro, setNewGuardianFinanceiro] = useState(false);
  const [isAddingSingleGuardian, setIsAddingSingleGuardian] = useState(false);

  // Guardian editing states
  const [editingGuardianId, setEditingGuardianId] = useState<string | null>(null);
  const [editGuardianNome, setEditGuardianNome] = useState('');
  const [editGuardianParentesco, setEditGuardianParentesco] = useState('Mãe');
  const [editGuardianContato, setEditGuardianContato] = useState('');
  const [editGuardianFinanceiro, setEditGuardianFinanceiro] = useState(false);

  // Class override states
  const [isOverridingClass, setIsOverridingClass] = useState(false);
  const [overrideClassId, setOverrideClassId] = useState('');

  const startEditGuardian = (g: Guardian) => {
    setEditingGuardianId(g.id);
    setEditGuardianNome(g.nome);
    setEditGuardianParentesco(g.parentesco);
    setEditGuardianContato(g.contato);
    setEditGuardianFinanceiro(g.financeiro);
  };

  const cancelEditGuardian = () => {
    setEditingGuardianId(null);
  };

  const handleSaveGuardianEdit = (e: React.FormEvent, guardianId: string) => {
    e.preventDefault();
    if (!editGuardianNome.trim() || !editGuardianContato.trim()) {
      alert('Preencha o nome e o contato do responsável.');
      return;
    }
    onUpdateGuardian({
      id: guardianId,
      alunoId: selectedStudentId,
      nome: editGuardianNome,
      parentesco: editGuardianParentesco,
      contato: editGuardianContato,
      financeiro: editGuardianFinanceiro
    });
    setEditingGuardianId(null);
  };

  // Selected student computation
  const activeStudent = students.find(s => s.id === selectedStudentId);
  const activeGuardians = guardians.filter(g => g.alunoId === selectedStudentId);
  const activeEnrollments = enrollments.filter(e => e.alunoId === selectedStudentId);
  const activeContraturnos = contraturnos.filter(c => c.alunoId === selectedStudentId);
  const activeMovements = movements.filter(m => m.alunoId === selectedStudentId).sort((a,b) => b.data.localeCompare(a.data));

  const profileRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!profileRef.current || !activeStudent) return;
    setIsExporting(true);
    try {
      const element = profileRef.current;
      // Get the full un-scrolled dimensions of the card
      const originalWidth = element.scrollWidth;
      const originalHeight = element.scrollHeight;

      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#FDFBF7', // match brand-cream perfectly
        width: originalWidth,
        height: originalHeight,
        style: {
          padding: '24px',
          borderRadius: '12px',
          overflow: 'visible',
          height: 'auto',
          maxHeight: 'none',
        },
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `Ficha_${activeStudent.nome.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem da ficha:', error);
      alert('Não foi possível gerar a imagem da ficha.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintFicha = () => {
    window.print();
  };

  // Age calculations
  const currentAge = activeStudent ? calculateAgeAtCutoff(activeStudent.nascimento, 2026) : 0;
  const suggestedClass = activeStudent ? getRegularClassForAge(currentAge) : null;

  // Filter student list
  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startAddStudent = () => {
    setFormNome('');
    setFormNascimento('');
    setFormObservacoes('');
    setFormStatus('ativo');
    setTempGuardians([{ nome: '', parentesco: 'Mãe', contato: '', financeiro: true }]);
    setIsAddingStudent(true);
    setMobileDetailOpen(true);
  };

  const saveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formNascimento) {
      alert('Por favor, preencha o Nome e a Data de Nascimento.');
      return;
    }

    const newStudent: Student = {
      id: 'student_' + Date.now(),
      nome: formNome,
      nascimento: formNascimento,
      dataEntrada: new Date().toISOString().split('T')[0],
      observacoes: formObservacoes,
      status: formStatus
    };

    // Filter out incomplete guardians
    const validTempGuardians = tempGuardians.filter(g => g.nome.trim() !== '');
    if (validTempGuardians.length === 0) {
      alert('Por favor, preencha os dados de ao menos um responsável.');
      return;
    }

    // Ensure at least one financial guardian
    const hasFinancial = validTempGuardians.some(g => g.financeiro);
    if (!hasFinancial) {
      validTempGuardians[0].financeiro = true;
    }

    onAddStudent(newStudent, validTempGuardians);
    setSelectedStudentId(newStudent.id);
    setIsAddingStudent(false);
  };

  const startEditStudent = () => {
    if (!activeStudent) return;
    setFormNome(activeStudent.nome);
    setFormNascimento(activeStudent.nascimento);
    setFormObservacoes(activeStudent.observacoes);
    setFormStatus(activeStudent.status);
    setIsEditingStudent(true);
    setMobileDetailOpen(true);
  };

  const saveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    onUpdateStudent({
      ...activeStudent,
      nome: formNome,
      nascimento: formNascimento,
      observacoes: formObservacoes,
      status: formStatus
    });
    setIsEditingStudent(false);
  };

  const addTempGuardianRow = () => {
    setTempGuardians([...tempGuardians, { nome: '', parentesco: 'Outro', contato: '', financeiro: false }]);
  };

  const updateTempGuardian = (index: number, field: keyof Omit<Guardian, 'id' | 'alunoId'>, value: any) => {
    const updated = [...tempGuardians];
    if (field === 'financeiro' && value === true) {
      // Toggle off financial on all other temp guardians
      updated.forEach((g, idx) => {
        g.financeiro = idx === index;
      });
    } else {
      updated[index] = { ...updated[index], [field]: value } as any;
    }
    setTempGuardians(updated);
  };

  const removeTempGuardianRow = (index: number) => {
    if (tempGuardians.length === 1) return;
    setTempGuardians(tempGuardians.filter((_, idx) => idx !== index));
  };

  const handleAddSingleGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardianNome.trim()) return;

    onAddGuardian({
      alunoId: selectedStudentId,
      nome: newGuardianNome,
      parentesco: newGuardianParentesco,
      contato: newGuardianContato,
      financeiro: newGuardianFinanceiro
    });

    setNewGuardianNome('');
    setNewGuardianParentesco('Mãe');
    setNewGuardianContato('');
    setNewGuardianFinanceiro(false);
    setIsAddingSingleGuardian(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="student-ficha-root">
      {/* Sidebar: Student list & search */}
      <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Alunos cadastrados</h3>
          <button
            onClick={startAddStudent}
            className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            Novo Aluno
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome do aluno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
          {filteredStudents.map((st) => {
            const isSelected = st.id === selectedStudentId;
            const bAge = calculateAgeAtCutoff(st.nascimento, 2026);
            const bClass = getRegularClassForAge(bAge);
            return (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudentId(st.id);
                  onSelectStudent?.(st.id);
                  setIsAddingStudent(false);
                  setIsEditingStudent(false);
                  setIsAddingSingleGuardian(false);
                  setMobileDetailOpen(true);
                }}
                className={`w-full text-left p-2.5 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{st.nome}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Nasc: {new Date(st.nascimento + 'T00:00:00').toLocaleDateString('pt-BR')} • {bAge} anos
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    st.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {st.status}
                  </span>
                  <span className="text-[9px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {bClass.nome}
                  </span>
                </div>
              </button>
            );
          })}
          {filteredStudents.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum aluno encontrado.</p>
          )}
        </div>
      </div>

      {/* Main Panel: Selected Ficha or Add Student form.
          No mobile, funciona como um overlay de tela cheia (evita ter que
          rolar até o fim da lista para ver a ficha); no desktop (lg+) fica
          sempre visível lado a lado com a lista. */}
      <div className={
        (mobileDetailOpen ? 'fixed inset-0 z-50 bg-slate-50 overflow-y-auto p-4 ' : 'hidden ') +
        'lg:static lg:z-auto lg:bg-transparent lg:p-0 lg:overflow-visible lg:block lg:col-span-8'
      }>
        <button
          onClick={() => setMobileDetailOpen(false)}
          className="lg:hidden flex items-center gap-1 text-xs font-bold text-slate-600 mb-3 cursor-pointer"
        >
          ‹ Voltar para a lista
        </button>
        <AnimatePresence mode="wait">
          {isAddingStudent ? (
            /* ADD NEW STUDENT FORM */
            <motion.div
              key="add-student"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ficha de Matrícula: Novo Aluno</h3>
                <button
                  onClick={() => setIsAddingStudent(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveNewStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Nome do Aluno</label>
                    <input
                      type="text"
                      required
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      placeholder="Nome completo da criança"
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Data de Nascimento</label>
                    <input
                      type="date"
                      required
                      value={formNascimento}
                      onChange={(e) => setFormNascimento(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">A data de corte para determinação de turma é 31/03.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Observações de Saúde/Pedagógicas</label>
                  <textarea
                    rows={2}
                    value={formObservacoes}
                    onChange={(e) => setFormObservacoes(e.target.value)}
                    placeholder="Restrições alimentares, alergias, cuidados médicos ou notas gerais"
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                {/* Subform: Guardians list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Responsáveis Familiares</h4>
                    <button
                      type="button"
                      onClick={addTempGuardianRow}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      Adicionar Responsável
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {tempGuardians.map((tg, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-md border border-slate-150 grid grid-cols-1 md:grid-cols-12 gap-3 items-end relative">
                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Nome</label>
                          <input
                            type="text"
                            required
                            placeholder="Nome do responsável"
                            value={tg.nome}
                            onChange={(e) => updateTempGuardian(idx, 'nome', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Parentesco</label>
                          <select
                            value={tg.parentesco}
                            onChange={(e) => updateTempGuardian(idx, 'parentesco', e.target.value)}
                            className="w-full text-xs px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                          >
                            <option value="Mãe">Mãe</option>
                            <option value="Pai">Pai</option>
                            <option value="Avó">Avó/Avô</option>
                            <option value="Tio">Tio/Tia</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Contato (Tel/WA)</label>
                          <input
                            type="text"
                            required
                            placeholder="(11) 99999-9999"
                            value={tg.contato}
                            onChange={(e) => updateTempGuardian(idx, 'contato', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center h-[34px] gap-2">
                          <input
                            type="checkbox"
                            id={`fin-${idx}`}
                            checked={tg.financeiro}
                            onChange={(e) => updateTempGuardian(idx, 'financeiro', e.target.checked)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                          />
                          <label htmlFor={`fin-${idx}`} className="text-xs text-slate-600 font-bold select-none cursor-pointer">Financeiro</label>
                        </div>

                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            disabled={tempGuardians.length === 1}
                            onClick={() => removeTempGuardianRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    Matricular Aluno
                  </button>
                </div>
              </form>
            </motion.div>
          ) : isEditingStudent && activeStudent ? (
            /* EDIT INDIVIDUAL STUDENT FORM */
            <motion.div
              key="edit-student"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Editar Aluno: {activeStudent.nome}</h3>
                <button
                  onClick={() => setIsEditingStudent(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveEditStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Nome do Aluno</label>
                    <input
                      type="text"
                      required
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Data de Nascimento</label>
                    <input
                      type="date"
                      required
                      value={formNascimento}
                      onChange={(e) => setFormNascimento(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Status Operacional</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none bg-white"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Data de Entrada</label>
                    <input
                      type="text"
                      disabled
                      value={new Date(activeStudent.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR')}
                      className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Observações</label>
                  <textarea
                    rows={3}
                    value={formObservacoes}
                    onChange={(e) => setFormObservacoes(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 focus:border-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setIsEditingStudent(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          ) : activeStudent ? (
            /* COMPREHENSIVE STUDENT DETAILS (FICHA) */
            <motion.div
              key="student-ficha-details"
              ref={profileRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {/* Header Ficha card */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 flex gap-1">
                  <button
                    onClick={startEditStudent}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                    title="Editar ficha básica"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o cadastro de ${activeStudent.nome}?`)) {
                        onDeleteStudent(activeStudent.id);
                        setSelectedStudentId(students[0]?.id || '');
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                    title="Excluir cadastro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg uppercase shadow-xs border border-emerald-200">
                    {activeStudent.nome.charAt(0)}
                  </div>
                  <div className="space-y-1 pr-16">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{activeStudent.nome}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        activeStudent.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {activeStudent.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>Nascimento: <strong className="font-bold">{new Date(activeStudent.nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></span>
                      <span>•</span>
                      <span>Idade (Corte 31/03): <strong className="font-bold">{currentAge} anos</strong></span>
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Inscrito no Sítio em: {new Date(activeStudent.dataEntrada + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Direct Actions bar requested by user */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2" id="student-profile-actions-bar">
                  <button
                    onClick={() => onNavigateWithStudent?.('negotiation', activeStudent.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calculator size={13} />
                    Ir para Calculadora de Acordo
                  </button>
                  <button
                    onClick={handleExportImage}
                    disabled={isExporting}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <FileImage size={13} />
                    {isExporting ? 'Gerando Imagem...' : 'Gerar Imagem para Enviar'}
                  </button>
                  <button
                    onClick={handlePrintFicha}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText size={13} />
                    Salvar em PDF / Imprimir
                  </button>
                </div>

                {activeStudent.observacoes && (
                  <div className="mt-3 p-3 bg-orange-50/50 border border-orange-200 rounded-md text-xs text-slate-700">
                    <span className="font-bold text-orange-800 flex items-center gap-1.5 mb-0.5">
                      <AlertCircle size={14} /> Observações importantes
                    </span>
                    {activeStudent.observacoes}
                  </div>
                )}
              </div>

              {/* Grid: Guardians & Contract summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guardians Ficha segment */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Responsáveis</h4>
                    <button
                      onClick={() => setIsAddingSingleGuardian(!isAddingSingleGuardian)}
                      className="text-xs text-orange-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      {isAddingSingleGuardian ? 'Cancelar' : '+ Adicionar'}
                    </button>
                  </div>

                  {isAddingSingleGuardian && (
                    <form onSubmit={handleAddSingleGuardian} className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={newGuardianNome}
                          onChange={(e) => setNewGuardianNome(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Parentesco</label>
                          <select
                            value={newGuardianParentesco}
                            onChange={(e) => setNewGuardianParentesco(e.target.value)}
                            className="w-full text-xs px-2 py-1.5 rounded-md border border-slate-200 bg-white bg-no-repeat"
                          >
                            <option value="Mãe">Mãe</option>
                            <option value="Pai">Pai</option>
                            <option value="Avó">Avó/Avô</option>
                            <option value="Tio">Tio/Tia</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Contato</label>
                          <input
                            type="text"
                            required
                            placeholder="(11) 99999-9999"
                            value={newGuardianContato}
                            onChange={(e) => setNewGuardianContato(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="single-fin"
                          checked={newGuardianFinanceiro}
                          onChange={(e) => setNewGuardianFinanceiro(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-slate-500"
                        />
                        <label htmlFor="single-fin" className="text-xs text-slate-600 font-bold cursor-pointer">Responsável Financeiro</label>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                      >
                        Salvar Responsável
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {activeGuardians.map((g) => {
                      if (editingGuardianId === g.id) {
                        return (
                          <form 
                            key={g.id} 
                            onSubmit={(e) => handleSaveGuardianEdit(e, g.id)}
                            className="p-3 bg-slate-100 rounded-lg border border-orange-200 space-y-2 text-left"
                          >
                            <div className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">Editar Responsável</div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500">Nome</label>
                              <input
                                type="text"
                                required
                                value={editGuardianNome}
                                onChange={(e) => setEditGuardianNome(e.target.value)}
                                className="w-full text-xs px-2 py-1 rounded-md border border-slate-300 bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500">Parentesco</label>
                                <select
                                  value={editGuardianParentesco}
                                  onChange={(e) => setEditGuardianParentesco(e.target.value)}
                                  className="w-full text-xs px-1.5 py-1 rounded-md border border-slate-300 bg-white"
                                >
                                  <option value="Mãe">Mãe</option>
                                  <option value="Pai">Pai</option>
                                  <option value="Avó">Avó/Avô</option>
                                  <option value="Tio">Tio/Tia</option>
                                  <option value="Outro">Outro</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500">Contato</label>
                                <input
                                  type="text"
                                  required
                                  value={editGuardianContato}
                                  onChange={(e) => setEditGuardianContato(e.target.value)}
                                  className="w-full text-xs px-2 py-1 rounded-md border border-slate-300 bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id={`edit-fin-${g.id}`}
                                  checked={editGuardianFinanceiro}
                                  onChange={(e) => setEditGuardianFinanceiro(e.target.checked)}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                                />
                                <label htmlFor={`edit-fin-${g.id}`} className="text-[11px] text-slate-700 font-bold cursor-pointer">Financeiro</label>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={cancelEditGuardian}
                                  className="px-2 py-1 border border-slate-300 text-[10px] font-bold text-slate-600 bg-white rounded-md hover:bg-slate-50"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div key={g.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between bg-slate-50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-800">{g.nome}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">({g.parentesco})</span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {g.contato}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {g.financeiro && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 mr-1">
                                <Shield size={10} /> Fin
                              </span>
                            )}
                            <button
                              onClick={() => startEditGuardian(g)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer animate-none"
                              title="Editar responsável"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (activeGuardians.length === 1) {
                                  alert('O aluno precisa ter pelo menos 1 responsável cadastrado.');
                                  return;
                                }
                                if (g.financeiro) {
                                  alert('Escolha outro responsável financeiro antes de remover este.');
                                  return;
                                }
                                if (confirm(`Remover responsável ${g.nome}?`)) {
                                  onDeleteGuardian(g.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer animate-none"
                              title="Remover responsável"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enrollment Summary segment */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Matrícula Escolar Regular</h4>

                  {activeEnrollments.length > 0 ? (
                    activeEnrollments.map((e) => {
                      const regularClass = classPrices.find(rc => rc.id === e.turmaRegularId) || REGULAR_CLASSES.find(rc => rc.id === e.turmaRegularId) || suggestedClass;
                      return (
                        <div key={e.id} className="space-y-3" id="enrollment-summary">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-700">Turma de Matrícula</span>
                              {!isOverridingClass ? (
                                <span className="text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                  {regularClass?.nome || 'Nenhuma'}
                                </span>
                              ) : (
                                <select
                                  value={overrideClassId || e.turmaRegularId}
                                  onChange={(evt) => setOverrideClassId(evt.target.value)}
                                  className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none"
                                >
                                  {(classPrices.length > 0 ? classPrices : REGULAR_CLASSES).map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                      {cls.nome} (R$ {cls.valorMensal})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100/60 mt-1">
                              <p className="text-[10px] text-slate-500">
                                {isOverridingClass ? 'Selecione a nova turma desejada para o aluno.' : 'Determinada automaticamente por idade (ou alterada manualmente).'}
                              </p>
                              {!isOverridingClass ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOverrideClassId(e.turmaRegularId);
                                    setIsOverridingClass(true);
                                  }}
                                  className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-0.5 bg-transparent border-0 cursor-pointer"
                                >
                                  Mudar Turma (Excepcional)
                                </button>
                              ) : (
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setIsOverridingClass(false)}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateEnrollmentClass(activeStudent.id, overrideClassId);
                                      setIsOverridingClass(false);
                                    }}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md"
                                  >
                                    Confirmar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Valor Mensal Base:</span>
                              <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.valorRegularOriginal)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-rose-600">
                              <span>Desconto Negociado:</span>
                              <span className="font-mono">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.descontoMensal)}</span>
                            </div>
                            {e.adicionarLanche && regularClass?.natureza === 'Fundamental' && (
                              <div className="flex justify-between text-xs text-orange-600 font-medium">
                                <span>Adicional Lanche (Fundamental):</span>
                                <span className="font-mono">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.valorLanche || 0)}</span>
                              </div>
                            )}
                            {e.descontoPontualidade && (
                              <div className="flex justify-between text-xs text-blue-600 font-medium">
                                <span>Desconto Pontualidade (3%):</span>
                                <span className="font-mono">
                                  -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    Number(((e.valorFinalRegular + (e.adicionarLanche && regularClass?.natureza === 'Fundamental' ? (e.valorLanche || 0) : 0)) * 0.03).toFixed(2))
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-100">
                              <span>{e.descontoPontualidade ? 'Valor Final Líquido (Até Vencimento):' : 'Valor Final Mensal:'}</span>
                              <span className="font-mono text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                  (e.valorFinalRegular + (e.adicionarLanche && regularClass?.natureza === 'Fundamental' ? (e.valorLanche || 0) : 0)) -
                                  (e.descontoPontualidade ? Number(((e.valorFinalRegular + (e.adicionarLanche && regularClass?.natureza === 'Fundamental' ? (e.valorLanche || 0) : 0)) * 0.03).toFixed(2)) : 0)
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-slate-400">Negociação:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              e.statusNegociacao === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' :
                              e.statusNegociacao === 'Em Negociação' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {e.statusNegociacao}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-505">Nenhuma matrícula registrada para 2026.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Vá até a aba de "Negociação" para criar uma matrícula.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historical Contraturnos blocks & movements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contraturno segments */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Blocos de Vigência (Contraturno)</h4>

                  <div className="space-y-3">
                    {activeContraturnos.length > 0 ? (
                      activeContraturnos.map((c) => {
                        const isCurrentlyActive = c.dataFim === null;
                        return (
                          <div 
                            key={c.id} 
                            className={`p-3 rounded-lg border ${
                              isCurrentlyActive ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-150'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-slate-800">
                                Contraturno: <strong className="text-orange-800 font-bold">{c.natureza}</strong> ({c.periodo})
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isCurrentlyActive ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {isCurrentlyActive ? 'Vigente' : 'Encerrado'}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                              Dias: {c.diasSemana.join(', ')} ({c.diasSemana.length}x na semana)
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Vigência: {new Date(c.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} {c.dataFim ? `até ${new Date(c.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}` : '(Ativo)'}
                            </p>

                            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100">
                              <span className="text-[10px] text-slate-500">Valor mensal do bloco:</span>
                              <span className="text-xs font-mono font-bold text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valorMensal)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                        Nenhum registro de contraturno cadastrado para este aluno.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chronological financial statements */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">Movimentações (Extrato)</h4>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {activeMovements.length > 0 ? (
                      activeMovements.map((mov) => (
                        <div key={mov.id} className="p-3 bg-slate-50 rounded-md border border-slate-150 relative">
                          <span className="absolute top-3 right-3 text-[9px] font-mono text-slate-400">
                            {new Date(mov.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-800 tracking-wider">
                              {mov.tipo.replace('_', ' ')}
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{mov.descricao}</p>
                            
                            <div className="flex items-center gap-2 pt-1 mt-1 border-t border-slate-100/60 text-[10px]">
                              <span className="text-slate-400">Mensalidade:</span>
                              <span className="line-through text-slate-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valorAnterior)}</span>
                              <span className="text-slate-400">→</span>
                              <span className="font-mono font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valorNovo)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-500 text-xs">
                        Nenhum registro financeiro registrado para este aluno.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-slate-200 shadow-xs text-center">
              <User size={48} className="text-slate-200 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-600">Nenhum aluno cadastrado no sistema.</p>
              <button
                onClick={startAddStudent}
                className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-bold cursor-pointer"
              >
                Cadastrar Primeiro Aluno
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}