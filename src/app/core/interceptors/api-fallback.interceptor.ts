import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import {
  API_BASE_URL,
  ONLINE_API_BASE_URL,
  isLocalApiUrl,
} from '../constants/api.constants';
import { NotificationService } from '../services/notification.service';

let hasWarnedFallback = false;

export const apiFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const canFallback =
    isLocalApiUrl(API_BASE_URL) && req.url.startsWith(API_BASE_URL) && !req.url.startsWith(ONLINE_API_BASE_URL);

  if (!canFallback) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;
      const isNetworkFailure = httpError instanceof HttpErrorResponse && httpError.status === 0;

      if (!isNetworkFailure) {
        return throwError(() => error);
      }

      const fallbackUrl = req.url.replace(API_BASE_URL, ONLINE_API_BASE_URL);
      const retryReq = req.clone({ url: fallbackUrl });

      if (!hasWarnedFallback) {
        notification.warning('API local indisponivel. Usando API online automaticamente.');
        hasWarnedFallback = true;
      }

      return next(retryReq);
    })
  );
};
