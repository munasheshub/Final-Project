import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  
  selector: 'app-footer',
  imports: [CommonModule],
  template: `
    <footer class="layout-footer">
      <span>&copy; {{ currentYear }} CertChain. Powered by </span>
      <a href="https://primeng.org" target="_blank" rel="noopener noreferrer">PrimeNG</a>
      <span> &bull; All rights reserved.</span>
    </footer>
  `
})
export class AppFooter {
  currentYear = new Date().getFullYear();
}