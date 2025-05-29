import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonButtons, IonContent, IonFooter } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { football, fitness, people, trophy, personOutline, barChart, bluetooth } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonButtons, IonContent, IonFooter]
})
export class HomePage implements OnInit {
  isConnected: boolean = false;
  connectedDevice: any = null;
  pairedDevices: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private bluetoothSerial: BluetoothSerial,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ football, fitness, people, trophy, personOutline, barChart, bluetooth });
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

  async connectDevice() {
    console.log('Attempting to connect to ESP32...');
    
    const loading = await this.loadingController.create({
      message: 'Searching for ESP32...'
    });
    await loading.present();

    try {
      // Enable Bluetooth if not enabled
      const isEnabled = await this.bluetoothSerial.isEnabled();
      if (!isEnabled) {
        await this.bluetoothSerial.enable();
      }

      // Get paired devices
      this.pairedDevices = await this.bluetoothSerial.list();
      
      const esp32Devices = this.pairedDevices.filter(device => 
        device.name && (
          device.name.toLowerCase().includes('esp32') ||
          device.name.toLowerCase().includes('esp-32') ||
          device.name.toLowerCase().includes('scorefactor')
        )
      );

      await loading.dismiss();
      
      if (esp32Devices.length > 0) {
        if (esp32Devices.length === 1) {
          // Auto-connect if only one ESP32 found
          this.connectToESP32(esp32Devices[0]);
        } else {
          // Show list if multiple ESP32s found
          this.showESP32List(esp32Devices);
        }
      } else {
        this.showAlert('No ESP32 Found', 'Make sure your ESP32 is paired and discoverable. Go to your phone\'s Bluetooth settings to pair it first.');
      }
      
    } catch (error) {
      await loading.dismiss();
      console.error('Bluetooth connection error:', error);
      this.showAlert('Bluetooth Error', 'Could not access Bluetooth. Make sure Bluetooth is enabled and permissions are granted.');
    }
  }

  async connectToESP32(device: any) {
    const loading = await this.loadingController.create({
      message: `Connecting to ${device.name}...`
    });
    await loading.present();

    try {
      await this.bluetoothSerial.connect(device.address).subscribe(
        async () => {
          await loading.dismiss();
          this.isConnected = true;
          this.connectedDevice = device;
          this.showToast(`Connected to ${device.name}!`, 'success');
          console.log('Connected to ESP32:', device.name);
          
          // Start listening for data from ESP32
          this.startListening();
        },
        async error => {
          await loading.dismiss();
          console.error('Connection failed:', error);
          this.showAlert('Connection Failed', `Could not connect to ${device.name}. Make sure the device is nearby and not connected to another app.`);
        }
      );
    } catch (error) {
      await loading.dismiss();
      console.error('Connection error:', error);
      this.showAlert('Connection Error', 'An error occurred while connecting to the device.');
    }
  }

  startListening() {
    this.bluetoothSerial.subscribe('\n').subscribe(
      data => {
        console.log('Data from ESP32:', data);
        this.handleESP32Data(data);
      },
      error => {
        console.error('Error receiving data:', error);
      }
    );
  }

  handleESP32Data(data: string) {
    console.log('ESP32 sent:', data.trim());
    
    // Handle different types of data from ESP32
    try {
      const jsonData = JSON.parse(data.trim());
      // Handle JSON data (sensor readings, game data, etc.)
      console.log('Parsed ESP32 data:', jsonData);
      
      // Example: Handle score updates
      if (jsonData.score) {
        this.showToast(`Score: ${jsonData.score}`, 'primary');
      }
    } catch (e) {
      // Handle plain text commands/responses
      const command = data.trim().toLowerCase();
      
      if (command.includes('ready')) {
        this.showToast('ESP32 is ready!', 'success');
      } else if (command.includes('button')) {
        this.showToast('Button pressed!', 'warning');
      } else if (command.includes('score')) {
        // Handle score updates
        console.log('Score update:', command);
        this.showToast(command, 'primary');
      }
    }
  }

  async sendToESP32(command: string) {
    if (this.isConnected) {
      try {
        await this.bluetoothSerial.write(command + '\n');
        console.log('Sent to ESP32:', command);
        this.showToast(`Sent: ${command}`, 'tertiary');
      } catch (error) {
        console.error('Send error:', error);
        this.showAlert('Send Error', 'Failed to send data to ESP32');
      }
    } else {
      this.showAlert('Not Connected', 'Please connect to ESP32 first');
    }
  }

  async disconnectDevice() {
    try {
      await this.bluetoothSerial.disconnect();
      this.isConnected = false;
      this.connectedDevice = null;
      this.showToast('Disconnected from ESP32', 'warning');
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still update the UI even if disconnect fails
      this.isConnected = false;
      this.connectedDevice = null;
    }
  }

  async checkDeviceConnection() {
    console.log('Checking device connection...');
    try {
      const isConnected = await this.bluetoothSerial.isConnected();
      this.isConnected = isConnected;
      if (isConnected) {
        console.log('Device is already connected');
        this.startListening();
      }
    } catch (error) {
      console.log('No existing connection found');
      this.isConnected = false;
    }
  }

  async showESP32List(devices: any[]) {
    const alert = await this.alertController.create({
      header: 'Select ESP32 Device',
      inputs: devices.map(device => ({
        name: 'device',
        type: 'radio',
        label: `${device.name}`,
        value: device
      })),
      buttons: [
        'Cancel',
        {
          text: 'Connect',
          handler: (device) => {
            if (device) {
              this.connectToESP32(device);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  testESP32Commands() {
    this.sendToESP32('START_GAME');
  }

  navigateTo(page: string) {
    console.log(`Navigating to ${page}`);
    switch(page) {
      case 'battle':
        // Send battle start command to ESP32 before navigating
        if (this.isConnected) {
          this.sendToESP32('BATTLE_MODE');
        }
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
        if (this.isConnected) {
          this.sendToESP32('SOLO_MODE');
        }
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