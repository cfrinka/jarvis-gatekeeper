export interface LogEntry {
  id?: string;
  action: string;
  details: string;
  userId: string | null;
  userName: string | null;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
}
