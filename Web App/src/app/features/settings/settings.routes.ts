import { Routes } from "@angular/router";
import { ProgramComponent } from "./programs/program";
import { StudentComponent } from "./students/student";
import { InstitutionComponent } from "./institutions/institution";
import { FacultyComponent } from "./faculties/faculty";
import { permissionGuard } from "@/core/guards/permission.guard";
import { Permission } from "@/core/models/user.model";

export default [
    {
        path: 'programs',
        component: ProgramComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.PROGRAM_VIEW] }
    },
    {
        path: 'students',
        component: StudentComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.STUDENT_VIEW] }
    },
    {
        path: 'institutions',
        component: InstitutionComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.SETTINGS_INSTITUTION] }
    },
    {
        path: 'faculties',
        component: FacultyComponent,
        canActivate: [permissionGuard],
        data: { permissions: [Permission.FACULTY_VIEW] }
    },
] as Routes;