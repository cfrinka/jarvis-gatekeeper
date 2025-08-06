import { authService, LoginCredentials, RegisterData } from '../auth';
import { loggingService } from '../logging';
import { auth, db } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';


jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));


jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn()
}));


jest.mock('../../lib/firebase', () => ({
  auth: {},
  db: {}
}));


jest.mock('../logging', () => ({
  loggingService: {
    log: jest.fn()
  }
}));

describe('AuthService - Core Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login flow', () => {
    it('should login successfully and log the action', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUserCredential = {
        user: { uid: 'user123', email: 'test@example.com' }
      };

      const mockUserDoc = {
        exists: () => true,
        data: () => ({ name: 'Test User', role: 'admin' })
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (getDoc as jest.Mock).mockResolvedValue(mockUserDoc);

      const result = await authService.login(credentials);

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      });

      expect(loggingService.log).toHaveBeenCalledWith({
        action: 'USER_LOGIN',
        details: 'Usuário Test User fez login',
        userId: 'user123',
        userName: 'Test User',
        level: 'info'
      });
    });
  });

  describe('register flow', () => {
    it('should register user successfully and log the action', async () => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      const mockUserCredential = {
        user: { uid: 'newuser123' }
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(registerData, 'admin@123');

      expect(result).toEqual({
        id: 'newuser123',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'admin'
      });

      expect(setDoc).toHaveBeenCalled();
      expect(loggingService.log).toHaveBeenCalledWith({
        action: 'USER_REGISTRATION',
        details: 'Novo usuário New User foi registrado',
        userId: 'newuser123',
        userName: 'New User',
        level: 'info'
      });
    });
  });

  describe('logout flow', () => {
    it('should logout successfully and log the action', async () => {
      const mockCurrentUser = {
        uid: 'user123',
        displayName: 'Test User',
        email: 'test@example.com'
      };

      Object.defineProperty(auth, 'currentUser', {
        value: mockCurrentUser,
        configurable: true
      });

      (signOut as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      expect(signOut).toHaveBeenCalledWith(auth);
      expect(loggingService.log).toHaveBeenCalledWith({
        action: 'USER_LOGOUT',
        details: 'Usuário fez logout',
        userId: 'user123',
        userName: 'Test User',
        level: 'info'
      });
    });
  });
});
