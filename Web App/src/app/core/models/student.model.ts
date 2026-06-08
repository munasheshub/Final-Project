export interface CreateStudentRequest {
  tenantId?: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
  programId?: number;
}

export interface UpdateStudentRequest {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
  programId?: number;
}