import { Component, computed, input } from '@angular/core';

export interface BarDatum {
  label: string;
  value: number;
}

interface Bar {
  x: number;
  trackY: number;
  trackH: number;
  barY: number;
  barH: number;
  width: number;
  label: string;
  centerX: number;
}

@Component({
  selector: 'app-bar-chart',
  imports: [],
  template: `
    <svg [attr.viewBox]="viewBox()" class="w-full" preserveAspectRatio="xMidYMid meet">
      @for (bar of bars(); track bar.label) {
        <rect
          [attr.x]="bar.x"
          [attr.y]="bar.trackY"
          [attr.width]="bar.width"
          [attr.height]="bar.trackH"
          rx="5"
          class="fill-gray-100 dark:fill-gray-800/70"
        />
        <rect
          [attr.x]="bar.x"
          [attr.y]="bar.barY"
          [attr.width]="bar.width"
          [attr.height]="bar.barH"
          rx="5"
          class="fill-brand-500 transition-all duration-500"
        />
        <text
          [attr.x]="bar.centerX"
          [attr.y]="190"
          text-anchor="middle"
          class="fill-gray-400 text-[10px] dark:fill-gray-500"
        >
          {{ bar.label }}
        </text>
      }
    </svg>
  `,
})
export class BarChart {
  readonly data = input<BarDatum[]>([]);

  private readonly slot = 48;
  private readonly barWidth = 24;
  private readonly top = 12;
  private readonly baseY = 170;

  protected readonly viewBox = computed(() => `0 0 ${this.data().length * this.slot} 200`);

  protected readonly bars = computed<Bar[]>(() => {
    const items = this.data();
    const max = Math.max(1, ...items.map((d) => d.value));
    const maxH = this.baseY - this.top;

    return items.map((d, i) => {
      const x = i * this.slot + (this.slot - this.barWidth) / 2;
      const barH = (d.value / max) * maxH;
      return {
        x,
        trackY: this.top,
        trackH: maxH,
        barY: this.baseY - barH,
        barH,
        width: this.barWidth,
        label: d.label,
        centerX: x + this.barWidth / 2,
      };
    });
  });
}
