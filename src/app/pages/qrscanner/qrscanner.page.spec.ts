import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QRScannerPage } from './qrscanner.page';

describe('QRScannerPage', () => {
  let component: QRScannerPage;
  let fixture: ComponentFixture<QRScannerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QRScannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
