import { Injectable, signal, Signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';

type LoginResult = { ok: true; user: User } | { ok: false; msg: string };
type RegisterPayload = { firstName: string; lastName: string; email: string; role: UserRole; password: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:3000/api/auth';

  private _currentUser = signal<User | null>(null);
  get currentUser(): Signal<User | null> { return this._currentUser.asReadonly(); }

  constructor() {
    // intenta hidratar sesión si hay token
    this.restoreSession().catch(() => {});
  }

  // ---------- helpers de sesión ----------
  private saveToken(token: string) { localStorage.setItem('tc_token', token); }
  private getToken(): string | null { return localStorage.getItem('tc_token'); }
  private clearToken() { localStorage.removeItem('tc_token'); }

  private authHeaders(): HeadersInit {
    const t = this.getToken();
    // devolver SIEMPRE un Record<string, string>
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  private async restoreSession() {
    const token = this.getToken();
    if (!token) return;
    try {
      const res = await fetch(`${this.API}/me`, { headers: this.authHeaders() });
      if (!res.ok) throw new Error('No session');
      const user = (await res.json()) as User;
      this._currentUser.set(user);
    } catch {
      this.clearToken();
      this._currentUser.set(null);
    }
  }

  async getTutors(): Promise<User[]> {
    const res = await fetch(`${this.API}/tutors`, {
      headers: {
        'Accept': 'application/json',
        ...this.authHeaders(),
      }
    });

    if (!res.ok) {
      throw new Error(`Error al cargar tutores (HTTP ${res.status})`);
    }

    const data = await res.json() as User[];
    return data;
  }

  // ---------- API ----------
  async register(payload: RegisterPayload): Promise<LoginResult> {
    try {
      const res = await fetch(`${this.API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error en registro.' }));
        return { ok: false, msg: error ?? 'Error en registro.' };
      }
      const data = await res.json() as { token: string; user: User };
      this.saveToken(data.token);
      this._currentUser.set(data.user);
      return { ok: true, user: data.user };
    } catch (e: any) {
      return { ok: false, msg: e?.message ?? 'Error de red' };
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const res = await fetch(`${this.API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Credenciales inválidas.' }));
        return { ok: false, msg: error ?? 'Credenciales inválidas.' };
      }
      const data = await res.json() as { token: string; user: User };
      this.saveToken(data.token);
      this._currentUser.set(data.user);
      return { ok: true, user: data.user };
    } catch (e: any) {
      return { ok: false, msg: e?.message ?? 'Error de red' };
    }
  }

  logout() {
    this.clearToken();
    this._currentUser.set(null);
  }

   async refreshMe(): Promise<void> {
    await this.restoreSession();
  }

  isAuthenticated(): boolean {
    return !!this._currentUser();
  }
}
