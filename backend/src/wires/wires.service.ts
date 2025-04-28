import { Injectable } from '@nestjs/common';
import { Wiring } from 'src/model/wiring/Wiring';

@Injectable()
export class WiresService {
  private wiring: Wiring = new Wiring();

  getWiring(): Wiring {
    return this.wiring;
  }

  saveWiring(wiring: Wiring): void {
    this.wiring = wiring;
  }

  private shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
}
