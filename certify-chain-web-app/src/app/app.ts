import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl:  './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('certify-chain-web-app');

  constructor(private primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
    }
}
