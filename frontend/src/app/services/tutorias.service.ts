// src/app/services/tutorias.service.ts
import { Injectable, Signal, signal } from '@angular/core';
import { Tutoria } from '../models/tutoria.model';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'tc_tutorias';
type AnyRow = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class TutoriasService {
  private _tutorias = signal<Tutoria[]>([]);
  private _loading  = signal<boolean>(false);
  private _error    = signal<string | null>(null);

  get tutorias(): Signal<Tutoria[]>     { return this._tutorias.asReadonly(); }
  get loading():  Signal<boolean>       { return this._loading.asReadonly(); }
  get error():    Signal<string | null> { return this._error.asReadonly(); }

  // Usa environment para facilidad en deploy
  private API = `${environment.apiUrl}/tutorias`;

  private authHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem('tc_token'); // 👈 MISMO nombre que en login
  const headers: Record<string, string> = { ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}


  private pick<T = any>(row: AnyRow, ...keys: string[]): T | '' {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k] as T;
    }
    return '' as T;
  }

  async loadFromApi(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const url = `${this.API}?_=${Date.now()}`; // fuerza recarga
      const res = await fetch(url, {
        cache: 'no-store',
         headers: this.authHeaders({
        'Accept': 'application/json'
      })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = (await res.json()) as AnyRow[];
      const parsed: Tutoria[] = raw.map((r) => {
        const id            = this.pick<number>(r, 'id');
        const materiaCodigo = this.pick<string>(r, 'materia_codigo', 'codigoMateria');
        const tutorNombre   = this.pick<string>(r, 'tutor', 'tutor_nombre');
        const titulo        = this.pick<string>(r, 'titulo');
        const descripcion   = this.pick<string>(r, 'descripcion');
        const aula          = this.pick<string>(r, 'aula');
        const modalidad     = this.pick<string>(r, 'modalidad') || 'PRESENCIAL';
        const cupoRaw       = this.pick<number | string>(r, 'cupo', 'cupo_maximo');
        const horaInicio    = this.pick<string>(r, 'horaInicio', 'hora_inicio');
        const horaFin       = this.pick<string>(r, 'horaFin', 'hora_fin');
        const horarioApi    = this.pick<string>(r, 'horario');
        const horario       = (horarioApi || `${horaInicio} – ${horaFin}`).trim();

        return {
          id: String(id),
          codigoMateria: materiaCodigo,
          tutorNombre,
          titulo,
          descripcion,
          horaInicio,
          horaFin,
          horario,
          aula,
          modalidad: (modalidad === 'PRESENCIAL' || modalidad === 'VIRTUAL') ? modalidad : 'PRESENCIAL',
          cupoMaximo: Number(cupoRaw ?? 0),
        };
      });

      this._tutorias.set(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (err: any) {
      this._error.set(err?.message ?? String(err));
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try { this._tutorias.set(JSON.parse(cached) as Tutoria[]); } catch {}
      } else {
        this._tutorias.set([]);
      }
    } finally {
      this._loading.set(false);
    }
  }

  // --- Métodos de uso local/offline ---
async add(data: Omit<Tutoria, 'id'>): Promise<void> {
  this._loading.set(true);
  this._error.set(null);

  try {
    const body = {
      codigo_materia: data.codigoMateria,
      tutor_nombre:   data.tutorNombre,
      titulo:         data.titulo,
      descripcion:    data.descripcion,
      modalidad:      data.modalidad,
      aula:           data.aula,
      cupo_maximo:    data.cupoMaximo,
      hora_inicio:    data.horaInicio,
      hora_fin:       data.horaFin,
      fecha: new Date().toISOString().slice(0, 10)
    };

    const res = await fetch(this.API, {
      method: 'POST',
      headers: this.authHeaders({
    'Content-Type': 'application/json'
  }),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      // 👇 Intentamos leer el JSON de error del backend
      let msg = `Error al crear la tutoría (HTTP ${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody?.error) msg = errBody.error;
      } catch (_) {}

      throw new Error(msg);
    }

    await this.loadFromApi();
  } catch (err: any) {
    console.error('[Tutorias] add error:', err);
    const msg = err?.message ?? 'No se pudo crear la tutoría.';
    this._error.set(msg);
    // opcional: alert para que se vea rápido
    alert(msg);
  } finally {
    this._loading.set(false);
  }
}


 async update(id: string, data: Omit<Tutoria, 'id'>): Promise<void> {
  this._loading.set(true);
  this._error.set(null);

  try {
    const body = {
      codigo_materia: data.codigoMateria,
      tutor_nombre:   data.tutorNombre,
      titulo:         data.titulo,
      descripcion:    data.descripcion,
      modalidad:      data.modalidad,
      aula:           data.aula,
      cupo_maximo:    data.cupoMaximo,
      hora_inicio:    data.horaInicio,
      hora_fin:       data.horaFin,
      // aquí no necesitamos fecha para update, la dejamos como está en la BD
    };

    const res = await fetch(`${this.API}/${id}`, {
      method: 'PUT',
      headers: this.authHeaders({
    'Content-Type': 'application/json'
  }),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let msg = `Error al actualizar la tutoría (HTTP ${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody?.error) msg = errBody.error;
      } catch {}
      throw new Error(msg);
    }

    await this.loadFromApi();
  } catch (err: any) {
    console.error('[Tutorias] update error:', err);
    const msg = err?.message ?? 'No se pudo actualizar la tutoría.';
    this._error.set(msg);
    alert(msg);
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
      headers: this.authHeaders()
    });

    if (!res.ok) {
      let msg = `Error al eliminar la tutoría (HTTP ${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody?.error) msg = errBody.error;
      } catch {}
      throw new Error(msg);
    }

    await this.loadFromApi();
  } catch (err: any) {
    console.error('[Tutorias] remove error:', err);
    const msg = err?.message ?? 'No se pudo eliminar la tutoría.';
    this._error.set(msg);
    alert(msg);
  } finally {
    this._loading.set(false);
  }
}
  getById(id: string) {
    return this._tutorias().find(t => t.id === id);
  }

  private save(list: Tutoria[]) {
    this._tutorias.set(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  private genId(): string {
    return `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
  }
}
