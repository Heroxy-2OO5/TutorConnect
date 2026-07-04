// src/app/services/observaciones.service.ts
import { Injectable, signal } from '@angular/core';
import { Observacion, TipoObs } from '../models/observacion.model';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'tc_observaciones';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private _lista = signal<Observacion[]>(this.load());
  lista = this._lista.asReadonly();

  private API = `${environment.apiUrl}/observaciones`;

  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
    const token = localStorage.getItem('tc_token');
    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private load(): Observacion[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Observacion[]) : [];
  }

  async loadFromApi({ tutoriaId, sesionId, estudianteId }: { tutoriaId?: string; sesionId?: string; estudianteId?: string }): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (tutoriaId) params.append('tutoriaId', tutoriaId);
      if (sesionId) params.append('sesionId', sesionId);
      if (estudianteId) params.append('estudianteId', estudianteId); // aquí es EMAIL

      const url = params.toString() ? `${this.API}?${params}` : this.API;

      const res = await fetch(url, {
        headers: this.authHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // OJO: el backend devuelve estudiante_email y autor_email
      const parsed: Observacion[] = data.map((o: any) => ({
        id: String(o.id),
        tutoriaId: String(o.tutoria_id),
        sesionId: o.sesion_id ? String(o.sesion_id) : undefined,
        estudianteId: o.estudiante_email,      // ✅
        autorId: o.autor_email,                // ✅ (o puedes ignorarlo)
        fecha: o.fecha,
        tipo: o.tipo as TipoObs,
        texto: o.texto,
        pendiente: o.pendiente,
        calificacion: o.calificacion ?? undefined,
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      this._lista.set(parsed);
    } catch (err) {
      console.error('[ObservacionesService] loadFromApi error:', err);
    }
  }

  listByTutoria(tutoriaId: string) { return this._lista().filter(o => o.tutoriaId === tutoriaId); }
  listBySesion(sesionId: string) { return this._lista().filter(o => o.sesionId === sesionId); }
  listByEstudiante(estudianteId: string) { return this._lista().filter(o => o.estudianteId === estudianteId); }

  async add(payload: Omit<Observacion, 'id' | 'fecha' | 'autorId'>): Promise<void> {
    const body = {
      tutoriaId: payload.tutoriaId,
      sesionId: payload.sesionId || null,
      estudianteId: payload.estudianteId, // EMAIL
      tipo: payload.tipo,
      texto: payload.texto,
      pendiente: !!payload.pendiente,
      calificacion: payload.calificacion ?? null
    };

    const res = await fetch(this.API, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    await this.loadFromApi({ tutoriaId: payload.tutoriaId });
  }

  async update(id: string, patch: Partial<Omit<Observacion, 'id' | 'autorId'>>): Promise<void> {
    const res = await fetch(`${this.API}/${id}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const obs = this._lista().find(o => o.id === id);
    if (obs) await this.loadFromApi({ tutoriaId: obs.tutoriaId });
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.API}/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const obs = this._lista().find(o => o.id === id);
    if (obs) await this.loadFromApi({ tutoriaId: obs.tutoriaId });
  }

  async togglePendiente(id: string): Promise<void> {
    const res = await fetch(`${this.API}/${id}/toggle-pendiente`, {
      method: 'PATCH',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const obs = this._lista().find(o => o.id === id);
    if (obs) await this.loadFromApi({ tutoriaId: obs.tutoriaId });
  }
}
