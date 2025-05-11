export interface Cigarette {
  id: string;
  name: string;
  image: string;
}

export interface InventoryRecord {
  id: string;
  cigaretteId: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  initialCount: number | null;
  replenishment: number | null;
  finalCount: number | null;
  userId: string;
  userName: string;
  timestamp: number;
}

export type CountType = 'initial' | 'replenishment' | 'final';

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  shift: 'all' | 'morning' | 'afternoon' | 'night';
}