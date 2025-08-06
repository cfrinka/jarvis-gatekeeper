import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { loggingService } from './logging';
import { LoginCredentials, RegisterData } from '../types/auth';
import { User } from '../types/user';

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      const user = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        role: userData.role || 'user'
      };
      

      await loggingService.log({
        action: 'USER_LOGIN',
        details: `Usuário ${userData.name} fez login`,
        userId: user.id,
        userName: userData.name,
        level: 'info'
      });
      
      return user;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async register(data: RegisterData, adminPassword: string): Promise<User> {
    if (!data.email || !data.password || !data.name) {
      throw new Error('Email, password, and name are required');
    }

    if (adminPassword !== 'admin@123') {
      throw new Error('Invalid admin password');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      const user: User = {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: 'admin'
      };


      await setDoc(doc(db, 'users', user.id), {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString()
      });


      await loggingService.log({
        action: 'USER_REGISTRATION',
        details: `Novo usuário ${user.name} foi registrado`,
        userId: user.id,
        userName: user.name,
        level: 'info'
      });

      return user;
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      
      await signOut(auth);
      

      if (currentUser) {
        await loggingService.log({
          action: 'USER_LOGOUT',
          details: `Usuário fez logout`,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email || 'Unknown',
          level: 'info'
        });
      }
    } catch (error) {
      throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            callback({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              role: userData.role || 'user'
            });
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
