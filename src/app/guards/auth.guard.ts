import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, Observer } from 'rxjs';

import { ReservasServiceService } from '../services/reservas-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(
    private reservasServiceProvider: ReservasServiceService,
    private router: Router
  ) {
  }

  canLoad(): Observable <boolean> {
    console.log ("authGuard ?");

    return Observable.create ((observer: Observer<boolean>) => {
      if (this.reservasServiceProvider.sessionToken !== '' && this.reservasServiceProvider.credentials != null) {
        
        observer.next(true);
      } else {
        this.router.navigateByUrl('/login');
        observer.next(false);
      }
    });
  }
}
