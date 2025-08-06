export interface RegisterVisitorRequest {
  name: string;
  cpf: string;
  email: string;
  dateOfBirth: string | null;
  room: string;
  currentUserId: string | null;
  currentUserName: string | null;
}

export interface CheckoutVisitorRequest {
  visitorId: string;
  currentUserId: string | null;
  currentUserName: string | null;
}

export type FilterType = 'all' | 'in_building' | 'checked_out';
