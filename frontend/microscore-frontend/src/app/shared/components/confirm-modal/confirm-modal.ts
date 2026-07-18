import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface PromptOptions extends ConfirmOptions {
  promptLabel: string;
  promptPlaceholder?: string;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" (click)="cancel()">
        <div class="w-full max-w-sm rounded-2xl border shadow-2xl p-5"
          [class.border-gray-200]="type() !== 'danger'"
          [class.bg-white]="type() !== 'danger'"
          [class.dark:border-gray-700]="type() !== 'danger'"
          [class.dark:bg-gray-900]="type() !== 'danger'"
          [class.border-red-200]="type() === 'danger'"
          [class.bg-red-50]="type() === 'danger'"
          [class.dark:border-red-900/40]="type() === 'danger'"
          [class.dark:bg-red-950/20]="type() === 'danger'"
          (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              [class.bg-red-100.text-red-600]="type() === 'danger'"
              [class.bg-amber-100.text-amber-600]="type() === 'warning'"
              [class.bg-blue-100.text-blue-600]="type() === 'info'">
              @if (type() === 'danger') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              } @else if (type() === 'warning') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              }
            </span>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ title() }}</h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ message() }}</p>
              @if (promptLabel()) {
                <label class="mt-3 block text-xs font-medium text-gray-700 dark:text-gray-300">{{ promptLabel() }}</label>
                <input #promptInput
                  type="text"
                  [(ngModel)]="inputValue"
                  [placeholder]="promptPlaceholder()"
                  class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400">
              }
            </div>
          </div>
          <div class="mt-5 flex items-center justify-end gap-2">
            <button (click)="cancel()"
              class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              {{ cancelLabel() }}
            </button>
            <button (click)="confirm()"
              class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95"
              [class.bg-red-600.hover:bg-red-700]="type() === 'danger'"
              [class.bg-amber-600.hover:bg-amber-700]="type() === 'warning'"
              [class.bg-brand-600.hover:bg-brand-700]="type() === 'info'">
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly isOpen = signal(false);
  readonly title = signal('');
  readonly message = signal('');
  readonly confirmLabel = signal('Confirmer');
  readonly cancelLabel = signal('Annuler');
  readonly type = signal<'danger' | 'warning' | 'info'>('danger');
  readonly promptLabel = signal('');
  readonly promptPlaceholder = signal('');
  protected inputValue = '';

  private resolveFn: ((value: boolean | string | null) => void) | null = null;

  open(opts: ConfirmOptions | PromptOptions): Promise<boolean | string | null> {
    this.title.set(opts.title);
    this.message.set(opts.message);
    this.confirmLabel.set(opts.confirmLabel ?? 'Confirmer');
    this.cancelLabel.set(opts.cancelLabel ?? 'Annuler');
    this.type.set(opts.type ?? 'danger');
    this.inputValue = '';
    if ('promptLabel' in opts) {
      this.promptLabel.set(opts.promptLabel);
      this.promptPlaceholder.set((opts as PromptOptions).promptPlaceholder ?? '');
    } else {
      this.promptLabel.set('');
      this.promptPlaceholder.set('');
    }
    this.isOpen.set(true);
    return new Promise((resolve) => { this.resolveFn = resolve; });
  }

  confirm(): void {
    this.isOpen.set(false);
    if (this.promptLabel()) {
      this.resolveFn?.(this.inputValue.trim() || null);
    } else {
      this.resolveFn?.(true);
    }
    this.resolveFn = null;
  }

  cancel(): void {
    this.isOpen.set(false);
    this.resolveFn?.(false);
    this.resolveFn = null;
  }
}
