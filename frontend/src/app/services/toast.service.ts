import { Injectable, signal } from '@angular/core';

export type ToastType = 'success'|'info'|'warning'|'danger';
export interface Toast { id: number; type: ToastType; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();
  private id = 1;

  show(text: string, type: ToastType = 'success') {
    const t: Toast = { id: this.id++, type, text };
    this._toasts.set([t, ...this._toasts()]);
    setTimeout(() => this.close(t.id), 3000);
  }

  close(id: number) {
    this._toasts.set(this._toasts().filter(t => t.id !== id));
  }
}
