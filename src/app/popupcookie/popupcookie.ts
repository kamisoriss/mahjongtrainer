import { Component, inject } from '@angular/core';
import { Cookie } from '../service/cookie';

@Component({
  imports: [],
  selector: 'app-popupcookie',
  styleUrl: './popupcookie.css',
  templateUrl: './popupcookie.html',
})
export class Popupcookie {
  public cookieService = inject(Cookie);
}
