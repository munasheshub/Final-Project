export interface CreateStudentRequest {
  studentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateStudentRequest {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber?: string;
}