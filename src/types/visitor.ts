export type VisitorStatus = 'in_building' | 'checked_out';

export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  email: string;
  dateOfBirth: string | null;
  room: string;
  status: VisitorStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  registeredBy: string;
  registeredById: string | null;
  checkedInBy: string | null;
  checkedInById: string | null;
  checkedOutBy: string | null;
  checkedOutById: string | null;
  createdAt: string;
  updatedAt: string;
}
