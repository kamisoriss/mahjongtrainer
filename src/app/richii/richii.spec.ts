import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Richii } from './richii';

describe('Richii', () => {
  let component: Richii;
  let fixture: ComponentFixture<Richii>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Richii],
    }).compileComponents();

    fixture = TestBed.createComponent(Richii);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
