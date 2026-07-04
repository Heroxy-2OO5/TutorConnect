// src/app/services/sesiones.service.ts
import { Injectable, Signal, signal } from '@angular/core';
import { Sesion } from '../models/sesion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SesionesService {
  private API = `${environment.apiUrl}/sesiones`;

  private _list = signal<Sesion[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  get list(): Signal<Sesion[]> { return this._list.asReadonly(); }
  get loading(): Signal<boolean> { return this._loading.asReadonly(); }
  get error(): Signal<string | null> { return this._error.asReadonly(); }

  // 🔐 Igual que en AsistenciasService
  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
    const token = localStorage.getItem('tc_token'); // mismo nombre que usas arriba
    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async loadFromApi(tutoriaId?: string | null): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      let url = this.API;
      if (tutoriaId) {
        url += `?tutoriaId=${encodeURIComponent(tutoriaId)}`;
      }

      const res = await fetch(url, {
        headers: this.authHeaders({ Accept: 'application/json' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json() as any[];

      const parsed: Sesion[] = data.map(s => ({
        id: String(s.id),
        tutoriaId: String(s.tutoria_id),
        fecha: typeof s.fecha === 'string' ? s.fecha.split('T')[0] : s.fecha,
        inicio: s.inicio,
        fin: s.fin,
        aula: s.aula ?? '',
      }));

      this._list.set(parsed);
    } catch (err: any) {
      console.error('[Sesiones] loadFromApi error:', err);
      this._error.set('No se pudieron cargar las sesiones.');
    } finally {
      this._loading.set(false);
    }
  }

  async create(
    payload: { tutoriaId: string; fecha: string; inicio: string; fin: string; aula: string },
    _creadoPorEmail: string
  ): Promise<'OK' | 'ERROR'> {
    this._error.set(null);

    try {
      const res = await fetch(this.API, {
        method: 'POST',
        headers: this.authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          tutoriaId: payload.tutoriaId,
          fecha: payload.fecha,
          inicio: payload.inicio,
          fin: payload.fin,
          aula: payload.aula,
        }),
        // ❌ SIN credentials: 'include'
      });

      if (!res.ok) {
        console.error('[Sesiones] create error HTTP:', res.status);
        return 'ERROR';
      }

      // recargamos las sesiones de esa tutoría
      await this.loadFromApi(payload.tutoriaId);
      return 'OK';
    } catch (err: any) {
      console.error('[Sesiones] create error:', err);
      this._error.set('No se pudo crear la sesión.');
      return 'ERROR';
    }
  }

  async remove(id: string): Promise<'OK' | 'ERROR'> {
    this._error.set(null);
    try {
      const res = await fetch(`${this.API}/${id}`, {
        method: 'DELETE',
        headers: this.authHeaders({ 'Content-Type': 'application/json' }),
        // ❌ También SIN credentials
      });

      if (!res.ok) {
        console.error('[Sesiones] remove error HTTP:', res.status);
        return 'ERROR';
      }

      return 'OK';
    } catch (err: any) {
      console.error('[Sesiones] remove error:', err);
      this._error.set('No se pudo eliminar la sesión.');
      return 'ERROR';
    }
  }
}
