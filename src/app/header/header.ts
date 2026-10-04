import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import { Themebutton } from '../themebutton/themebutton';

@Component({
  imports: [NgOptimizedImage, Themebutton],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {}
