import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Popupcookie } from './popupcookie';

describe('Popupcookie', () => {
  let component: Popupcookie;
  let fixture: ComponentFixture<Popupcookie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Popupcookie],
    }).compileComponents();

    fixture = TestBed.createComponent(Popupcookie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
