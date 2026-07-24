import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { Student, Guardian, Enrollment, ContraturnoSegment, FinancialMovement } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_GUARDIANS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_CONTRATURNO_SEGMENTS, 
  INITIAL_FINANCIAL_MOVEMENTS 
} from './data';
import {
  IMPORTED_STUDENTS,
  getImportedGuardians,
  getImportedEnrollments,
  getImportedContraturnos
} from './importedStudents';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase with the custom database ID and enable long polling
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Checks if the Firestore database is empty or has old mock data. If so, automatically
 * seeds it with the 67 real students from the Sítio-Escola Geranium dataset.
 */
export async function seedDatabaseIfEmpty() {
  const studentsRef = collection(db, 'students');
  let studentsSnap;
  try {
    studentsSnap = await getDocs(studentsRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'students');
  }

  // We seed if it is empty OR if it contains the old mock student "student_1"
  const needsSeeding = studentsSnap.empty || studentsSnap.docs.some(d => d.id === 'student_1');
  
  if (!needsSeeding) {
    console.log('Database already populated with official Sítio Geranium data. Skipping seed.');
    return;
  }
  
  console.log('Firestore needs initial seed. Cleaning up and automatically seeding the 67 real Sítio-Escola Geranium students...');
  
  // Clean first to prevent mixed mock/real data
  await clearAllDatabaseCollections();

  const batch = writeBatch(db);

  // 1. Seed Students
  IMPORTED_STUDENTS.forEach((student) => {
    const docRef = doc(db, 'students', student.id);
    batch.set(docRef, student);
  });

  // 2. Seed Guardians
  const guardiansList = getImportedGuardians();
  guardiansList.forEach((guardian) => {
    const docRef = doc(db, 'guardians', guardian.id);
    batch.set(docRef, guardian);
  });

  // 3. Seed Enrollments
  const enrollmentsList = getImportedEnrollments();
  enrollmentsList.forEach((enrollment) => {
    const docRef = doc(db, 'enrollments', enrollment.id);
    batch.set(docRef, enrollment);
  });

  // 4. Seed Contraturnos
  const contraturnosList = getImportedContraturnos();
  contraturnosList.forEach((segment) => {
    const docRef = doc(db, 'contraturnos', segment.id);
    batch.set(docRef, segment);
  });

  try {
    await batch.commit();
    console.log('Automatic seeding of 67 real Sítio Geranium students completed successfully!');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_automatic_seed');
  }
}

/**
 * Deletes all documents from the Firestore database collections to allow a clean state/import.
 */
export async function clearAllDatabaseCollections(): Promise<void> {
  const collections = ['students', 'guardians', 'enrollments', 'contraturnos', 'movements'];
  for (const colName of collections) {
    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      console.log(`Cleared collection: ${colName}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clear_${colName}`);
    }
  }
}

/**
 * Fetch all documents from a Firestore collection
 */
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as T);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}

/**
 * Add or update a document in a collection
 */
export async function saveDocument<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${data.id}`);
  }
}

/**
 * Delete a document from a collection
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

