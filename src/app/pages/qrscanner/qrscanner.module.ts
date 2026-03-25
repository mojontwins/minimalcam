import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QRScannerPageRoutingModule } from './qrscanner-routing.module';

import { QRScannerPage } from './qrscanner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRScannerPageRoutingModule
  ],
  declarations: [QRScannerPage]
})
export class QRScannerPageModule {}
