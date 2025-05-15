// Stolen item types
export type StolenItemStatus = 'stolen' | 'recovered' | 'in_investigation';

export type StolenItemType = 
  | 'electronics'
  | 'vehicle'
  | 'jewelry'
  | 'document'
  | 'bicycle'
  | 'other';

export interface StolenItem {
  id: string;
  name: string;
  type: StolenItemType;
  description: string;
  location: string;
  date: string; // ISO date string
  status: StolenItemStatus;
  ownerId: string;
  imageUri?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  synchronized: boolean;
}

// Sync queue types
export type SyncAction = 'create' | 'update' | 'delete';

export type SyncEntity = 'item';

export interface SyncQueueItem {
  id: number;
  action: SyncAction;
  entity: SyncEntity;
  entityId: string | null;
  data: any | null;
  createdAt: string; // ISO date string
}