import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(message: string, type: ToastMessage['type'] = 'info', duration = 4000): void {
    const id = this.nextId++;
    this.messages.update((m) => [...m, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void {
    this.messages.update((m) => m.filter((x) => x.id !== id));
  }
}
