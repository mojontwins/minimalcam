import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { Barcode, BarcodeScanner, ScanResult, BarcodeFormat, BarcodeValueType } from '@capacitor-mlkit/barcode-scanning';

import { ReservasServiceService } from '../../services/reservas-service.service';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.page.html',
  styleUrls: ['./qrscanner.page.scss'],
})
export class QRScannerPage implements OnInit {
  private curDate: Date = new Date();
  barcodes: string[] = [];
  
  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public router: Router,
    public loadingCtrl: LoadingController,
    private reservasService: ReservasServiceService    
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrScannerPage');    
  }

  ionViewDidEnter () {
    this.curDate = new Date();
    this.scanQR();
    //this.autoredirectTest();
  }

  ionViewWillLeave() {
    console.log ("Will Leave QR Scanner");
    
    this.stopScan().then (() => {
      try {
        this.alertCtrl.dismiss();
      } catch(e) {}
      try {
        this.modalCtrl.dismiss();
      } catch(e) {}
      try {
        this.loadingCtrl.dismiss();
      } catch(e) {}
    });
  }

  autoredirectTest() {   
    this.router.navigateByUrl('nueva-reserva/' + 403);
  }

  async errorAlert(logString: string, header: string, message: string) {
    console.log(logString);

    let alert = await this.alertCtrl.create ({
      header: header,
      message: message,
      buttons: ['Cerrar']
    })

    await alert.present();
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

  setNeedRefresh() {
    //
  }

  //const scanSingleBarcode = async () => 

  async scanSingleBarcode() {
    return new Promise<Barcode> (async resolve => {
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      const listener = await BarcodeScanner.addListener(
        'barcodesScanned',
        async result => {
          await listener.remove();
          document
            .querySelector('body')?.classList.remove('barcode-scanner-active');
          await BarcodeScanner.stopScan();
          resolve(result.barcodes[0]);
        },
      );

      await BarcodeScanner.startScan();
    });
  };

  async scanSingleBarcodeEmulation() {
    return new Promise<Barcode> (async resolve => {
      let barcode: Barcode = {
        displayValue: "{\"id\": 403, \"dt\": \"PRINTED\"}",
        format: BarcodeFormat.QrCode,
        rawValue: "{\"id\": 403, \"dt\": \"PRINTED\"}",
        valueType: BarcodeValueType.Text
      };
      resolve(barcode);
    })
  }

  async stopScan() {
    // Make all elements in the WebView visible again
    document.querySelector('body')?.classList.remove('barcode-scanner-active');

    // Remove all listeners
    await BarcodeScanner.removeAllListeners();

    // Stop the barcode scanner
    await BarcodeScanner.stopScan();
  };

  async scanQR () {    
    const granted = await this.requestPermissions();
    if(!granted) {
      this.errorAlert("Camera permission denied", "No hay permisos", "Por favor, permita el uso de la cámara para poder escanear");
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    }

    var result: string = "";

    this.scanSingleBarcode().then(
      (scanresult: Barcode) => {
        
        result = scanresult.displayValue;
        console.log ("Scanned this: " + result);

        this.showloading().then (
          () => {
          

        
          }
        );
      }
    );

    console.log(result);

  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      return camera === 'granted' || camera === 'limited';
    } catch (e) {
      return true;
    }
  }

  getMinusGreenwhich () {
    let weeDate: Date = new Date ();
    let h: String = "" + Math.floor (Math.abs (weeDate.getTimezoneOffset ()) / 60);
    let m: String = "" + (Math.abs (weeDate.getTimezoneOffset ()) % 60);
    if (h.length == 1) h = "0" + h;
    if (m.length == 1) m = "0" + m;
    if (weeDate.getTimezoneOffset () < 0) return "+" + h + m; else return "-" + h + m;
  }

  toProperIsoString(date: Date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num: number) {
            return (num < 10 ? '0' : '') + num;
        };

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
  }

  ngOnInit() {

  }

}
