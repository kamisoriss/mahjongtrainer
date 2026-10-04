import { Component,inject } from '@angular/core';
import { Theme } from '../service/theme';

@Component({
  imports: [],
  selector: 'app-themebutton',
  styleUrl: './themebutton.css',
  templateUrl: './themebutton.html',
})
export class Themebutton {
  theme = inject(Theme);
}
