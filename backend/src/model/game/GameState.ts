export class GameState {
  currentGameId: string = '';
  playersConnected: Array<{ playerId: number }> = [];
  gamesCompleted: number[] = [];
  alivePlayers: Array<{ playerId: number }> = [];
  imposterPlayerId: { playerId: number } = { playerId: -1 };
  isGameStarted: boolean = false;
  isVotingActive: boolean = false;
  emergencyButtonPressed: boolean = false;
  killsEnabled: boolean = true;
  bodyFound: boolean = false;
  playersRegisteredForVoting: number[] = [];
  votes: [{ playerId: number }, number][] = []; // tuple, player has x votes
  stations: [string, number, any][] = []; // tuple, stationId and playerId and stationData
}
