import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationCompteComponent } from './verification-compte.component';

describe('VerificationCompteComponent', () => {
  let component: VerificationCompteComponent;
  let fixture: ComponentFixture<VerificationCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
