import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MCR } from './mcr';

describe('MCR', () => {
  let component: MCR;
  let fixture: ComponentFixture<MCR>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MCR],
    }).compileComponents();

    fixture = TestBed.createComponent(MCR);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
