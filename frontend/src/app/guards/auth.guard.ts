import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    // intenta refrescar la sesión si hay token guardado
    await auth.refreshMe();
  }

  if (auth.isAuthenticated()) return true;
  router.navigateByUrl('/auth');
  return false;
};
