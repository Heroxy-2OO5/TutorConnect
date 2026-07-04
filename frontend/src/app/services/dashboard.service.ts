// src/app/services/dashboard.service.ts
import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface DashboardStatsStudent {
  role: 'STUDENT';
  tutoriasInscritas: number;
  sesionesConAsistencia: number;
  asistenciaPorcentaje: number;
  horasTutoria: number;
}

export interface DashboardStatsTutor {
  role: 'TUTOR' | 'ADMIN';
  tutoriasActivas: number;
  estudiantesInscritos: number;
  sesionesMes: number;
  asistenciasRegistradas: number;
}

export type DashboardStatsResponse = DashboardStatsStudent | DashboardStatsTutor;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private API = 'http://localhost:3000/api/dashboard/stats';

  private _stats  = signal<DashboardStatsResponse | null>(null);
  private _loading = signal<boolean>(false);
  private _error   = signal<string | null>(null);

  get stats(): Signal<DashboardStatsResponse | null>  { return this._stats.asReadonly(); }
  get loading(): Signal<boolean>                      { return this._loading.asReadonly(); }
  get error(): Signal<string | null>                  { return this._error.asReadonly(); }

  constructor(private http: HttpClient) {}

  loadStats(): void {
    this._loading.set(true);
    this._error.set(null);

    // 👇 lee el token que guardaste en login
    const token = localStorage.getItem('tc_token'); // cambia el nombre si usas otro
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    this.http.get<DashboardStatsResponse>(this.API, { headers }).subscribe({
      next: (res) => {
        this._stats.set(res);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[DashboardService] error:', err);
        this._error.set('No se pudieron cargar las estadísticas');
        this._loading.set(false);
      },
    });
  }
}
