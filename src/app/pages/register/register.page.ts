import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonInput, IonItem, IonLabel, IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ CommonModule,FormsModule,IonContent, IonHeader,IonToolbar, IonTitle, IonInput, IonItem, IonLabel, IonButton
  ]
})
export class RegisterPage {
  email = '';
  password = '';

  constructor(private router: Router) {}

  register() {
    if (!this.email || !this.password) {
      alert('Please enter email and password.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.find((u: any) => u.email === this.email);
    if (exists) {
      alert('Email is already registered.');
      return;
    }

    users.push({ email: this.email, password: this.password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully!');
    this.router.navigateByUrl('/login');
  }
}
