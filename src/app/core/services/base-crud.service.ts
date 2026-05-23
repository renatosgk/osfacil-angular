import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../constants/api.constants';

export abstract class BaseCrudService<T extends { id?: number }> {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = API_BASE_URL;
  protected abstract readonly endpoint: string;

  list(params?: Record<string, string | number | undefined>): Observable<T[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && `${value}`.length > 0) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/${this.endpoint}`, { params: httpParams }).pipe(
      map(r => {
        if (Array.isArray(r)) return r as T[];
        if (r?._embedded) {
          const key = Object.keys(r._embedded)[0];
          const value = r._embedded[key];
          return (Array.isArray(value) ? value : []) as T[];
        }
        if (r?.content && Array.isArray(r.content)) return r.content as T[];
        return [];
      })
    );
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  create(payload: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, payload);
  }

  update(id: number, payload: Record<string, unknown>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }
}
