/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, Guardian, Enrollment, ContraturnoSegment, FinancialMovement, RegularClass, ContraturnoPrice } from './types';
import { 
  calculateAgeAtCutoff,
  getRegularClassForAge,
  REGULAR_CLASSES,
  normalizeClassId
} from './data';
import {
  seedDatabaseIfEmpty,
  getCollectionData,
  saveDocument,
  deleteDocument,
  clearAllDatabaseCollections
} from './firebase';
import {
  IMPORTED_STUDENTS,
  getImportedGuardians,
  getImportedEnrollments,
  getImportedContraturnos
} from './importedStudents';
import Dashboard from './components/Dashboard';
import StudentProfile from './components/StudentProfile';
import NegotiationCalc from './components/NegotiationCalc';
import RematriculaList from './components/RematriculaList';
import ContraturnoSchedule from './components/ContraturnoSchedule';
import PricingSettings from './components/PricingSettings';
import LoginScreen from './components/LoginScreen';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LayoutDashboard, Users, Calculator, ClipboardList, CalendarDays, Sprout, Menu, X, Settings, LogOut, Download, Upload, Database, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      type,
      duration
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // App Password and Session states
  const [appPassword, setAppPassword] = useState<string>('456321');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  // Core App States loaded from Firebase
  const [students, setStudents] = useState<Student[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [contraturnos, setContraturnos] = useState<ContraturnoSegment[]>([]);
  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  
  // Custom Pricing States
  const [classPrices, setClassPrices] = useState<RegularClass[]>([]);
  const [contraturnoPrices, setContraturnoPrices] = useState<ContraturnoPrice[]>([]);

  // Selected student ID shared across components
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Sync state with Firebase on mount
  useEffect(() => {
    async function initFirebase() {
      try {
        setLoading(true);
        // Seed if first time
        await seedDatabaseIfEmpty();
        
        // Fetch all data from Firestore collections
        const [
          loadedStudents, 
          loadedGuardians, 
          loadedEnrollments, 
          loadedContraturnos, 
          loadedMovements,
          loadedClassPrices,
          loadedContraturnoPrices,
          loadedSettings
        ] = await Promise.all([
          getCollectionData<Student>('students'),
          getCollectionData<Guardian>('guardians'),
          getCollectionData<Enrollment>('enrollments'),
          getCollectionData<ContraturnoSegment>('contraturnos'),
          getCollectionData<FinancialMovement>('movements'),
          getCollectionData<RegularClass>('classPrices'),
          getCollectionData<ContraturnoPrice>('contraturnoPrices'),
          getCollectionData<{ id: string; value: string }>('settings')
        ]);
        
        // Sort students alphabetically by name
        const sortedStudents = [...loadedStudents].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        // Ensure every student has an enrollment record in memory if somehow missing
        const existingEnrollmentMap = new Map(loadedEnrollments.map(e => [e.alunoId, e]));
        const finalEnrollments: Enrollment[] = [...loadedEnrollments];

        for (const st of sortedStudents) {
          if (!existingEnrollmentMap.has(st.id)) {
            const age = calculateAgeAtCutoff(st.nascimento, 2026);
            const regClass = getRegularClassForAge(age);
            const newE: Enrollment = {
              id: `enroll_${st.id}`,
              alunoId: st.id,
              ano: 2026,
              turmaRegularId: regClass.id,
              valorRegularOriginal: regClass.valorMensal,
              descontoMensal: 0,
              valorFinalRegular: regClass.valorMensal,
              statusNegociacao: 'Pendente',
              anotacoes: 'Matrícula Sítio Geranium'
            };
            finalEnrollments.push(newE);
            await saveDocument('enrollments', newE);
          }
        }

        setStudents(sortedStudents);
        setGuardians(loadedGuardians);
        setEnrollments(finalEnrollments);
        setContraturnos(loadedContraturnos);
        setMovements(loadedMovements);

        // Process loaded settings
        const passwordSetting = (loadedSettings || []).find(s => s.id === 'appPassword');
        if (passwordSetting && passwordSetting.value) {
          setAppPassword(passwordSetting.value);
        }

        // Sanitize loaded Class Prices to ensure all have an 'ano' field
        const sanitizedClassPrices = (loadedClassPrices || []).map(cp => {
          if (!cp.ano) {
            const match = cp.id.match(/^(\d{4})_(.+)$/);
            return {
              ...cp,
              ano: match ? parseInt(match[1]) : 2026,
              id: cp.id
            };
          }
          return cp;
        });

        // Process and seed custom Class Prices
        let finalClassPrices = sanitizedClassPrices;
        const needsClassPricingSeed = finalClassPrices.length === 0 || finalClassPrices.some(cp => cp.id === 'mirim_1' && cp.valorMensal === 1600) || !finalClassPrices.some(cp => cp.ano === 2026);
        if (needsClassPricingSeed) {
          // If we had old unprefixed entries, let's remove them to avoid duplication
          const oldUnprefixed = finalClassPrices.filter(cp => !cp.id.startsWith('2026_'));
          await Promise.all(oldUnprefixed.map(cp => deleteDocument('classPrices', cp.id)));

          finalClassPrices = [...REGULAR_CLASSES].map(c => ({ ...c, id: `2026_${c.id}`, ano: 2026 }));
          await Promise.all(finalClassPrices.map(cp => saveDocument('classPrices', cp)));
        }
        setClassPrices(finalClassPrices);

        // Sanitize loaded Contraturno Prices
        const sanitizedContraturnoPrices = (loadedContraturnoPrices || []).map(ctp => {
          if (!ctp.ano) {
            const match = ctp.id.match(/^(\d{4})_(.+)$/);
            return {
              ...ctp,
              ano: match ? parseInt(match[1]) : 2026,
              id: ctp.id
            };
          }
          return ctp;
        });

        // Process and seed custom Contraturno Prices
        let finalContraturnoPrices = sanitizedContraturnoPrices;
        const needsContraturnoPricingSeed = finalContraturnoPrices.length === 0 || finalContraturnoPrices.some(ctp => ctp.id === 'freq_1' && ctp.valorCompleto === 500) || !finalContraturnoPrices.some(ctp => ctp.ano === 2026);
        if (needsContraturnoPricingSeed) {
          const oldUnprefixed = finalContraturnoPrices.filter(ctp => !ctp.id.startsWith('2026_'));
          await Promise.all(oldUnprefixed.map(ctp => deleteDocument('contraturnoPrices', ctp.id)));

          finalContraturnoPrices = [
            { id: '2026_avulso', frequencia: 0, valorParcial: 100, valorCompleto: 120, valorSomenteContraturnoParcial: 120, valorSomenteContraturnoCompleto: 150, ano: 2026 },
            { id: '2026_freq_1', frequencia: 1, valorParcial: 220, valorCompleto: 260, valorSomenteContraturnoParcial: 300, valorSomenteContraturnoCompleto: 350, ano: 2026 },
            { id: '2026_freq_2', frequencia: 2, valorParcial: 460, valorCompleto: 520, valorSomenteContraturnoParcial: 480, valorSomenteContraturnoCompleto: 560, ano: 2026 },
            { id: '2026_freq_3', frequencia: 3, valorParcial: 630, valorCompleto: 690, valorSomenteContraturnoParcial: 680, valorSomenteContraturnoCompleto: 790, ano: 2026 },
            { id: '2026_freq_4', frequencia: 4, valorParcial: 775, valorCompleto: 862.5, valorSomenteContraturnoParcial: 870, valorSomenteContraturnoCompleto: 1010, ano: 2026 },
            { id: '2026_freq_5', frequencia: 5, valorParcial: 920, valorCompleto: 1035, valorSomenteContraturnoParcial: 1050, valorSomenteContraturnoCompleto: 1230, ano: 2026 }
          ];
          await Promise.all(finalContraturnoPrices.map(ctp => saveDocument('contraturnoPrices', ctp)));
        }
        setContraturnoPrices(finalContraturnoPrices);

        if (sortedStudents.length > 0) {
          setSelectedStudentId(sortedStudents[0].id);
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
      } finally {
        setLoading(false);
      }
    }
    
    initFirebase();
  }, []);

  // Update selectedStudentId when students are loaded/changed if not set
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Handle direct navigation to a tab for a specific student
  const handleNavigateWithStudent = (tabId: string, studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab(tabId);
  };

  // Handler: Clear all data (removes mock students)
  const handleClearDatabase = async () => {
    try {
      setLoading(true);
      await clearAllDatabaseCollections();
      setStudents([]);
      setGuardians([]);
      setEnrollments([]);
      setContraturnos([]);
      setMovements([]);
      setSelectedStudentId('');
    } catch (error) {
      console.error('Error clearing database:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Import full Sítio-Escola Geranium Student Report Data
  const handleImportGeraniumData = async () => {
    const confirmado = window.confirm(
      'Deseja importar a lista de alunos do Sítio-Escola Geranium? ' +
      'O sistema irá comparar com os cadastros atuais, atualizando os registros existentes e ' +
      'adicionando os novos de forma inteligente sem duplicar ou apagar as negociações em andamento.'
    );
    if (!confirmado) return;

    try {
      setLoading(true);

      const importedGuardiansList = getImportedGuardians();
      const importedEnrollmentsList = getImportedEnrollments();
      const importedContraturnosList = getImportedContraturnos();

      const updatedStudents: Student[] = [...students];
      const updatedGuardians: Guardian[] = [...guardians];
      const updatedEnrollments: Enrollment[] = [...enrollments];
      const updatedContraturnos: ContraturnoSegment[] = [...contraturnos];

      const studentsToSave: Student[] = [];
      const guardiansToSave: Guardian[] = [];
      const enrollmentsToSave: Enrollment[] = [];
      const contraturnosToSave: ContraturnoSegment[] = [];

      for (const importedStudent of IMPORTED_STUDENTS) {
        // Match existing student by exact ID or exact name (case-insensitive)
        const matchByName = updatedStudents.find(s => s.nome.trim().toLowerCase() === importedStudent.nome.trim().toLowerCase());
        const matchById = updatedStudents.find(s => s.id === importedStudent.id);
        const existingStudent = matchById || matchByName;

        let finalStudentId = importedStudent.id;
        let mergedStudent: Student;

        if (existingStudent) {
          finalStudentId = existingStudent.id;
          mergedStudent = {
            ...existingStudent,
            ...importedStudent,
            id: finalStudentId,
            status: existingStudent.status || importedStudent.status || 'ativo'
          };
          const idx = updatedStudents.findIndex(s => s.id === finalStudentId);
          if (idx !== -1) {
            updatedStudents[idx] = mergedStudent;
          } else {
            updatedStudents.push(mergedStudent);
          }
        } else {
          mergedStudent = { ...importedStudent, status: 'ativo' };
          updatedStudents.push(mergedStudent);
        }
        studentsToSave.push(mergedStudent);

        // Merge Guardians
        const guardiansForThisStudent = importedGuardiansList.filter(g => g.alunoId === importedStudent.id);
        for (const importedGuardian of guardiansForThisStudent) {
          const existingGuardian = updatedGuardians.find(exG => 
            exG.id === importedGuardian.id || 
            (exG.alunoId === finalStudentId && exG.nome.trim().toLowerCase() === importedGuardian.nome.trim().toLowerCase())
          );

          let mergedGuardian: Guardian;
          if (existingGuardian) {
            mergedGuardian = {
              ...existingGuardian,
              ...importedGuardian,
              id: existingGuardian.id,
              alunoId: finalStudentId
            };
            const idx = updatedGuardians.findIndex(g => g.id === existingGuardian.id);
            if (idx !== -1) {
              updatedGuardians[idx] = mergedGuardian;
            } else {
              updatedGuardians.push(mergedGuardian);
            }
          } else {
            mergedGuardian = {
              ...importedGuardian,
              alunoId: finalStudentId
            };
            updatedGuardians.push(mergedGuardian);
          }
          guardiansToSave.push(mergedGuardian);
        }

        // Merge Enrollment for 2026
        const importedEnrollment = importedEnrollmentsList.find(e => e.alunoId === importedStudent.id && e.ano === 2026);
        if (importedEnrollment) {
          const existingEnrollment = updatedEnrollments.find(exE => exE.alunoId === finalStudentId && exE.ano === 2026);
          let mergedEnrollment: Enrollment;

          if (existingEnrollment) {
            mergedEnrollment = {
              ...importedEnrollment,
              ...existingEnrollment, // preserve active negotiation states, discounts, and annotations
              id: existingEnrollment.id,
              alunoId: finalStudentId
            };
            const idx = updatedEnrollments.findIndex(e => e.id === existingEnrollment.id);
            if (idx !== -1) {
              updatedEnrollments[idx] = mergedEnrollment;
            } else {
              updatedEnrollments.push(mergedEnrollment);
            }
          } else {
            mergedEnrollment = {
              ...importedEnrollment,
              alunoId: finalStudentId
            };
            updatedEnrollments.push(mergedEnrollment);
          }
          enrollmentsToSave.push(mergedEnrollment);
        }

        // Merge Contraturno
        const importedContraturno = importedContraturnosList.find(c => c.alunoId === importedStudent.id);
        if (importedContraturno) {
          const existingContraturno = updatedContraturnos.find(exC => exC.alunoId === finalStudentId && exC.dataFim === null);
          let mergedContraturno: ContraturnoSegment;

          if (existingContraturno) {
            mergedContraturno = {
              ...importedContraturno,
              ...existingContraturno, // preserve active contraturno segments, schedules and custom values
              id: existingContraturno.id,
              alunoId: finalStudentId
            };
            const idx = updatedContraturnos.findIndex(c => c.id === existingContraturno.id);
            if (idx !== -1) {
              updatedContraturnos[idx] = mergedContraturno;
            } else {
              updatedContraturnos.push(mergedContraturno);
            }
          } else {
            mergedContraturno = {
              ...importedContraturno,
              alunoId: finalStudentId
            };
            updatedContraturnos.push(mergedContraturno);
          }
          contraturnosToSave.push(mergedContraturno);
        }
      }

      // Save to Firestore in parallel
      await Promise.all([
        ...studentsToSave.map(s => saveDocument('students', s)),
        ...guardiansToSave.map(g => saveDocument('guardians', g)),
        ...enrollmentsToSave.map(e => saveDocument('enrollments', e)),
        ...contraturnosToSave.map(c => saveDocument('contraturnos', c))
      ]);

      showToast(
        'Sincronização Concluída com Sucesso!',
        `${studentsToSave.length} alunos processados. As informações foram salvas no Firebase e os acordos financeiros em andamento foram preservados.`,
        'success',
        6000
      );

      const sortedStudents = [...updatedStudents].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setStudents(sortedStudents);
      setGuardians(updatedGuardians);
      setEnrollments(updatedEnrollments);
      setContraturnos(updatedContraturnos);

      if (sortedStudents.length > 0) {
        // If the selected student is not in the list anymore (deleted), select the first one
        if (!sortedStudents.some(s => s.id === selectedStudentId)) {
          setSelectedStudentId(sortedStudents[0].id);
        }
      }

    } catch (error) {
      console.error('Error merging Geranium data:', error);
      showToast('Falha na Importação', 'Ocorreu um erro ao importar os dados. Tente novamente.', 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Add new student with guardians
  const handleAddStudent = (
    newStudent: Student, 
    guardiansList: Omit<Guardian, 'id' | 'alunoId'>[],
    somenteContraturno?: boolean
  ) => {
    // 1. Add student
    setStudents(prev => [...prev, newStudent].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    saveDocument('students', newStudent);

    // 2. Generate and add Guardians
    const newGuardians: Guardian[] = guardiansList.map((g, idx) => ({
      ...g,
      id: `g_${Date.now()}_${idx}`,
      alunoId: newStudent.id
    }));
    setGuardians(prev => [...prev, ...newGuardians]);
    newGuardians.forEach(g => saveDocument('guardians', g));

    // 3. Auto-calculate regular class based on birthdate
    const age = calculateAgeAtCutoff(newStudent.nascimento, 2026);
    const regularClass = getRegularClassForAge(age);
    const isOnlyContraturno = Boolean(somenteContraturno);

    // 4. Create initial Enrollment for 2026 (Pendente by default)
    const newEnrollment: Enrollment = {
      id: `enroll_${Date.now()}`,
      alunoId: newStudent.id,
      ano: 2026,
      turmaRegularId: isOnlyContraturno ? 'sem_regular' : regularClass.id,
      valorRegularOriginal: isOnlyContraturno ? 0 : regularClass.valorMensal,
      descontoMensal: 0,
      valorFinalRegular: isOnlyContraturno ? 0 : regularClass.valorMensal,
      statusNegociacao: 'Pendente',
      anotacoes: isOnlyContraturno
        ? 'Matrícula cadastrada exclusivamente no Contraturno (sem ensino regular).'
        : 'Matrícula criada automaticamente no cadastro do aluno.'
    };
    setEnrollments(prev => [...prev, newEnrollment]);
    saveDocument('enrollments', newEnrollment);

    // 5. Log initial financial movement
    const initialMovement: FinancialMovement = {
      id: `mov_${Date.now()}`,
      alunoId: newStudent.id,
      data: new Date().toISOString().split('T')[0],
      tipo: 'Matrícula',
      descricao: isOnlyContraturno
        ? 'Início do processo de matrícula - Exclusivamente Contraturno (Isento do Ensino Regular).'
        : `Início do processo de rematrícula para 2026 na turma determinada ${regularClass.nome} (Base: R$ ${regularClass.valorMensal}/mês).`,
      valorAnterior: 0,
      valorNovo: isOnlyContraturno ? 0 : regularClass.valorMensal
    };
    setMovements(prev => [...prev, initialMovement]);
    saveDocument('movements', initialMovement);
    showToast('Novo Aluno Cadastrado', `O aluno ${newStudent.nome} foi salvo no Firebase.`, 'success');
  };

  // Handler: Edit basic student details
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    saveDocument('students', updatedStudent);
    showToast('Cadastro Atualizado', `As alterações de ${updatedStudent.nome} foram salvas.`, 'success');

    // If birthday changed, recalculate regular class and adjust enrollment base price
    const oldStudent = students.find(s => s.id === updatedStudent.id);
    if (oldStudent && oldStudent.nascimento !== updatedStudent.nascimento) {
      const age = calculateAgeAtCutoff(updatedStudent.nascimento, 2026);
      const regularClass = getRegularClassForAge(age);

      setEnrollments(prev => prev.map(e => {
        if (e.alunoId === updatedStudent.id && e.ano === 2026 && e.turmaRegularId !== 'sem_regular') {
          const valorFinal = Math.max(0, regularClass.valorMensal - e.descontoMensal);
          const updatedEnroll = {
            ...e,
            turmaRegularId: regularClass.id,
            valorRegularOriginal: regularClass.valorMensal,
            valorFinalRegular: valorFinal
          };
          saveDocument('enrollments', updatedEnroll);
          return updatedEnroll;
        }
        return e;
      }));

      // Log recalculation movement
      const movement: FinancialMovement = {
        id: `mov_${Date.now()}`,
        alunoId: updatedStudent.id,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Reajuste_Geral',
        descricao: `Turma regular reajustada automaticamente para ${regularClass.nome} devido à alteração de data de nascimento.`,
        valorAnterior: 0, // Simplified since it is a background correction
        valorNovo: regularClass.valorMensal
      };
      setMovements(prev => [...prev, movement]);
      saveDocument('movements', movement);
    }
  };

  // Handler: Delete student and all associated records
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    deleteDocument('students', studentId);

    guardians.filter(g => g.alunoId === studentId).forEach(g => deleteDocument('guardians', g.id));
    setGuardians(prev => prev.filter(g => g.alunoId !== studentId));

    enrollments.filter(e => e.alunoId === studentId).forEach(e => deleteDocument('enrollments', e.id));
    setEnrollments(prev => prev.filter(e => e.alunoId !== studentId));

    contraturnos.filter(c => c.alunoId === studentId).forEach(c => deleteDocument('contraturnos', c.id));
    setContraturnos(prev => prev.filter(c => c.alunoId !== studentId));

    movements.filter(m => m.alunoId === studentId).forEach(m => deleteDocument('movements', m.id));
    setMovements(prev => prev.filter(m => m.alunoId !== studentId));
    showToast('Aluno Excluído', 'O aluno e seus registros associados foram removidos.', 'warning');
  };

  // Handler: Add a guardian to an existing student
  const handleAddGuardian = (newGuardian: Omit<Guardian, 'id'>) => {
    const guardianWithId: Guardian = {
      ...newGuardian,
      id: `g_${Date.now()}`
    };

    saveDocument('guardians', guardianWithId);

    // If new guardian is financial, make sure others are set to false
    if (newGuardian.financeiro) {
      setGuardians(prev => prev.map(g => {
        if (g.alunoId === newGuardian.alunoId) {
          const updated = { ...g, financeiro: false };
          saveDocument('guardians', updated);
          return updated;
        }
        return g;
      }).concat(guardianWithId));
    } else {
      setGuardians(prev => [...prev, guardianWithId]);
    }
    showToast('Responsável Adicionado', 'O novo responsável financeiro foi salvo no Firebase.', 'success');
  };

  // Handler: Delete a single guardian
  const handleDeleteGuardian = (guardianId: string) => {
    setGuardians(prev => prev.filter(g => g.id !== guardianId));
    deleteDocument('guardians', guardianId);
    showToast('Responsável Removido', 'O registro do responsável foi excluído.', 'info');
  };

  // Handler: Complete agreement (calculator save)
  const handleConfirmNegotiation = (
    alunoId: string,
    enrollmentData: Omit<Enrollment, 'id' | 'alunoId'>,
    contraturnoData: Omit<ContraturnoSegment, 'id' | 'alunoId'> | null
  ) => {
    const today = new Date().toISOString().split('T')[0];

    // Find current total monthly rates to compute before/after difference in statement log
    const currentEnrollment = enrollments.find(e => e.alunoId === alunoId && e.ano === 2026);
    const activeCont = contraturnos.find(c => c.alunoId === alunoId && c.dataFim === null);
    const prevRegularClass = currentEnrollment ? (classPrices.find(rc => normalizeClassId(rc.id) === normalizeClassId(currentEnrollment.turmaRegularId)) || REGULAR_CLASSES.find(rc => normalizeClassId(rc.id) === normalizeClassId(currentEnrollment.turmaRegularId))) : null;
    const prevLanche = (currentEnrollment?.adicionarLanche && prevRegularClass?.natureza === 'Fundamental') ? (currentEnrollment.valorLanche || 0) : 0;
    const previousTotal = (currentEnrollment?.valorFinalRegular || 0) + (activeCont?.valorMensal || 0) + prevLanche;

    // 1. Update/Insert Enrollment
    let updatedEnrollment: Enrollment;
    if (currentEnrollment) {
      updatedEnrollment = {
        ...currentEnrollment,
        ...enrollmentData
      };
      setEnrollments(prev => prev.map(e => e.id === currentEnrollment.id ? updatedEnrollment : e));
    } else {
      updatedEnrollment = {
        ...enrollmentData,
        id: `enroll_${Date.now()}`,
        alunoId: alunoId
      };
      setEnrollments(prev => [...prev, updatedEnrollment]);
    }
    saveDocument('enrollments', updatedEnrollment);

    // 2. Manage Contraturno historical blocks
    let contraturnoDescriptionAddon = '';
    
    if (contraturnoData) {
      // If there is an existing active contraturno, let's compare. If details changed, close old and open new!
      if (activeCont) {
        const isSame = 
          activeCont.natureza === contraturnoData.natureza &&
          activeCont.periodo === contraturnoData.periodo &&
          JSON.stringify(activeCont.diasSemana) === JSON.stringify(contraturnoData.diasSemana);

        if (!isSame) {
          // Close old block
          const closedCont = { ...activeCont, dataFim: today };
          setContraturnos(prev => prev.map(c => c.id === activeCont.id ? closedCont : c));
          saveDocument('contraturnos', closedCont);

          // Open new block
          const newContBlock: ContraturnoSegment = {
            ...contraturnoData,
            id: `seg_${Date.now()}`,
            alunoId: alunoId
          };
          setContraturnos(prev => [...prev, newContBlock]);
          saveDocument('contraturnos', newContBlock);
          contraturnoDescriptionAddon = ` Alteração de contraturno para ${contraturnoData.natureza} (${contraturnoData.periodo}, ${contraturnoData.diasSemana.length}x/semana).`;
        }
      } else {
        // Open completely new contraturno block
        const newContBlock: ContraturnoSegment = {
          ...contraturnoData,
          id: `seg_${Date.now()}`,
          alunoId: alunoId
        };
        setContraturnos(prev => [...prev, newContBlock]);
        saveDocument('contraturnos', newContBlock);
        contraturnoDescriptionAddon = ` Ativação de contraturno ${contraturnoData.natureza} (${contraturnoData.periodo}, ${contraturnoData.diasSemana.length}x/semana).`;
      }
    } else {
      // No contraturno selected. If they had an active one, close it.
      if (activeCont) {
        const closedCont = { ...activeCont, dataFim: today };
        setContraturnos(prev => prev.map(c => c.id === activeCont.id ? closedCont : c));
        saveDocument('contraturnos', closedCont);
        contraturnoDescriptionAddon = ` Cancelamento/desativação do contraturno ativo anterior.`;
      }
    }

    // 3. Log Financial Statement Movement
    const currentRegularClass = classPrices.find(rc => normalizeClassId(rc.id) === normalizeClassId(enrollmentData.turmaRegularId)) || REGULAR_CLASSES.find(rc => normalizeClassId(rc.id) === normalizeClassId(enrollmentData.turmaRegularId));
    const newLanche = (enrollmentData.adicionarLanche && currentRegularClass?.natureza === 'Fundamental') ? (enrollmentData.valorLanche || 0) : 0;
    const newTotal = enrollmentData.valorFinalRegular + (contraturnoData ? contraturnoData.valorMensal : 0) + newLanche;
    
    let moveType: FinancialMovement['tipo'] = 'Desconto_Alterado';
    if (contraturnoDescriptionAddon.includes('Ativação') || contraturnoDescriptionAddon.includes('Alteração')) {
      moveType = 'Contraturno_Ativação';
    } else if (contraturnoDescriptionAddon.includes('Cancelamento')) {
      moveType = 'Contraturno_Cancelamento';
    }

    const movement: FinancialMovement = {
      id: `mov_${Date.now()}`,
      alunoId: alunoId,
      data: today,
      tipo: moveType,
      descricao: `Acordo financeiro atualizado: Mensalidade regular de R$ ${enrollmentData.valorFinalRegular} (Base: R$ ${enrollmentData.valorRegularOriginal} com desconto de R$ ${enrollmentData.descontoMensal}).${contraturnoDescriptionAddon}`,
      valorAnterior: previousTotal,
      valorNovo: newTotal
    };

    setMovements(prev => [...prev, movement]);
    saveDocument('movements', movement);

    const targetStudent = students.find(s => s.id === alunoId);
    const studentName = targetStudent ? targetStudent.nome : 'o aluno';
    showToast(
      'Acordo Salvo com Sucesso!',
      `O acordo comercial e a rematrícula de ${studentName} para ${enrollmentData.ano} foram salvos no Firebase.`,
      'success',
      5000
    );
  };

  // Handler: Fast change status in Worklist
  const handleUpdateEnrollmentStatus = (alunoId: string, status: Enrollment['statusNegociacao']) => {
    setEnrollments(prev => prev.map(e => {
      if (e.alunoId === alunoId && e.ano === 2026) {
        const updatedEnroll = { ...e, statusNegociacao: status };
        saveDocument('enrollments', updatedEnroll);
        return updatedEnroll;
      }
      return e;
    }));

    // Log status change statement
    const currentEnroll = enrollments.find(e => e.alunoId === alunoId && e.ano === 2026);
    const student = students.find(s => s.id === alunoId);
    if (currentEnroll && student) {
      const activeCont = contraturnos.find(c => c.alunoId === alunoId && c.dataFim === null);
      const regularClass = classPrices.find(rc => normalizeClassId(rc.id) === normalizeClassId(currentEnroll.turmaRegularId)) || REGULAR_CLASSES.find(rc => normalizeClassId(rc.id) === normalizeClassId(currentEnroll.turmaRegularId));
      const lancheVal = (currentEnroll.adicionarLanche && regularClass?.natureza === 'Fundamental') ? (currentEnroll.valorLanche || 0) : 0;
      const totalRate = currentEnroll.valorFinalRegular + (activeCont ? activeCont.valorMensal : 0) + lancheVal;

      const movement: FinancialMovement = {
        id: `mov_${Date.now()}`,
        alunoId: alunoId,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Matrícula',
        descricao: `Status de negociação atualizado para "${status}". Acordo total de R$ ${totalRate}/mês.`,
        valorAnterior: totalRate,
        valorNovo: totalRate
      };
      setMovements(prev => [...prev, movement]);
      saveDocument('movements', movement);
    }
    const stName = students.find(s => s.id === alunoId)?.nome || 'o aluno';
    showToast('Status Atualizado', `A situação de ${stName} foi alterada para "${status}".`, 'success');
  };

  // Handler: Fast update notes in Worklist
  const handleUpdateEnrollmentNotes = (alunoId: string, notes: string) => {
    setEnrollments(prev => prev.map(e => {
      if (e.alunoId === alunoId && e.ano === 2026) {
        const updatedEnroll = { ...e, anotacoes: notes };
        saveDocument('enrollments', updatedEnroll);
        return updatedEnroll;
      }
      return e;
    }));
    showToast('Anotações Salvas', 'Observação registrada com sucesso.', 'info');
  };

  // Handler: Update Discounts from Worklist directly
  const handleUpdateEnrollmentDiscounts = (
    alunoId: string, 
    discountRegular: number, 
    discountContraturno: number,
    tipoDescontoRegular?: 'reais' | 'porcentagem',
    valorDescontoRegularInput?: number,
    tipoDescontoContraturno?: 'reais' | 'porcentagem',
    valorDescontoContraturnoInput?: number
  ) => {
    setEnrollments(prev => prev.map(e => {
      if (e.alunoId === alunoId && e.ano === 2026) {
        const finalRegular = Math.max(0, e.valorRegularOriginal - discountRegular);
        const updatedEnroll = { 
          ...e, 
          descontoMensal: discountRegular, 
          valorFinalRegular: finalRegular,
          descontoContraturno: discountContraturno,
          tipoDescontoRegular: tipoDescontoRegular || e.tipoDescontoRegular || 'reais',
          valorDescontoRegularInput: valorDescontoRegularInput !== undefined ? valorDescontoRegularInput : e.valorDescontoRegularInput,
          tipoDescontoContraturno: tipoDescontoContraturno || e.tipoDescontoContraturno || 'reais',
          valorDescontoContraturnoInput: valorDescontoContraturnoInput !== undefined ? valorDescontoContraturnoInput : e.valorDescontoContraturnoInput
        };
        saveDocument('enrollments', updatedEnroll);
        return updatedEnroll;
      }
      return e;
    }));

    // Update active contraturno segment valorMensal if present
    setContraturnos(prev => prev.map(c => {
      if (c.alunoId === alunoId && c.dataFim === null) {
        // Match frequency and period to recalculate base
        const match = contraturnoPrices.find(cp => cp.frequencia === c.diasSemana.length);
        const basePrice = match ? (c.periodo === 'Parcial' ? match.valorParcial : match.valorCompleto) : c.valorMensal;
        const finalContraturnoPrice = Math.max(0, basePrice - discountContraturno);
        const updatedCont = { ...c, valorMensal: finalContraturnoPrice };
        saveDocument('contraturnos', updatedCont);
        return updatedCont;
      }
      return c;
    }));

    // Log financial movement
    const student = students.find(s => s.id === alunoId);
    if (student) {
      const descRegularStr = tipoDescontoRegular === 'porcentagem' ? `${valorDescontoRegularInput}%` : `R$ ${discountRegular}`;
      const descContraStr = tipoDescontoContraturno === 'porcentagem' ? `${valorDescontoContraturnoInput}%` : `R$ ${discountContraturno}`;
      const movement: FinancialMovement = {
        id: `mov_disc_${Date.now()}`,
        alunoId: student.id,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Desconto_Alterado',
        descricao: `Descontos ajustados na lista de trabalho: Regular de ${descRegularStr}/mês e Contraturno de ${descContraStr}/mês.`,
        valorAnterior: 0,
        valorNovo: 0
      };
      setMovements(prev => [...prev, movement]);
      saveDocument('movements', movement);
    }
    const stName = student ? student.nome : 'o aluno';
    showToast('Descontos Salvos', `Novos valores negociados para ${stName} foram salvos com sucesso.`, 'success');
  };

  // Handler: Change Contraturno group/natureza ('Melaço' vs 'Marmelada')
  const handleUpdateContraturnoNatureza = (alunoId: string, segmentId: string, newNatureza: 'Melaço' | 'Marmelada') => {
    setContraturnos(prev => prev.map(c => {
      if (c.id === segmentId || (c.alunoId === alunoId && c.dataFim === null)) {
        const updated = { ...c, natureza: newNatureza };
        saveDocument('contraturnos', updated);
        return updated;
      }
      return c;
    }));

    const student = students.find(s => s.id === alunoId);
    if (student) {
      showToast('Turma do Contraturno Alterada', `A turma do contraturno de ${student.nome} foi alterada para ${newNatureza}.`, 'success');
    }
  };

  // Handler: Change regular class manually (exceptional case)
  const handleUpdateEnrollmentClass = (alunoId: string, turmaRegularId: string) => {
    const match = classPrices.find(c => normalizeClassId(c.id) === normalizeClassId(turmaRegularId)) || REGULAR_CLASSES.find(c => normalizeClassId(c.id) === normalizeClassId(turmaRegularId));
    const basePrice = match ? match.valorMensal : 0;

    setEnrollments(prev => prev.map(e => {
      if (e.alunoId === alunoId && e.ano === 2026) {
        // Re-calculate the discount in Reais if the type is percentage, otherwise it remains fixed in Reais
        let finalDiscount = e.descontoMensal;
        if (e.tipoDescontoRegular === 'porcentagem' && e.valorDescontoRegularInput !== undefined) {
          finalDiscount = Number((basePrice * (e.valorDescontoRegularInput / 100)).toFixed(2));
        } else {
          // Cap fixed discount at the new base price
          finalDiscount = Math.min(e.descontoMensal, basePrice);
        }

        const finalRegular = Math.max(0, basePrice - finalDiscount);
        const updatedEnroll = { 
          ...e, 
          turmaRegularId,
          valorRegularOriginal: basePrice,
          descontoMensal: finalDiscount,
          valorFinalRegular: finalRegular
        };
        saveDocument('enrollments', updatedEnroll);
        return updatedEnroll;
      }
      return e;
    }));

    // Log financial movement
    const student = students.find(s => s.id === alunoId);
    if (student) {
      const movement: FinancialMovement = {
        id: `mov_class_${Date.now()}`,
        alunoId: student.id,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Desconto_Alterado',
        descricao: `Alteração excepcional de turma regular para: ${match?.nome || 'Desconhecida'} (Mensalidade base ajustada para R$ ${basePrice}).`,
        valorAnterior: 0,
        valorNovo: 0
      };
      setMovements(prev => [...prev, movement]);
      saveDocument('movements', movement);
    }
    showToast('Turma Alterada', `A nova turma ${match?.nome || ''} foi atribuída e salva no Firebase.`, 'success');
  };

  // Handler: Update an existing guardian in place
  const handleUpdateGuardian = (updatedGuardian: Guardian) => {
    setGuardians(prev => prev.map(g => {
      if (g.id === updatedGuardian.id) {
        saveDocument('guardians', updatedGuardian);
        return updatedGuardian;
      }
      return g;
    }));

    // If set as financeiro, deactivate other guardians' financeiro status for the same student
    if (updatedGuardian.financeiro) {
      setGuardians(prev => prev.map(g => {
        if (g.alunoId === updatedGuardian.alunoId && g.id !== updatedGuardian.id && g.financeiro) {
          const disabledFin = { ...g, financeiro: false };
          saveDocument('guardians', disabledFin);
          return disabledFin;
        }
        return g;
      }));
    }
    showToast('Responsável Salvo', 'Dados do responsável financeiro atualizados no Firebase.', 'success');
  };

  // Handler: Save global pricing configurations
  const handleSavePrices = async (updatedClasses: RegularClass[], updatedContraturno: ContraturnoPrice[], year: number) => {
    // 1. Filter out existing items for this year from our state
    const otherYearsClasses = classPrices.filter(c => (c.ano || 2026) !== year);
    const otherYearsContraturno = contraturnoPrices.filter(cp => (cp.ano || 2026) !== year);

    // Ensure all new/updated items have the correct year and prefixed id
    const processedClasses = updatedClasses.map(c => {
      const prefix = `${year}_`;
      const finalId = c.id.startsWith(prefix) ? c.id : `${prefix}${c.id}`;
      return { ...c, id: finalId, ano: year };
    });

    const processedContraturno = updatedContraturno.map(cp => {
      const prefix = `${year}_`;
      const finalId = cp.id.startsWith(prefix) ? cp.id : `${prefix}${cp.id}`;
      return { ...cp, id: finalId, ano: year };
    });

    // Detect deleted classes for this specific year
    const existingIdsForYear = classPrices.filter(c => (c.ano || 2026) === year).map(c => c.id);
    const updatedIdsForYear = processedClasses.map(c => c.id);
    const deletedClassIds = existingIdsForYear.filter(id => !updatedIdsForYear.includes(id));

    // Detect deleted contraturno frequencies for this specific year
    const existingContraturnoIdsForYear = contraturnoPrices.filter(cp => (cp.ano || 2026) === year).map(cp => cp.id);
    const updatedContraturnoIdsForYear = processedContraturno.map(cp => cp.id);
    const deletedContraturnoIds = existingContraturnoIdsForYear.filter(id => !updatedContraturnoIdsForYear.includes(id));

    const newClassPrices = [...otherYearsClasses, ...processedClasses];
    const newContraturnoPrices = [...otherYearsContraturno, ...processedContraturno];

    setClassPrices(newClassPrices);
    setContraturnoPrices(newContraturnoPrices);

    await Promise.all([
      ...processedClasses.map(c => saveDocument('classPrices', c)),
      ...processedContraturno.map(cp => saveDocument('contraturnoPrices', cp)),
      ...deletedClassIds.map(id => deleteDocument('classPrices', id)),
      ...deletedContraturnoIds.map(id => deleteDocument('contraturnoPrices', id))
    ]);

    // Create a financial movement log
    const movement: FinancialMovement = {
      id: `mov_pricing_${Date.now()}`,
      alunoId: 'system',
      data: new Date().toISOString().split('T')[0],
      tipo: 'Reajuste_Geral',
      descricao: `Valores de referência de mensalidade e contraturno reajustados para o ano ${year} no painel de configurações.`,
      valorAnterior: 0,
      valorNovo: 0
    };
    setMovements(prev => [...prev, movement]);
    saveDocument('movements', movement);
    showToast('Tabela de Preços Salva', `Configurações de mensalidades para o ano ${year} foram salvas.`, 'success');
  };

  // Handler: Update application security password
  const handleUpdatePassword = async (newPassword: string) => {
    setAppPassword(newPassword);
    await saveDocument('settings', { id: 'appPassword', value: newPassword });
    showToast('Senha Atualizada', 'A nova senha de acesso ao sistema foi salva no Firebase.', 'success');
  };

  // Handler: Logout / Lock session
  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
  };

  const totalStudentsCount = students.length;
  const validStudentIds = new Set(students.map(s => s.id));
  const valid2026Enrollments = enrollments.filter(e => e.ano === 2026 && validStudentIds.has(e.alunoId));
  const confirmedEnrollmentsCount = valid2026Enrollments.filter(e => e.statusNegociacao === 'Confirmada').length;
  const pendingEnrollmentsCount = valid2026Enrollments.filter(e => e.statusNegociacao === 'Pendente' || e.statusNegociacao === 'Em Negociação').length;
  const confirmedPercent = totalStudentsCount > 0 ? Math.min(100, Math.round((confirmedEnrollmentsCount / totalStudentsCount) * 100)) : 0;

  if (loading) {
    return (
      <div className="h-screen w-screen bg-brand-cream flex flex-col items-center justify-center font-sans text-slate-800" id="app-loading-viewport">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm">
          <div className="p-3 bg-brand-orange text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
            <Sprout size={32} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-brand-green-dark">Sítio-Escola Geranium</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Carregando do Firebase...</p>
          </div>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
            <div className="h-full bg-brand-orange rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400 italic">"Conectando à base de dados na nuvem..."</p>
        </div>
      </div>
    );
  }

  const handleExportBackup = () => {
    const backupData = {
      app: 'Gestor Sítio-Escola Geranium',
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      totalStudents: students.length,
      students,
      guardians,
      enrollments,
      contraturnos,
      movements,
      classPrices,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const dateStr = new Date().toISOString().slice(0, 10);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `backup_geranium_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Exportado', 'O arquivo JSON com a cópia de segurança foi baixado com sucesso.', 'info');
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.students || !Array.isArray(data.students) || !data.enrollments || !Array.isArray(data.enrollments)) {
        showToast('Arquivo Inválido', 'O arquivo de backup é incompatível ou está corrompido.', 'error', 5000);
        return;
      }

      const dateInfo = data.exportedAt ? new Date(data.exportedAt).toLocaleString('pt-BR') : 'sem data';
      const countInfo = `${data.students.length} alunos e ${data.enrollments.length} matrículas`;

      if (!confirm(`Restaurar backup do dia ${dateInfo} (${countInfo})?\n\nIsso atualizará os dados locais e no Firebase.`)) {
        return;
      }

      setLoading(true);

      if (Array.isArray(data.students)) {
        await Promise.all(data.students.map((s: any) => saveDocument('students', s)));
        setStudents(data.students);
      }
      if (Array.isArray(data.guardians)) {
        await Promise.all(data.guardians.map((g: any) => saveDocument('guardians', g)));
        setGuardians(data.guardians);
      }
      if (Array.isArray(data.enrollments)) {
        await Promise.all(data.enrollments.map((e: any) => saveDocument('enrollments', e)));
        setEnrollments(data.enrollments);
      }
      if (Array.isArray(data.contraturnos)) {
        await Promise.all(data.contraturnos.map((c: any) => saveDocument('contraturnos', c)));
        setContraturnos(data.contraturnos);
      }
      if (Array.isArray(data.movements)) {
        await Promise.all(data.movements.map((m: any) => saveDocument('movements', m)));
        setMovements(data.movements);
      }
      if (Array.isArray(data.classPrices)) {
        await Promise.all(data.classPrices.map((cp: any) => saveDocument('classPrices', cp)));
        setClassPrices(data.classPrices);
      }

      setLoading(false);
      showToast('Backup Restaurado', 'Todos os dados do arquivo JSON foram importados para o Firebase com sucesso.', 'success', 6000);
    } catch (err) {
      console.error('Erro ao restaurar backup:', err);
      setLoading(false);
      showToast('Erro ao Restaurar Backup', 'Verifique se o arquivo importado é um JSON válido e estruturado.', 'error', 6000);
    }
    event.target.value = '';
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        expectedPassword={appPassword} 
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          sessionStorage.setItem('isLoggedIn', 'true');
        }} 
      />
    );
  }

  return (
    <div className="h-screen bg-brand-cream font-sans text-slate-800 flex overflow-hidden" id="app-viewport">
      {/* Sidebar Navigation - Desktop */}
      <aside className="w-56 h-full bg-brand-green-dark flex flex-col shrink-0 hidden md:flex border-r border-emerald-900/40" id="app-sidebar">
        <div className="p-5 flex items-center gap-3 border-b border-emerald-900/30">
          <div className="p-1.5 bg-brand-orange text-white rounded-lg flex items-center justify-center shadow-md">
            <Sprout size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-sm tracking-tight leading-none">Sítio Geranium</h1>
            <p className="text-[9px] text-brand-orange mt-1 uppercase tracking-wider font-bold">Sítio-escola</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" id="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard },
            { id: 'students', label: 'Fichas de Alunos', icon: Users },
            { id: 'negotiation', label: 'Calculadora de Acordo', icon: Calculator },
            { id: 'rematricula', label: 'Lista de Trabalho', icon: ClipboardList },
            { id: 'escala', label: 'Escala Contraturno', icon: CalendarDays },
            { id: 'pricing', label: 'Configurar Mensalidades', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                  isActive 
                    ? 'bg-brand-green-light/30 text-white shadow-xs border-l-2 border-brand-orange' 
                    : 'text-emerald-100 hover:text-white hover:bg-brand-green-light/20'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-brand-orange' : 'text-emerald-300'} />
                {tab.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-emerald-900/30 mt-2">
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md text-emerald-200 hover:text-white hover:bg-emerald-900/40 transition-all border border-emerald-800/50 cursor-pointer"
              title="Baixar cópia de segurança em arquivo JSON"
            >
              <Download size={14} className="text-brand-orange shrink-0" />
              <span>Baixar Backup JSON</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-emerald-900/30 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
              SG
            </div>
            <div>
              <div className="text-xs text-white font-semibold">Admin Escolar</div>
              <div className="text-[10px] text-emerald-300">Sítio-escola</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-brand-green-light/20 rounded-md transition-colors cursor-pointer"
            title="Bloquear Acesso"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header / Navigation */}
        <header className="bg-brand-green-dark text-white px-4 py-3 flex items-center justify-between md:hidden shrink-0" id="mobile-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-orange text-white rounded-lg flex items-center justify-center shadow-xs">
              <Sprout size={16} className="stroke-[2.5]" />
            </div>
            <h1 className="font-display font-bold text-sm tracking-tight">Sítio Geranium</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 hover:bg-brand-green-light/20 rounded-lg transition-colors text-emerald-100 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-brand-green-dark border-b border-emerald-900/30 px-4 py-2 flex flex-col gap-1 shrink-0"
            >
              {[
                { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard },
                { id: 'students', label: 'Fichas de Alunos', icon: Users },
                { id: 'negotiation', label: 'Calculadora de Acordo', icon: Calculator },
                { id: 'rematricula', label: 'Lista de Trabalho', icon: ClipboardList },
                { id: 'escala', label: 'Escala Contraturno', icon: CalendarDays },
                { id: 'pricing', label: 'Configurar Mensalidades', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                      isActive 
                        ? 'bg-brand-green-light/30 text-white' 
                        : 'text-emerald-100 hover:bg-brand-green-light/20'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-brand-orange' : 'text-emerald-300'} />
                    {tab.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  handleExportBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all text-emerald-200 hover:bg-emerald-900/40 border-t border-emerald-900/20 mt-1"
              >
                <Download size={14} className="text-brand-orange" />
                Baixar Backup JSON
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-all text-rose-300 hover:bg-rose-950/40"
              >
                <LogOut size={14} className="text-rose-400" />
                Sair do Sistema (Bloquear)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Statistics / Top Header inside Main Content */}
        <header className="bg-white border-b border-[#FAF9F5] py-2 md:py-3 px-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0" id="main-header">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-display">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Alunos</p>
              <p className="text-lg font-extrabold text-brand-green-dark leading-tight">{totalStudentsCount}</p>
            </div>
            <div className="sm:border-l sm:pl-8 border-slate-200">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Matriculados 2026</p>
              <p className="text-lg font-extrabold text-brand-green-dark leading-tight">
                {confirmedEnrollmentsCount} <span className="text-xs text-brand-green-light font-normal ml-1">({confirmedPercent}%)</span>
              </p>
            </div>
            <div className="sm:border-l sm:pl-8 border-slate-200">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Pendente / Negociação</p>
              <p className="text-lg font-extrabold text-brand-orange leading-tight">{pendingEnrollmentsCount}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button 
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 font-display"
              title="Baixar cópia de segurança completa do banco de dados em formato JSON"
            >
              <Download size={14} />
              Baixar Backup
            </button>

            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 font-display border border-slate-300">
              <Upload size={14} className="text-slate-500" />
              Restaurar
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>

            <button 
              onClick={() => setActiveTab('students')}
              className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer uppercase tracking-wider font-display ml-1"
            >
              NOVO ALUNO
            </button>
          </div>
        </header>

        {/* Main Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-brand-cream" id="main-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  students={students} 
                  enrollments={enrollments} 
                  contraturnos={contraturnos} 
                  onNavigate={setActiveTab} 
                  onNavigateWithStudent={handleNavigateWithStudent}
                  onImportGeraniumData={handleImportGeraniumData}
                  onClearDatabase={handleClearDatabase}
                />
              )}
              {activeTab === 'students' && (
                <StudentProfile 
                  students={students} 
                  guardians={guardians} 
                  enrollments={enrollments} 
                  contraturnos={contraturnos} 
                  movements={movements}
                  classPrices={classPrices}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={setSelectedStudentId}
                  onNavigateWithStudent={handleNavigateWithStudent}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onAddGuardian={handleAddGuardian}
                  onDeleteGuardian={handleDeleteGuardian}
                  onUpdateGuardian={handleUpdateGuardian}
                  onUpdateEnrollmentClass={handleUpdateEnrollmentClass}
                  onUpdateContraturnoNatureza={handleUpdateContraturnoNatureza}
                />
              )}
              {activeTab === 'negotiation' && (
                <NegotiationCalc 
                  students={students} 
                  guardians={guardians} 
                  enrollments={enrollments} 
                  contraturnos={contraturnos}
                  classPrices={classPrices}
                  contraturnoPrices={contraturnoPrices}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={setSelectedStudentId}
                  onConfirmNegotiation={handleConfirmNegotiation}
                />
              )}
              {activeTab === 'rematricula' && (
                <RematriculaList 
                  students={students} 
                  guardians={guardians} 
                  enrollments={enrollments} 
                  contraturnos={contraturnos}
                  classPrices={classPrices}
                  contraturnoPrices={contraturnoPrices}
                  preselectedStudentId={selectedStudentId}
                  onUpdateEnrollmentStatus={handleUpdateEnrollmentStatus}
                  onUpdateEnrollmentNotes={handleUpdateEnrollmentNotes}
                  onUpdateEnrollmentDiscounts={handleUpdateEnrollmentDiscounts}
                />
              )}
              {activeTab === 'escala' && (
                <ContraturnoSchedule 
                  students={students} 
                  contraturnos={contraturnos} 
                  enrollments={enrollments}
                  classPrices={classPrices}
                  onUpdateContraturnoNatureza={handleUpdateContraturnoNatureza}
                />
              )}
              {activeTab === 'pricing' && (
                <PricingSettings 
                  classPrices={classPrices}
                  contraturnoPrices={contraturnoPrices}
                  onSavePrices={handleSavePrices}
                  appPassword={appPassword}
                  onUpdatePassword={handleUpdatePassword}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Activity Bar / Footer */}
        <footer className="h-9 bg-brand-green-dark border-t border-emerald-900/20 flex items-center justify-between px-6 text-[10px] text-emerald-200/80 print:hidden shrink-0">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            Sítio-escola Conectado
          </div>
          <div>Cerrado • Brasília, DF</div>
          <div className="italic font-serif text-brand-sand hidden sm:block">"Pedagogia do Encontro, Sustentabilidade e Amor ao Ritmo da Infância"</div>
        </footer>

        {/* Global System Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </div>
  );
}
