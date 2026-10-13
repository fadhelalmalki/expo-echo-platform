import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from './core/profile.service';

const profileGuard = () => {
  const profile = inject(ProfileService);
  const router = inject(Router);
  if (profile.visitorId) {
    return true;
  }
  return router.createUrlTree(['/onboarding']);
};

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: '',
    canActivate: [profileGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'feed' },
      {
        path: 'feed',
        loadComponent: () => import('./features/feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map.component').then((m) => m.MapComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/bookings.component').then((m) => m.BookingsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'events/:id',
        loadComponent: () =>
          import('./features/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
