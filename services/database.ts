import { StolenItem, SyncQueueItem } from '@/types';
import * as SQLite from 'expo-sqlite';

// Database operations for stolen items
export const itemsDb = {
  // Create a new stolen item
  create: async (
    db: SQLite.WebSQLDatabase,
    item: Omit<StolenItem, 'id'>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const now = new Date().toISOString();
      
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO items (
              id, name, type, description, location, date, status, 
              owner_id, image_uri, created_at, updated_at, synchronized
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.name,
              item.type,
              item.description || '',
              item.location || '',
              item.date,
              item.status,
              item.ownerId,
              item.imageUri || '',
              now,
              now,
              0, // not synchronized
            ],
            () => {
              resolve(id);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Get all stolen items
  getAll: async (db: SQLite.WebSQLDatabase): Promise<StolenItem[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM items ORDER BY created_at DESC',
            [],
            (_, { rows }) => {
              const items: StolenItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                items.push({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  description: item.description,
                  location: item.location,
                  date: item.date,
                  status: item.status,
                  ownerId: item.owner_id,
                  imageUri: item.image_uri,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                  synchronized: Boolean(item.synchronized),
                });
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Get item by ID
  getById: async (
    db: SQLite.WebSQLDatabase,
    id: string
  ): Promise<StolenItem | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM items WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length === 0) {
                resolve(null);
                return;
              }
              
              const item = rows.item(0);
              resolve({
                id: item.id,
                name: item.name,
                type: item.type,
                description: item.description,
                location: item.location,
                date: item.date,
                status: item.status,
                ownerId: item.owner_id,
                imageUri: item.image_uri,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                synchronized: Boolean(item.synchronized),
              });
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Get items by owner
  getByOwner: async (
    db: SQLite.WebSQLDatabase,
    ownerId: string
  ): Promise<StolenItem[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM items WHERE owner_id = ? ORDER BY created_at DESC',
            [ownerId],
            (_, { rows }) => {
              const items: StolenItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                items.push({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  description: item.description,
                  location: item.location,
                  date: item.date,
                  status: item.status,
                  ownerId: item.owner_id,
                  imageUri: item.image_uri,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                  synchronized: Boolean(item.synchronized),
                });
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Update item
  update: async (
    db: SQLite.WebSQLDatabase,
    id: string,
    updates: Partial<StolenItem>
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      
      if (updates.type !== undefined) {
        fields.push('type = ?');
        values.push(updates.type);
      }
      
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      
      if (updates.location !== undefined) {
        fields.push('location = ?');
        values.push(updates.location);
      }
      
      if (updates.date !== undefined) {
        fields.push('date = ?');
        values.push(updates.date);
      }
      
      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      
      if (updates.imageUri !== undefined) {
        fields.push('image_uri = ?');
        values.push(updates.imageUri);
      }
      
      // Always update these fields
      fields.push('updated_at = ?');
      values.push(now);
      
      fields.push('synchronized = ?');
      values.push(0); // Mark as not synchronized
      
      // Complete the values array with the ID
      values.push(id);
      
      db.transaction(
        (tx) => {
          tx.executeSql(
            `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
            values,
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Delete item
  delete: async (
    db: SQLite.WebSQLDatabase,
    id: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM items WHERE id = ?',
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Search items
  search: async (
    db: SQLite.WebSQLDatabase,
    query: string
  ): Promise<StolenItem[]> => {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${query}%`;
      
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT * FROM items 
             WHERE name LIKE ? OR type LIKE ? OR description LIKE ? OR location LIKE ?
             ORDER BY created_at DESC`,
            [searchTerm, searchTerm, searchTerm, searchTerm],
            (_, { rows }) => {
              const items: StolenItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                items.push({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  description: item.description,
                  location: item.location,
                  date: item.date,
                  status: item.status,
                  ownerId: item.owner_id,
                  imageUri: item.image_uri,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                  synchronized: Boolean(item.synchronized),
                });
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Mark item as synchronized
  markSynchronized: async (
    db: SQLite.WebSQLDatabase,
    id: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE items SET synchronized = 1 WHERE id = ?',
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Get unsynchronized items
  getUnsynchronized: async (
    db: SQLite.WebSQLDatabase
  ): Promise<StolenItem[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM items WHERE synchronized = 0',
            [],
            (_, { rows }) => {
              const items: StolenItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                items.push({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  description: item.description,
                  location: item.location,
                  date: item.date,
                  status: item.status,
                  ownerId: item.owner_id,
                  imageUri: item.image_uri,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                  synchronized: Boolean(item.synchronized),
                });
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
};

// Database operations for sync queue
export const syncQueueDb = {
  // Add item to sync queue
  add: async (
    db: SQLite.WebSQLDatabase,
    item: Omit<SyncQueueItem, 'id' | 'createdAt'>
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO sync_queue (action, entity, entity_id, data, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
              item.action,
              item.entity,
              item.entityId || null,
              item.data ? JSON.stringify(item.data) : null,
              now,
            ],
            (_, { insertId }) => {
              resolve(insertId);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Get all queue items
  getAll: async (db: SQLite.WebSQLDatabase): Promise<SyncQueueItem[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM sync_queue ORDER BY created_at ASC',
            [],
            (_, { rows }) => {
              const items: SyncQueueItem[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                items.push({
                  id: item.id,
                  action: item.action,
                  entity: item.entity,
                  entityId: item.entity_id,
                  data: item.data ? JSON.parse(item.data) : null,
                  createdAt: item.created_at,
                });
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Delete item from queue
  delete: async (
    db: SQLite.WebSQLDatabase,
    id: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM sync_queue WHERE id = ?',
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
  
  // Clear the entire queue
  clear: async (db: SQLite.WebSQLDatabase): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM sync_queue',
            [],
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
};

// Export default
export default {
  items: itemsDb,
  syncQueue: syncQueueDb,
};