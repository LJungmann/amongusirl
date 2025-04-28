export class GameState {
  currentGameId: string = '';
  playersConnected: number[] = [];
  gamesCompleted: number[] = [];
  alivePlayers: number[] = [];
  imposterPlayerId: number = -1;
  isGameStarted: boolean = false;
  isVotingActive: boolean = false;
  emergencyButtonPressed: boolean = false;
  killsEnabled: boolean = true;
  bodyFound: boolean = false;
  playersRegisteredForVoting: number[] = [];
  votes: [number, number][] = []; // tuple, player has x votes
}
