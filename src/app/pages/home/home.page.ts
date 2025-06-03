import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MockESP32Service, ESP32Device } from 'src/app/services/mock-esp32.service';

import { IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonButtons, IonContent, IonFooter } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { football, fitness, people, trophy, personOutline, barChart, bluetooth } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonButtons, IonContent, IonFooter, NgIf]
})
export class HomePage implements OnInit, OnDestroy {
  isConnected: boolean = false;
  connectedDevice: ESP32Device | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private esp32Service: MockESP32Service
  ) {
    addIcons({ football, fitness, people, trophy, personOutline, barChart, bluetooth });
  }

  ngOnInit() {
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to connection status
    const connectionSub = this.esp32Service.isConnected$.subscribe(
      isConnected => {
        this.isConnected = isConnected;
      }
    );

    // Subscribe to connected device
    const deviceSub = this.esp32Service.connectedDevice$.subscribe(
      device => {
        this.connectedDevice = device;
      }
    );

    // Subscribe to data received from ESP32
    const dataSub = this.esp32Service.dataReceived$.subscribe(
      data => {
        if (data) {
          this.handleESP32Data(data);
        }
      }
    );

    this.subscriptions.push(connectionSub, deviceSub, dataSub);
  }

  toggleConnection() {
    if (this.isConnected) {
      this.disconnectDevice();
    } else {
      this.connectDevice();
    }
  }

  connectDevice() {
    console.log('Connecting to ScoreFactor-ESP32...');
    
    // Create the mock device to connect to
    const mockDevice: ESP32Device = {
      name: 'ScoreFactor-ESP32',
      address: '00:11:22:33:44:55',
      id: 'sf_001'
    };
    
    // Update the service state
    this.esp32Service['isConnectedSubject'].next(true);
    this.esp32Service['connectedDeviceSubject'].next(mockDevice);
    
    // This will trigger our subscriptions to update isConnected and connectedDevice
    console.log('Connected to ScoreFactor-ESP32!');
  }

  disconnectDevice() {
    console.log('Disconnecting from ScoreFactor-ESP32...');
    
    // Update the service state
    this.esp32Service['isConnectedSubject'].next(false);
    this.esp32Service['connectedDeviceSubject'].next(null);
    
    // This will trigger our subscriptions to update isConnected and connectedDevice
    console.log('Disconnected from ScoreFactor-ESP32');
  }

  handleESP32Data(data: string) {
    console.log('ESP32 sent:', data);
    
    // Handle different types of data from ESP32
    switch (data) {
      case 'DEVICE_READY':
        console.log('ESP32 is ready!');
        break;
      case 'GAME_STARTED':
        console.log('Game started!');
        break;
      case 'GAME_STOPPED':
        console.log('Game stopped');
        break;
      case 'GAME_RESET':
        console.log('Game reset');
        break;
      case 'BATTLE_MODE_READY':
        console.log('Battle mode ready!');
        break;
      case 'DISCONNECTED':
        // Handle disconnection
        break;
      default:
        if (data.includes('SCORE_UPDATE')) {
          const score = data.split(': ')[1];
          console.log(`Score: ${score}`);
        } else if (data.includes('COMMAND_RECEIVED')) {
          console.log('Command acknowledged:', data);
        }
    }
  }

  sendToESP32(command: string) {
    if (this.isConnected) {
      console.log('Sent to ESP32:', command);
    } else {
      console.log('Please connect to ESP32 first');
    }
  }



  navigateTo(page: string) {
    console.log(`Navigating to ${page}`);
    
    // Check if connection is required for certain pages
    if ((page === 'battle' || page === 'solo') && !this.isConnected) {
      alert('Please connect to your ESP32 device first to play games.');
      return;
    }

    switch(page) {
      case 'battle':
        // Send battle start command to ESP32 before navigating
        this.sendToESP32('BATTLE_MODE');
        this.router.navigate(['/battle']);
        break;
      case 'leaderboard':
        this.router.navigate(['/leaderboard']);
        break;
      case 'stats':
        this.router.navigate(['/stats']);
        break;
      case 'solo':
        // Send solo mode command to ESP32
        this.sendToESP32('SOLO_MODE');
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

  // Helper method to check if a navigation requires connection
  requiresConnection(page: string): boolean {
    return ['battle', 'solo'].includes(page);
  }

  // Test method similar to your login page
  testConnection() {
    console.log('Test connection button clicked - this should appear in remote debugging');
    alert('Test connection works!');
  }
}