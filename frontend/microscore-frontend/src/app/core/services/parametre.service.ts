import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ParametreResponse {
  cle: string;
  valeur: string;
}

@Injectable({ providedIn: 'root' })
export class ParametreService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/parametres`;

  getValeur(cle: string): Observable<string | null> {
    return this.http.get<ParametreResponse>(`${this.apiUrl}/${cle}`).pipe(
      map((r) => r.valeur)
    );
  }

  setValeur(cle: string, valeur: string): Observable<ParametreResponse> {
    return this.http.put<ParametreResponse>(`${this.apiUrl}/${cle}`, { valeur });
  }
}
