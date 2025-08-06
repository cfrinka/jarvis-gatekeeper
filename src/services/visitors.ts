import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Visitor, VisitorStatus } from '../types/visitor';
import { RegisterVisitorRequest, CheckoutVisitorRequest, FilterType } from '../types/visitors';
import { loggingService } from './logging';

class VisitorService {
  private readonly COLLECTION_NAME = 'visitors';

  async registerVisitor(request: RegisterVisitorRequest): Promise<Visitor> {
    if (!request.name || !request.cpf || !request.email) {
      throw new Error('Name, CPF, and email are required');
    }


    if (!this.isValidCPF(request.cpf)) {
      throw new Error('Invalid CPF format');
    }


    if (!this.isValidEmail(request.email)) {
      throw new Error('Invalid email format');
    }


    const existingVisitor = await this.findVisitorByCPF(request.cpf);
    if (existingVisitor && existingVisitor.status === 'in_building') {
      throw new Error(`Visitante ${existingVisitor.name} já está no prédio (${existingVisitor.room}). Faça checkout antes de registrar em nova sala.`);
    }


    const visitorsInRoom = await this.getVisitorsInRoom(request.room);
    if (visitorsInRoom.length >= 3) {
      throw new Error(`Sala ${request.room} está lotada (máximo 3 visitantes). Escolha outra sala ou aguarde uma vaga.`);
    }

    try {
      const now = new Date();
      const visitorData = {
        name: request.name,
        cpf: request.cpf,
        email: request.email,
        dateOfBirth: request.dateOfBirth || null,
        room: request.room,
        status: 'in_building' as VisitorStatus,
        checkInTime: Timestamp.fromDate(now),
        checkOutTime: null,
        registeredBy: request.currentUserName || 'Unknown',
        registeredById: request.currentUserId || null,
        checkedInBy: request.currentUserName || 'Unknown',
        checkedInById: request.currentUserId || null,
        checkedOutBy: null,
        checkedOutById: null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), visitorData);

      const visitor = {
        id: docRef.id,
        ...visitorData,
        checkInTime: now.toISOString(),
        checkOutTime: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };


      await loggingService.log({
        action: 'VISITOR_REGISTERED',
        details: `Visitante ${request.name} registrado na ${request.room}`,
        userId: request.currentUserId || null,
        userName: request.currentUserName || 'Sistema',
        level: 'info'
      });

      return visitor;
    } catch (error) {
      throw new Error(`Failed to register visitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkoutVisitor(request: CheckoutVisitorRequest): Promise<Visitor> {
    if (!request.visitorId) {
      throw new Error('Visitor ID is required');
    }

    try {
      const now = new Date();
      const visitorRef = doc(db, this.COLLECTION_NAME, request.visitorId);

      await updateDoc(visitorRef, {
        status: 'checked_out' as VisitorStatus,
        checkOutTime: Timestamp.fromDate(now),
        checkedOutBy: request.currentUserName || 'Unknown',
        checkedOutById: request.currentUserId || null,
        updatedAt: Timestamp.fromDate(now)
      });


      const visitors = await this.getVisitors({ filter: 'all' });
      const updatedVisitor = visitors.find(v => v.id === request.visitorId);
      
      if (!updatedVisitor) {
        throw new Error('Visitor not found after checkout');
      }


      await loggingService.log({
        action: 'VISITOR_CHECKED_OUT',
        details: `Visitante ${updatedVisitor.name} fez checkout da ${updatedVisitor.room}`,
        userId: request.currentUserId || null,
        userName: request.currentUserName || 'Sistema',
        level: 'info'
      });

      return updatedVisitor;
    } catch (error) {
      throw new Error(`Failed to checkout visitor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVisitors(options: { filter?: FilterType } = {}): Promise<Visitor[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      if (options.filter === 'in_building') {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('status', '==', 'in_building')
        );
      } else if (options.filter === 'checked_out') {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('status', '==', 'checked_out')
        );
      }

      const querySnapshot = await getDocs(q);
      const visitors: Visitor[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visitors.push({
          id: doc.id,
          name: data.name,
          cpf: data.cpf,
          email: data.email,
          dateOfBirth: data.dateOfBirth,
          room: data.room,
          status: data.status,
          checkInTime: data.checkInTime?.toDate().toISOString() || null,
          checkOutTime: data.checkOutTime?.toDate().toISOString() || null,
          registeredBy: data.registeredBy,
          registeredById: data.registeredById,
          checkedInBy: data.checkedInBy,
          checkedInById: data.checkedInById,
          checkedOutBy: data.checkedOutBy,
          checkedOutById: data.checkedOutById,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        });
      });


      visitors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return visitors;
    } catch (error) {
      throw new Error(`Failed to get visitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVisitorsInRoom(roomName: string): Promise<Visitor[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('room', '==', roomName),
        where('status', '==', 'in_building')
      );

      const querySnapshot = await getDocs(q);
      const visitors: Visitor[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visitors.push({
          id: doc.id,
          name: data.name,
          cpf: data.cpf,
          email: data.email,
          dateOfBirth: data.dateOfBirth,
          room: data.room,
          status: data.status,
          checkInTime: data.checkInTime?.toDate().toISOString() || null,
          checkOutTime: data.checkOutTime?.toDate().toISOString() || null,
          registeredBy: data.registeredBy,
          registeredById: data.registeredById,
          checkedInBy: data.checkedInBy,
          checkedInById: data.checkedInById,
          checkedOutBy: data.checkedOutBy,
          checkedOutById: data.checkedOutById,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        });
      });

      return visitors;
    } catch (error) {
      console.error('Error getting visitors in room:', error);
      return [];
    }
  }



  private isValidCPF(cpf: string): boolean {

    const cleanCPF = cpf.replace(/\D/g, '');
    

    if (cleanCPF.length !== 11) return false;
    

    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async findVisitorByCPF(cpf: string): Promise<Visitor | null> {
    if (!cpf) {
      return null;
    }

    try {

      const cleanCPF = cpf.replace(/\D/g, '');
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('cpf', '==', cleanCPF)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }


      const sortedDocs = querySnapshot.docs.sort((a, b) => {
        const aTime = a.data().createdAt?.toDate?.() || new Date(a.data().createdAt);
        const bTime = b.data().createdAt?.toDate?.() || new Date(b.data().createdAt);
        return bTime.getTime() - aTime.getTime();
      });
      

      const doc = sortedDocs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        room: data.room,
        status: data.status,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        registeredBy: data.registeredBy,
        registeredById: data.registeredById,
        checkedInBy: data.checkedInBy,
        checkedInById: data.checkedInById,
        checkedOutBy: data.checkedOutBy || null,
        checkedOutById: data.checkedOutById || null
      };
    } catch (error) {
      console.error('Error finding visitor by CPF:', error);
      return null;
    }
  }
}

export const visitorService = new VisitorService();
