import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'battle',
    loadComponent: () => import('./pages/battle/battle.page').then( m => m.BattlePage)
  },  {
    path: 'solo',
    loadComponent: () => import('./pages/solo/solo.page').then( m => m.SoloPage)
  },

];
