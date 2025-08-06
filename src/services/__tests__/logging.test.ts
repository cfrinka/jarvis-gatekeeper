import { loggingService, LogEntry } from '../logging';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';


jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: any) => ({ toDate: () => date }))
  }
}));

jest.mock('../../lib/firebase', () => ({
  db: {}
}));

describe('LoggingService - Core Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('log flow', () => {
    it('should log entries successfully', async () => {
      const logEntry = {
        action: 'VISITOR_REGISTERED',
        details: 'Visitante John Doe registrado na Room 101',
        userId: 'user123',
        userName: 'Admin User',
        level: 'info' as const
      };

      (addDoc as jest.Mock).mockResolvedValue({ id: 'log123' });

      await loggingService.log(logEntry);

      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('get logs flow', () => {
    it('should retrieve logs successfully', async () => {
      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          const mockDoc = {
            id: 'log123',
            data: () => ({
              action: 'VISITOR_REGISTERED',
              details: 'Test log entry',
              userId: 'user123',
              userName: 'Test User',
              level: 'info',
              timestamp: { toDate: () => new Date('2023-01-01') }
            })
          };
          callback(mockDoc);
        })
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await loggingService.getLogs();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'log123',
        action: 'VISITOR_REGISTERED',
        details: 'Test log entry',
        userId: 'user123',
        userName: 'Test User',
        level: 'info'
      });

      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(limit).toHaveBeenCalledWith(100);
    });
  });
});
