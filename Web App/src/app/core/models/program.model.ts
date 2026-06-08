export interface ProgramDto {
  id?: number;
  name: string;
  description?: string;
  code: string;
  facultyId: number;
  qualificationType: number;
  awardClass?: number | null;
}

export interface CreateProgramRequest {
  name: string;
  description?: string;
  code: string;
  facultyId: number;
  qualificationType: number;
  awardClass?: number | null;
}

export interface UpdateProgramRequest {
  name: string;
  description?: string;
  code: string;
  facultyId: number;
  qualificationType: number;
  awardClass?: number | null;
}