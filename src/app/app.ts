import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Navbar} from './navbar/navbar';
import {Header} from './header/header';
import {Legalbar} from './legalbar/legalbar';
import {Acceuil} from './acceuil/acceuil';
import {Footer} from './footer/footer';
import { Popupcookie } from './popupcookie/popupcookie';

@Component({
  imports: [RouterOutlet, Navbar, Header, Footer, Popupcookie],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mahjongtrainer');
}
