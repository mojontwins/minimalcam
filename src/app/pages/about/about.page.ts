import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  version: number;

  constructor(
  ) {
    this.version = ConfigService.Constants.version;
  }

  ngOnInit() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

  openAyuda() {
    this.openBrowser(ConfigService.Constants.urlAyuda);
  }

  openSoporte() {
    this.openBrowser(ConfigService.Constants.urlSoporte);
  }

  async openBrowser(url: string) {
    await Browser.open({'url': url});
  }

}
