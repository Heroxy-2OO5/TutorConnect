// materias.service.ts
import { Injectable, signal, Signal } from '@angular/core';
import { Materia } from '../models/materia.model';

@Injectable({ providedIn: 'root' })
export class MateriasService {
  private _materias = signal<Materia[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  get materias(): Signal<Materia[]> { return this._materias.asReadonly(); }
  get loading(): Signal<boolean> { return this._loading.asReadonly(); }
  get error(): Signal<string | null> { return this._error.asReadonly(); }

  private API = 'http://localhost:3000/api/materias';

  // ✅ helper para headers con JWT
  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
    const token = localStorage.getItem('tc_token'); // 👈 OJO: que coincida con tu AuthService
    const headers: Record<string, string> = { ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async loadFromApi(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const res = await fetch(this.API, {
        headers: this.authHeaders(), // ✅ ahora manda token
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json() as Materia[];
      const parsed = data.map(m => ({
        id: String(m.id),
        codigo: String(m.codigo),
        nombre: String(m.nombre),
        semestre: Number(m.semestre),
        descripcion: String(m.descripcion ?? '')
      }));

      this._materias.set(parsed);
    } catch (err: any) {
      console.error('[Materias] loadFromApi error:', err);
      this._error.set('No se pudo cargar el listado de materias.');
    } finally {
      this._loading.set(false);
    }
  }

  async add(payload: Omit<Materia, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const res = await fetch(this.API, {
        method: 'POST',
        headers: this.authHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await this.loadFromApi();
    } catch (err: any) {
      console.error('[Materias] add error:', err);
      this._error.set('No se pudo crear la materia.');
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, payload: Omit<Materia, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const res = await fetch(`${this.API}/${id}`, {
        method: 'PUT',
        headers: this.authHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await this.loadFromApi();
    } catch (err: any) {
      console.error('[Materias] update error:', err);
      this._error.set('No se pudo actualizar la materia.');
    } finally {
      this._loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const res = await fetch(`${this.API}/${id}`, {
        method: 'DELETE',
        headers: this.authHeaders(), // ✅ token también aquí
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await this.loadFromApi();
    } catch (err: any) {
      console.error('[Materias] delete error:', err);
      this._error.set('No se pudo eliminar la materia.');
    } finally {
      this._loading.set(false);
    }
  }
}
