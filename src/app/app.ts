import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';
import { GlobalToastComponent } from './shared/components/global-toast/global-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent, GlobalToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
