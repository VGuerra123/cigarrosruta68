// src/services/firebase.ts

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { InventoryRecord, CountType } from "../types";

type Shift = "morning" | "afternoon" | "night";

// ——— Configuración de Firebase ———
const firebaseConfig = {
  apiKey: "AIzaSyBJIsuDIuIWKn2hrGH-XD62rIBLs7nSTFc",
  authDomain: "prontosmokesync.firebaseapp.com",
  projectId: "prontosmokesync",
  storageBucket: "prontosmokesync.firebasestorage.app",
  messagingSenderId: "855362777839",
  appId: "1:855362777839:web:7135cc4e058a6fd94ea11a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ——— Autenticación ———
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// ——— Guardar o actualizar conteo de inventario (optimizado) ———
export const saveInventoryCount = async (
  cigaretteId: string,
  countType: CountType,
  count: number,
  shift: Shift
): Promise<void> => {
  if (!auth.currentUser) throw new Error("Usuario no autenticado");

  // Fecha YYYY-MM-DD
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = today.toISOString().split("T")[0];

  // ID único: fecha_turno_idCigarro
  const recordId = `${dateString}_${shift}_${cigaretteId}`;
  const ref = doc(db, "inventoryRecords", recordId);

  // Para 'replenishment' usamos la clave 'replenishment', 
  // para initial/final usamos 'initialCount' / 'finalCount'
  const key =
    countType === "replenishment"
      ? "replenishment"
      : `${countType}Count`;

  await setDoc(
    ref,
    {
      date: dateString,
      shift,
      cigaretteId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName ?? "Desconocido",
      [key]: count,
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
};

// ——— Paginación de registros ———
const RECORDS_PER_PAGE = 20;

export interface PaginatedInventory {
  records: InventoryRecord[];
  lastDoc?: QueryDocumentSnapshot<InventoryRecord>;
  hasMore: boolean;
}

export const getInventoryRecords = async (
  startDate: Date,
  endDate: Date,
  shift?: Shift,
  lastDoc?: QueryDocumentSnapshot<InventoryRecord>
): Promise<PaginatedInventory> => {
  startDate.setHours(0,0,0,0);
  endDate.setHours(23,59,59,999);
  const startString = startDate.toISOString().split("T")[0];
  const endString = endDate.toISOString().split("T")[0];

  let baseQuery = query(
    collection(db, "inventoryRecords"),
    where("date", ">=", startString),
    where("date", "<=", endString),
    orderBy("date", "desc"),
    orderBy("timestamp", "desc")
  );
  if (shift) baseQuery = query(baseQuery, where("shift", "==", shift));

  let paged = query(baseQuery, limit(RECORDS_PER_PAGE));
  if (lastDoc) paged = query(paged, startAfter(lastDoc));

  const snap = await getDocs(paged);
  const docs = snap.docs as QueryDocumentSnapshot<InventoryRecord>[];
  const records = docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  return {
    records,
    lastDoc: docs.length ? docs[docs.length-1] : undefined,
    hasMore: docs.length === RECORDS_PER_PAGE
  };
};

export const getCurrentShiftInventory = async (
  shift: Shift
): Promise<InventoryRecord[]> => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dateString = today.toISOString().split("T")[0];

  const q = query(
    collection(db, "inventoryRecords"),
    where("date", "==", dateString),
    where("shift", "==", shift)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export default { auth, db, saveInventoryCount, getInventoryRecords, getCurrentShiftInventory };
