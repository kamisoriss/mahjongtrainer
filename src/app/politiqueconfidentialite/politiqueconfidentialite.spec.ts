import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Politiqueconfidentialite } from './politiqueconfidentialite';

describe('Politiqueconfidentialite', () => {
  let component: Politiqueconfidentialite;
  let fixture: ComponentFixture<Politiqueconfidentialite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Politiqueconfidentialite],
    }).compileComponents();

    fixture = TestBed.createComponent(Politiqueconfidentialite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
