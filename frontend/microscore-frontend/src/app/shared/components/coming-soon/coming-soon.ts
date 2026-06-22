import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  imports: [],
  templateUrl: './coming-soon.html',
})
export class ComingSoon {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = (this.route.snapshot.data['title'] as string) ?? 'Module';
  protected readonly description =
    (this.route.snapshot.data['description'] as string) ?? 'Cette section sera bientôt disponible.';
}
