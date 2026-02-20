import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { rolePermissions } from '../../roles';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: true,
})
export class SidebarComponent implements OnInit {
  public showSubLinks: boolean = false;
  public showCompteLinks: boolean = false;
  public showEntreeLinks: boolean = false;
  public showSortieLinks: boolean = false;

  public currentRoute = 'articles';

  public currentPermissions = [];

  public currentUser = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthenticationService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        console.log(event.url);

        this.currentRoute = event.url;
      });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;

        const roles = rolePermissions[user?.role];
        this.currentPermissions = roles;
      },
    });
  }

  public toggleSubLinks() {
    this.showSubLinks = !this.showSubLinks;
  }

  public toggleCompteLinks() {
    this.showCompteLinks = !this.showCompteLinks;
  }

  public toggleEntreeLinks() {
    this.showEntreeLinks = !this.showEntreeLinks;
  }

  public toggleSortieLinks() {
    this.showSortieLinks = !this.showSortieLinks;
  }

  public logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['../../login']);
      },
    });
  }
}
