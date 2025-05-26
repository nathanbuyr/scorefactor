import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonContent} from "@ionic/angular/standalone";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.page.html',
  styleUrls: ['./battle.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButton, IonContent, NgIf]
})
export class BattlePage {
  hasStarted = false;
  timer = 10;
  player1Score = 0;
  player2Score = 0;
  interval: any;
  battleOver = false;

  startBattle() {
    this.hasStarted = true;
    this.timer = 10;
    this.player1Score = 0;
    this.player2Score = 0;
    this.battleOver = false;

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.interval);
        this.battleOver = true;
      }
    }, 1000);
  }

  addScore(player: number) {
    if (this.battleOver) return;
    if (player === 1) this.player1Score++;
    if (player === 2) this.player2Score++;
  }

  getWinner(): string {
    if (this.player1Score > this.player2Score) return 'Player 1 Wins!';
    if (this.player2Score > this.player1Score) return 'Player 2 Wins!';
    return 'It\'s a tie!';
  }

  resetBattle() {
    this.hasStarted = false;
    this.battleOver = false;
  }
}
