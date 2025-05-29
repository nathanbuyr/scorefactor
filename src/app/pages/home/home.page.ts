import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { IonHeader, IonToolbar, IonButton,IonIcon,IonTitle,IonButtons,IonContent,IonFooter} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { football, fitness, people, trophy, personOutline, barChart} from 'ionicons/icons'; 
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonButtons, IonContent, IonFooter]
})
export class HomePage implements OnInit {
  isConnected: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { 

    addIcons({football, fitness, people, trophy, personOutline, barChart });
  }

  ngOnInit() {
    // Check connection status on load
    this.checkDeviceConnection();
  }

  toggleConnection() {
    if (this.isConnected) {
      this.disconnectDevice();
    } else {
      this.connectDevice();
    }
  }

  connectDevice() {
    // Implement ESP32 connection logic here
    console.log('Attempting to connect to ESP32...');
    // Simulate connection
    setTimeout(() => {
      this.isConnected = true;
      console.log('Connected to device!');
    }, 1000);
  }

  disconnectDevice() {
    // Implement ESP32 disconnection logic
    this.isConnected = false;
    console.log('Disconnected from device');
  }

  checkDeviceConnection() {
    // Check if device is already connected
    // This would typically involve checking Bluetooth/WiFi status
    console.log('Checking device connection...');
  }

  navigateTo(page: string) {
    console.log(`Navigating to ${page}`);
    switch(page) {
      case 'battle':
        this.router.navigate(['/battle']);
        break;
      case 'leaderboard':
        this.router.navigate(['/leaderboard']);
        break;
      case 'stats':
        this.router.navigate(['/stats']);
        break;
      case 'solo':
        this.router.navigate(['/solo']);
        break;
      case 'games':
        this.router.navigate(['/games']);
        break;
      case 'battles':
        this.router.navigate(['/battles']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      default:
        console.log('Unknown navigation target');
    }
  }
}