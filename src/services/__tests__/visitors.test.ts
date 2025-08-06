import { visitorService, RegisterVisitorRequest, CheckoutVisitorRequest } from '../visitors';
import { loggingService } from '../logging';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';


jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date) => ({ toDate: () => date }))
  }
}));

jest.mock('../../lib/firebase', () => ({
  db: {}
}));

jest.mock('../logging', () => ({
  loggingService: {
    log: jest.fn()
  }
}));

describe('VisitorService - Core Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  

  describe('register visitor flow', () => {
    it('should register visitor successfully and log the action', async () => {
      const request: RegisterVisitorRequest = {
        name: 'John Doe',
        cpf: '04017817807',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        room: 'Room 101',
        currentUserId: 'user123',
        currentUserName: 'Admin User'
      };


      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const mockDocRef = { id: 'visitor123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await visitorService.registerVisitor(request);

      expect(result).toMatchObject({
        id: 'visitor123',
        name: 'John Doe',
        status: 'in_building',
        room: 'Room 101'
      });

      expect(loggingService.log).toHaveBeenCalledWith({
        action: 'VISITOR_REGISTERED',
        details: 'Visitante John Doe registrado na Room 101',
        userId: 'user123',
        userName: 'Admin User',
        level: 'info'
      });
    });
  });

  describe('checkout visitor flow', () => {
    it('should checkout visitor successfully and log the action', async () => {
      const request: CheckoutVisitorRequest = {
        visitorId: 'visitor123',
        currentUserId: 'user123',
        currentUserName: 'Admin User'
      };

      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const mockVisitor = {
        id: 'visitor123',
        name: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john.doe@example.com',
        dateOfBirth: '1990-01-01',
        room: 'Room 101',
        status: 'checked_out' as const,
        checkInTime: '2025-08-06T10:00:00Z',
        checkOutTime: '2025-08-06T15:00:00Z',
        registeredBy: 'Admin User',
        registeredById: 'admin123',
        checkedInBy: 'Security Guard',
        checkedInById: 'guard123',
        checkedOutBy: 'Security Guard',
        checkedOutById: 'guard123',
        createdAt: '2025-08-06T09:00:00Z',
        updatedAt: '2025-08-06T15:00:00Z'
      };

      jest.spyOn(visitorService, 'getVisitors').mockResolvedValue([mockVisitor]);

      const result = await visitorService.checkoutVisitor(request);

      expect(result).toEqual(mockVisitor);
      expect(updateDoc).toHaveBeenCalled();
      expect(loggingService.log).toHaveBeenCalledWith({
        action: 'VISITOR_CHECKED_OUT',
        details: 'Visitante John Doe fez checkout da Room 101',
        userId: 'user123',
        userName: 'Admin User',
        level: 'info'
      });
    });
  });

  describe('room limits flow', () => {
    it('should enforce room capacity limits (max 3 visitors)', async () => {
      const request: RegisterVisitorRequest = {
        name: 'John Doe',
        cpf: '04017817807',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        room: 'Room 101',
        currentUserId: 'user123',
        currentUserName: 'Admin User'
      };


      (getDocs as jest.Mock)
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({
          docs: [
            { id: '1', data: () => ({ name: 'Visitor 1', status: 'in_building' }) },
            { id: '2', data: () => ({ name: 'Visitor 2', status: 'in_building' }) },
            { id: '3', data: () => ({ name: 'Visitor 3', status: 'in_building' }) }
          ]
        });

      await expect(visitorService.registerVisitor(request))
        .rejects.toThrow('Sala Room 101 está lotada (máximo 3 visitantes). Escolha outra sala ou aguarde uma vaga.');
    });

    it('should prevent duplicate check-ins', async () => {
      const request: RegisterVisitorRequest = {
        name: 'John Doe',
        cpf: '04017817807',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
        room: 'Room 101',
        currentUserId: 'user123',
        currentUserName: 'Admin User'
      };


      const mockQuerySnapshot = {
        empty: false,
        docs: [{
          id: 'existing123',
          data: () => ({
            name: 'John Doe',
            status: 'in_building',
            room: 'Room 102',
            createdAt: new Date()
          })
        }]
      };
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      await expect(visitorService.registerVisitor(request))
        .rejects.toThrow('Visitante John Doe já está no prédio (Room 102). Faça checkout antes de registrar em nova sala.');
    });
  });

  describe('get visitors flow', () => {
    it('should retrieve visitors with filtering', async () => {
      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          const mockDoc = {
            id: 'visitor123',
            data: () => ({
              name: 'John Doe',
              status: 'in_building',
              room: 'Room 101',
              createdAt: { toDate: () => new Date('2023-01-01') },
              updatedAt: { toDate: () => new Date('2023-01-01') }
            })
          };
          callback(mockDoc);
        })
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await visitorService.getVisitors({ filter: 'in_building' });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'visitor123',
        name: 'John Doe',
        status: 'in_building'
      });
      expect(where).toHaveBeenCalledWith('status', '==', 'in_building');
    });
  });
});
