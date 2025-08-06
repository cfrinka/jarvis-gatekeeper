import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface LogEntry {
  id?: string;
  action: string;
  details: string;
  userId: string | null;
  userName: string | null;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
}

class LoggingService {
  private readonly COLLECTION_NAME = 'logs';

  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const logData = {
        ...entry,
        timestamp: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date())
      };

      await addDoc(collection(db, this.COLLECTION_NAME), logData);
    } catch (error) {
      console.error('Failed to log entry:', error);

    }
  }

  async getLogs(maxEntries: number = 100): Promise<LogEntry[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('timestamp', 'desc'),
        limit(maxEntries)
      );

      const querySnapshot = await getDocs(q);
      const logs: LogEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          action: data.action,
          details: data.details,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
          level: data.level
        });
      });

      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  async logVisitorAction(action: string, visitorName: string, userName: string | null = null, userId: string | null = null): Promise<void> {
    await this.log({
      action: 'visitor_action',
      details: `${action}: ${visitorName}`,
      userId,
      userName,
      level: 'info'
    });
  }

  async logAuthAction(action: string, userEmail: string): Promise<void> {
    await this.log({
      action: 'auth_action',
      details: `${action}: ${userEmail}`,
      userId: null,
      userName: null,
      level: 'info'
    });
  }

  async logError(error: string, context: string | null = null, userId: string | null = null, userName: string | null = null): Promise<void> {
    await this.log({
      action: 'error',
      details: context ? `${context}: ${error}` : error,
      userId,
      userName,
      level: 'error'
    });
  }
}

export const loggingService = new LoggingService();
