export interface FacultyDto {
    id: number;
    name: string;
    code: string;
    institutionId: number;
}

export interface CreateFacultyRequest {
    name: string;
    code: string;
    institutionId: number;
}

export interface UpdateFacultyRequest {
    id: number;
    name: string;
    code: string;
}
