import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  imports: [
    NgOptimizedImage
  ],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {}
