import { Routes } from "@angular/router";
import { ProgramComponent } from "./programs/program";
import { StudentComponent } from "./students/student";
import { InstitutionComponent } from "./institutions/institution";
import { FacultyComponent } from "./faculties/faculty";

export default [
    { path: 'programs', component: ProgramComponent },
    { path: 'students', component: StudentComponent },
    { path: 'institutions', component: InstitutionComponent },
    { path: 'faculties', component: FacultyComponent },
] as Routes;