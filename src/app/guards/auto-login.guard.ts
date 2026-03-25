import { Injectable } from '@angular/core';
import { LoadingController} from '@ionic/angular'
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

import { ReservasServiceService } from '../services/reservas-service.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanLoad {
  constructor(
    private reservasServiceProvider: ReservasServiceService,
    private router: Router,
    public loadingCtrl: LoadingController,
    public storage: Storage,  
  ) {    
  }

  canLoad(): Observable <boolean> {
    console.log ("Looking for stored credentials");
    
    return Observable.create ((observer: Observer<boolean>) => {
      this.storage.get ('credentials').then(data => {
        if(data) {          
                    
          this.reservasServiceProvider.login (data).subscribe (allowed => {
            if (allowed) {
              console.log ("Found credentials -> auto login");
              
              this.router.navigateByUrl('/tabs', { replaceUrl: true });
              observer.next(false);
            } else {
              observer.next(true);
            }
          }, (err) => {
            console.log(err)
          });

        } else {
          observer.next(true);
        }
      });
    });
  }

  async showloading() {
    const loading = await this.loadingCtrl.create (
      {
        message: "Comprobando...",
        backdropDismiss: true
      }
    );
    await loading.present ();
  }

}
