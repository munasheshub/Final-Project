import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Empty } from './empty/empty';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
    // Note: /notfound route is defined at the app root level
] as Routes;
