import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Router, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authenticationService.verifyCompte().subscribe({
      next: (response: any) => {
        this.authenticationService.setCurrentUser(response.account);
      },
      error: () => {
        this.router.navigate(['../../login']);
      },
    });
  }
}
