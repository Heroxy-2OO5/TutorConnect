import { Injectable, signal } from '@angular/core';
import { Asistencia, EstadoAsistencia } from '../models/asistencia.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private _list = signal<Asistencia[]>([]);
  list = this._list.asReadonly();

  private API = `${environment.apiUrl}/asistencias`;

  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
    const token = localStorage.getItem('tc_token'); // 👈 o el nombre que uses

    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
  }

  async loadFromApi(params: { sesionId?: string; estudianteId?: string }): Promise<void> {
    try {
      const qs = new URLSearchParams();
      if (params.sesionId) qs.set('sesionId', params.sesionId);
      if (params.estudianteId) qs.set('estudianteId', params.estudianteId);

      const url = qs.toString() ? `${this.API}?${qs.toString()}` : this.API;

      const res = await fetch(url, {
        headers: this.authHeaders({ Accept: 'application/json' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      type ApiRow = {
        id: number;
        sesion_id: number;
        estudiante_id: string;
        estado: EstadoAsistencia;
        observacion: string | null;
      };

      const data = (await res.json()) as ApiRow[];

      const parsed: Asistencia[] = data.map((r) => ({
        id: String(r.id),
        sesionId: String(r.sesion_id),
        estudianteId: r.estudiante_id,
        estado: r.estado,
        observacion: r.observacion ?? null,
      }));

      this._list.set(parsed);
    } catch (err) {
      console.error('[AsistenciasService] loadFromApi error:', err);
      this._list.set([]);
      throw err;
    }
  }

  async marcar(
    sesionId: string,
    estudianteId: string,
    estado: EstadoAsistencia,
    observacion?: string | null
  ): Promise<'OK' | 'ERROR'> {
    try {
      const res = await fetch(this.API, {
        method: 'POST',
        headers: this.authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          sesionId,          // 👈 NOMBRE EXACTO
          estudianteId,      // 👈 NOMBRE EXACTO
          estado,
          observacion: observacion ?? null,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error('[AsistenciasService] marcar error:', errBody);
        return 'ERROR';
      }

      await this.loadFromApi({ sesionId });
      return 'OK';
    } catch (err) {
      console.error('[AsistenciasService] marcar error:', err);
      return 'ERROR';
    }
  }


  // =================== HELPERS ===================
  getDeEstudiante(sesionId: string, estudianteId: string): Asistencia | undefined {
    return this._list().find(
      (a) => a.sesionId === sesionId && a.estudianteId === estudianteId
    );
  }

  historialDeEstudiante(estudianteId: string): Asistencia[] {
    return this._list().filter((a) => a.estudianteId === estudianteId);
  }
}
