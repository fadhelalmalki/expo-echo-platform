import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4 safe-top">
      @for (toast of toasts.toasts(); track toast.id) {
        <button
          (click)="toasts.dismiss(toast.id)"
          class="pointer-events-auto animate-slide-up w-full max-w-md rounded-2xl px-4 py-3 text-start text-sm font-semibold text-white shadow-lg"
          [class]="
            toast.kind === 'error'
              ? 'bg-expo-red'
              : toast.kind === 'info'
                ? 'bg-expo-purple'
                : 'bg-expo-green'
          "
        >
          {{ toast.message }}
        </button>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);
}
