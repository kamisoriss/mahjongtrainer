import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Themebutton } from './themebutton';

describe('Themebutton', () => {
  let component: Themebutton;
  let fixture: ComponentFixture<Themebutton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Themebutton],
    }).compileComponents();

    fixture = TestBed.createComponent(Themebutton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
