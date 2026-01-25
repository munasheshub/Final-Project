import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateCreate } from './certificate-create';

describe('CertificateCreate', () => {
  let component: CertificateCreate;
  let fixture: ComponentFixture<CertificateCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
