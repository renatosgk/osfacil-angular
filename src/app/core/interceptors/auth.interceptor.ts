import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from '../services/auth.service';

const PUBLIC_ENDPOINTS = ['/login', '/register', '/register-funcionario'];

function isPublicEndpoint(url: string): boolean {
  const normalized = (() => {
    try {
      const parsed = new URL(url, window.location.origin);
      return parsed.pathname.replace(/\/+$/, '');
    } catch {
      return url.split('?')[0].replace(/\/+$/, '');
    }
  })();

  return PUBLIC_ENDPOINTS.some((endpoint) => normalized.endsWith(endpoint));
}

function isOurApiRequest(url: string): boolean {
  return url.startsWith(API_BASE_URL) || url.startsWith('/api');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!isOurApiRequest(req.url)) {
    return next(req);
  }

  const token = authService.getToken();

  if (isPublicEndpoint(req.url)) {
    const publicReq = req.headers.has('Authorization')
      ? req.clone({ headers: req.headers.delete('Authorization') })
      : req;
    return next(publicReq);
  }

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};
