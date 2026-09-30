import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mentionlegal } from './mentionlegal';

describe('Mentionlegal', () => {
  let component: Mentionlegal;
  let fixture: ComponentFixture<Mentionlegal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mentionlegal],
    }).compileComponents();

    fixture = TestBed.createComponent(Mentionlegal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
