import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Define database context type
type DatabaseContextType = {
  database: SQLite.WebSQLDatabase | null;
  isInitialized: boolean;
};

// Create context with default values
const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
  isInitialized: false,
});

// Database provider component
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<SQLite.WebSQLDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Open database (or create if it doesn't exist)
    const db = SQLite.openDatabase('rastrela.db');
    setDatabase(db);

    // Initialize tables
    const initDatabase = async () => {
      if (db) {
        // Create items table
        db.transaction((tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS items (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              type TEXT NOT NULL,
              description TEXT,
              location TEXT,
              date TEXT NOT NULL,
              status TEXT NOT NULL,
              owner_id TEXT NOT NULL,
              image_uri TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              synchronized INTEGER DEFAULT 0
            )`,
            [],
            () => {
              console.log('Items table created successfully');
              setIsInitialized(true);
            },
            (_, error) => {
              console.error('Error creating items table:', error);
              return false;
            }
          );
        });
        
        // Create sync queue table for offline operations
        db.transaction((tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sync_queue (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              action TEXT NOT NULL,
              entity TEXT NOT NULL,
              entity_id TEXT,
              data TEXT,
              created_at TEXT NOT NULL
            )`,
            [],
            () => {
              console.log('Sync queue table created successfully');
            },
            (_, error) => {
              console.error('Error creating sync queue table:', error);
              return false;
            }
          );
        });
      }
    };

    initDatabase();

    return () => {
      // Close database when component unmounts
      if (Platform.OS !== 'web' && database) {
        // database.close();
      }
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ database, isInitialized }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Custom hook for using database context
export const useDatabase = () => useContext(DatabaseContext);