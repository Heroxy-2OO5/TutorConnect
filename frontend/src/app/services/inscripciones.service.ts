// src/app/services/inscripciones.service.ts
import { Injectable, signal } from '@angular/core';
import { Inscripcion } from '../models/inscripcion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InscripcionesService {
  private _lista = signal<Inscripcion[]>([]);
  lista = this._lista.asReadonly();

  private API = `${environment.apiUrl}/inscripciones`;

  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('tc_token'); // 👈 debe coincidir con tu AuthService
  const headers: Record<string, string> = { ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

  // ========== LISTAR (GET) ==========
  async loadFromApi(opts?: { tutoriaId?: string; estudianteEmail?: string }) {
    try {
      const qs = new URLSearchParams();
      if (opts?.tutoriaId) qs.set('tutoriaId', opts.tutoriaId);
      if (opts?.estudianteEmail) qs.set('estudianteEmail', opts.estudianteEmail);

      const url = qs.toString() ? `${this.API}?${qs.toString()}` : this.API;
      const res = await fetch(url, { headers: this.authHeaders({ 'Accept': 'application/json' }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      type ApiInscripcion = {
        id: number;
        tutoria_id: number;
        estudiante_email: string;
        estado: 'ACTIVA' | 'CANCELADA';
        created_at: string;
      };

      const data = await res.json() as ApiInscripcion[];
      const parsed: Inscripcion[] = data.map(i => ({
        id: String(i.id),
        tutoriaId: String(i.tutoria_id),
        estudianteId: i.estudiante_email,
        creadoEn: i.created_at,
        estado: i.estado,
      }));

      this._lista.set(parsed);     // 👈 solo memoria, nada de localStorage
    } catch (err) {
      console.error('[InscripcionesService] loadFromApi error:', err);
      this._lista.set([]);         // ante error dejamos lista vacía
      throw err;
    }
  }

  // ========== INSCRIBIR (POST) ==========
async inscribir(tutoriaId: string, estudianteId: string): Promise<'OK' | 'DUPLICADO' | 'ERROR'> {
  if (this.estaInscrito(tutoriaId, estudianteId)) return 'DUPLICADO';

  try {
    const res = await fetch(this.API, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        tutoriaId,
        estudianteEmail: estudianteId,
        estado: 'ACTIVA'
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('[InscripcionesService] inscribir error:', errData);
      return 'ERROR';
    }

    // ⬅️ IMPORTANTE: recargar TODAS las inscripciones
    await this.loadFromApi();
    return 'OK';
  } catch (err) {
    console.error('[InscripcionesService] inscribir error:', err);
    return 'ERROR';
  }
}


  // ========== CANCELAR (PUT o DELETE) ==========
async cancelar(tutoriaId: string, estudianteId: string): Promise<'OK' | 'ERROR'> {
  try {
    const inscripcion = this._lista().find(
      i => i.tutoriaId === tutoriaId && i.estudianteId === estudianteId && i.estado === 'ACTIVA'
    );
    if (!inscripcion) return 'ERROR';

    const res = await fetch(`${this.API}/${inscripcion.id}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ estado: 'CANCELADA' })
    });

    if (!res.ok) {
      console.error('[InscripcionesService] cancelar error:', res.status);
      return 'ERROR';
    }

    // ⬅️ Recargar TODAS
    await this.loadFromApi();
    return 'OK';
  } catch (err) {
    console.error('[InscripcionesService] cancelar error:', err);
    return 'ERROR';
  }
}


async cancelarPorId(id: string): Promise<'OK' | 'ERROR'> {
  try {
    const res = await fetch(`${this.API}/${id}`, {
      method: 'PUT',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ estado: 'CANCELADA' })
    });

    if (!res.ok) {
      console.error('[InscripcionesService] cancelarPorId error:', res.status);
      return 'ERROR';
    }

    // ⬅️ Recargar TODAS
    await this.loadFromApi();
    return 'OK';
  } catch (err) {
    console.error('[InscripcionesService] cancelarPorId error:', err);
    return 'ERROR';
  }
}


  // ========== HELPERS LOCALES (para UI) ==========
  countActivas(tutoriaId: string) {
    return this._lista().filter(i => String(i.tutoriaId) === String(tutoriaId) && i.estado === 'ACTIVA').length;
  }

  estaInscrito(tutoriaId: string, estudianteId: string) {
    return this._lista().some(
      i => String(i.tutoriaId) === String(tutoriaId) &&
           i.estudianteId === estudianteId &&
           i.estado === 'ACTIVA'
    );
  }

  getByTutoria(tutoriaId: string) {
    return this._lista().filter(
      i => String(i.tutoriaId) === String(tutoriaId) && i.estado === 'ACTIVA'
    );
  }

  getByEstudiante(estudianteId: string) {
    return this._lista().filter(
      i => i.estudianteId === estudianteId && i.estado === 'ACTIVA'
    );
  }
}
