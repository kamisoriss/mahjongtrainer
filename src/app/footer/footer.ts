import { Component } from '@angular/core';
import {Legalbar} from '../legalbar/legalbar';

@Component({
  imports: [
    Legalbar
  ],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {}
