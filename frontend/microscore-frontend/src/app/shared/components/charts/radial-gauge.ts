import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-radial-gauge',
  imports: [],
  template: `
    <div class="relative mx-auto w-full max-w-[260px]">
      <svg viewBox="0 0 200 120" class="w-full">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          class="stroke-gray-100 dark:stroke-gray-800"
          stroke-width="18"
          stroke-linecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          class="stroke-brand-500 transition-all duration-700 ease-out"
          stroke-width="18"
          stroke-linecap="round"
          [attr.stroke-dasharray]="arcLength"
          [attr.stroke-dashoffset]="dashOffset()"
        />
      </svg>
      <div class="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ value() }}%</span>
      </div>
    </div>
  `,
})
export class RadialGauge {
  readonly value = input(0);

  protected readonly arcLength = Math.PI * 80;
  protected readonly dashOffset = computed(
    () => this.arcLength * (1 - Math.min(100, Math.max(0, this.value())) / 100),
  );
}
