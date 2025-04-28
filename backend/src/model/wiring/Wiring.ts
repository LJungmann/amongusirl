/**
 * Red, Green, Yellow
 * ☀️, ❤️, 🤡
 */
export class Wiring {
  public wiring: [
    [WiringColor, WiringSymbol],
    [WiringColor, WiringSymbol],
    [WiringColor, WiringSymbol],
  ];
}

export enum WiringColor {
  Red,
  Green,
  Yellow,
}

export enum WiringSymbol {
  Sun,
  Heart,
  Clown,
}
