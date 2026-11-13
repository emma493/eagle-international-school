import Dexie, { Table } from "dexie";

export interface SyncQueueEntry {
  id?: string;
  idempotency_key: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body: any;
  created_at: number;
  attempts: number;
}

export interface CachedStudent {
  id: string;
  admission_no: string;
  full_name: string;
  class_id: string;
  photo_url?: string;
  credit_balance: number;
  canteen_paid_until?: string;
  status: string;
  updated_at: number;
}

export interface CachedClass {
  id: string;
  department: string;
  name: string;
  form_master_id?: string;
  updated_at: number;
}

export interface CachedSubject {
  id: string;
  name: string;
  department_group: string;
  updated_at: number;
}

export class EagleDB extends Dexie {
  sync_queue!: Table<SyncQueueEntry, string>;
  students!: Table<CachedStudent, string>;
  classes!: Table<CachedClass, string>;
  subjects!: Table<CachedSubject, string>;

  constructor() {
    super("EagleSchoolDB");
    this.version(1).stores({
      sync_queue: "++id, idempotency_key, created_at",
      students: "id, admission_no, class_id, updated_at",
      classes: "id, department, updated_at",
      subjects: "id, department_group, updated_at",
    });
  }

  async enqueueSync(entry: Omit<SyncQueueEntry, "id">) {
    return this.sync_queue.add({
      ...entry,
      created_at: Date.now(),
      attempts: 0,
    });
  }

  async getPendingSync() {
    return this.sync_queue.toCollection().sortBy("created_at");
  }

  async removeSync(id: string) {
    return this.sync_queue.delete(id);
  }

  async clearSync() {
    return this.sync_queue.clear();
  }
}

export const db = new EagleDB();
