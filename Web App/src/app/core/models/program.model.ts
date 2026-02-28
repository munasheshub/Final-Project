export interface ProgramDto {
  id?: number;
  name: string;
  description?: string;
  code: string;
  facultyId: number;
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  code: string;
  facultyId: number;
}

export interface UpdateProgramRequest {
  name: string;
  description?: string;
  code: string;
  facultyId: number;
}