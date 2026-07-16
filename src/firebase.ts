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
 * Checks if the Firestore database is empty. We no longer seed mock data automatically.
 */
export async function seedDatabaseIfEmpty() {
  console.log('Automatic mock seeding is disabled. Database will start empty.');
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

