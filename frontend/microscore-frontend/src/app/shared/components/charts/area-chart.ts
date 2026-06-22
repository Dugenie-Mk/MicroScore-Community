import { Component, computed, input } from '@angular/core';

export interface AreaSeries {
  name: string;
  color: 'brand' | 'sky';
  values: number[];
}

interface RenderedSeries {
  name: string;
  linePath: string;
  areaPath: string;
  strokeClass: string;
  fillClass: string;
  lastX: number;
  lastY: number;
  dotClass: string;
}

@Component({
  selector: 'app-area-chart',
  imports: [],
  template: `
    <svg [attr.viewBox]="viewBox()" class="h-full w-full" preserveAspectRatio="none">
      @for (gy of gridLines(); track gy) {
        <line
          [attr.x1]="padX"
          [attr.x2]="width() - padX"
          [attr.y1]="gy"
          [attr.y2]="gy"
          class="stroke-gray-100 dark:stroke-gray-800"
          stroke-width="1"
        />
      }
      @for (s of series(); track s.name) {
        <path [attr.d]="s.areaPath" [class]="s.fillClass" fill-opacity="0.12" />
        <path [attr.d]="s.linePath" fill="none" [class]="s.strokeClass" stroke-width="2.5" />
      }
    </svg>
  `,
})
export class AreaChart {
  readonly data = input<AreaSeries[]>([]);

  protected readonly padX = 8;
  private readonly padTop = 14;
  private readonly baseY = 150;
  private readonly step = 52;

  protected readonly width = computed(() => {
    const n = Math.max(1, this.maxPoints());
    return (n - 1) * this.step + this.padX * 2;
  });

  protected readonly viewBox = computed(() => `0 0 ${this.width()} 160`);

  protected readonly gridLines = computed(() => {
    const lines: number[] = [];
    for (let i = 0; i <= 3; i++) {
      lines.push(this.padTop + ((this.baseY - this.padTop) / 3) * i);
    }
    return lines;
  });

  private maxPoints(): number {
    return Math.max(0, ...this.data().map((s) => s.values.length));
  }

  protected readonly series = computed<RenderedSeries[]>(() => {
    const all = this.data();
    const globalMax = Math.max(1, ...all.flatMap((s) => s.values));
    const n = this.maxPoints();

    return all.map((s) => {
      const points = s.values.map((v, i) => {
        const x = this.padX + (n > 1 ? (i / (n - 1)) * (this.width() - this.padX * 2) : 0);
        const y = this.baseY - (v / globalMax) * (this.baseY - this.padTop);
        return { x, y };
      });

      const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ');

      const first = points[0] ?? { x: this.padX, y: this.baseY };
      const last = points[points.length - 1] ?? first;
      const areaPath = `${linePath} L ${last.x.toFixed(1)} ${this.baseY} L ${first.x.toFixed(1)} ${this.baseY} Z`;

      return {
        name: s.name,
        linePath,
        areaPath,
        strokeClass: s.color === 'brand' ? 'stroke-brand-500' : 'stroke-sky-500',
        fillClass: s.color === 'brand' ? 'fill-brand-500' : 'fill-sky-500',
        dotClass: s.color === 'brand' ? 'fill-brand-500' : 'fill-sky-500',
        lastX: last.x,
        lastY: last.y,
      };
    });
  });
}
