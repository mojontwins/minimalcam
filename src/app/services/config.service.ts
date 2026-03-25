import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() {
    console.log('Hello ConfigService Service!');
  }

  static get Constants (): any {
    return { 
      version: '1.8.0',

      apiBaseUri: 'https://reservas.juntadeandalucia.es/Web/Services/',
      //apiBaseUri: 'https://reservas-pre.juntadeandalucia.es/Web/Services/',
      //apiBaseUri: 'http://10.226.164.75/Web/Services/',

      urlAyuda: 'https://ayuda-productividad.juntadeandalucia.es/aplicaciones/reserva-de-recursos/',
      urlSoporte: 'https://ayuda-productividad.juntadeandalucia.es/soporte/'
    }
  }

}
