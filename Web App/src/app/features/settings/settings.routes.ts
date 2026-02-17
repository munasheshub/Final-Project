import { Routes } from "@angular/router";
import { ProgramComponent } from "./programs/program";
import { StudentComponent } from "./students/student";

export default [
    { path: 'programs', component: ProgramComponent },
    { path: 'students', component: StudentComponent },
] as Routes;