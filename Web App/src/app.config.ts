import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Nora from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/core/interceptors/auth.interceptor';
import { errorInterceptor } from '@/core/interceptors/error.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes),
        provideHttpClient(withFetch(),
        withInterceptors([
            authInterceptor,
            errorInterceptor,
        ])
      ),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Nora, options: { darkModeSelector: '.app-dark' } } }),
        MessageService,
        
    ]
};
