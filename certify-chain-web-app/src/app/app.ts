import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  templateUrl:  './app.html',
  imports: [RouterOutlet],

})
export class App{
  protected readonly title = signal('certify-chain-web-app');

}
