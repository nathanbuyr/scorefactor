import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton} from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonHeader, IonTitle, IonContent, IonButton]
})
export class HomePage {
  connected = false;

  constructor(private router: Router) {}

  connectBluetooth() {
    this.connected = true;
    alert('Bluetooth device connected (simulated)');
  }

  startBattle() {
    if (!this.connected) {
      alert('Please connect to a Bluetooth device first.');
      return;
    }
    this.router.navigateByUrl('/battle');
  }
}
