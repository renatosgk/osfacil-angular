import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { NotificationService } from '../services/notification.service';

export const apiFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const isApiCall = req.url.startsWith(API_BASE_URL) || req.url.startsWith('/api');

  if (!isApiCall) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;
      if (httpError instanceof HttpErrorResponse && httpError.status === 0) {
        notification.error(
          `Sem conexão com a API. Verifique se o servidor está rodando em ${API_BASE_URL}.`
        );
      }
      return throwError(() => error);
    })
  );
};
