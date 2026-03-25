import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';

import myLocaleEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';
import { LOCALE_ID} from '@angular/core';

registerLocaleData(myLocaleEs);

@NgModule({
  declarations: [AppComponent],
  imports: [
  	BrowserModule, 
  	IonicModule.forRoot(), 
  	AppRoutingModule, 
  	HttpClientModule,
  	IonicStorageModule.forRoot()
  ],
  providers: [
  	{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    { provide: LOCALE_ID, useValue: 'es' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {

  constructor(
    public storage: Storage
  ) {
    this.storage.create();
  }

}
