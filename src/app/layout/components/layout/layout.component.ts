import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  user$!: Observable<AuthUser | null>;
  pendingChats = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

 ngOnInit() {
    // ✅ usa currentUser$ (com $)
    this.user$ = this.authService.currentUser$.pipe(
      switchMap((authUser: AuthUser | null) => {
        if (!authUser?.id) return of(null);
        // se precisar buscar detalhes no backend:
        return  this.userService.getUserById(authUser.id);
      })
    );
  }

  logout() {
    this.authService.logout();
    this.toastr.info('Você saiu do sistema', 'Logout');
    window.location.href = '/login';
  }
}
