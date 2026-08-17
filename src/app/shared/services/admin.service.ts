import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  resetarDadosDemo(): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/admin/resetar-demo`, {});
  }
}
