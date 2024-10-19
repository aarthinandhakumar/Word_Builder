import { Component } from '@angular/core';
import { MainComponent } from './main/main.component'; // Ensure the path is correct

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, // Optional for AppComponent
  imports: [MainComponent] // Import MainComponent here
})
export class AppComponent {
  title = 'your-app-title'; // Your existing code...
}
