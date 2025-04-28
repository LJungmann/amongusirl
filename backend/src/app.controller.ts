import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OpenGameResponse } from './model/game/OpenGameResponse';
import { OpenGameRequest } from './model/game/OpenGameRequest';
import { GameState } from './model/game/GameState';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('reset')
  reset(): void {
    // reset the game
    this.appService.resetGameState();
  }

  @Post('open')
  openGame(@Body() playerId: number): OpenGameResponse {
    return this.appService.openGame(playerId);
  }

  @Post('join')
  joinGame(@Body() playerId: number): number {
    return this.appService.joinGame(playerId);
  }

  @Post('start')
  startGame(): number {
    return this.appService.startGame();
  }

  @Post('complete')
  completeGame(@Body() stationId: number): void {
    this.appService.completeGame(stationId);
  }

  @Get('gameState')
  gameState(): GameState {
    return this.appService.getGameState();
  }

  @Post('kill')
  killPlayer(@Body() playerId: number): void {
    this.appService.killPlayer(playerId);
  }

  // emergency button
  @Post('emergency')
  emergencyButtonPressed(): void {
    this.appService.emergencyButton();
  }

  // dead body found
  @Post('bodyFound')
  bodyFound(@Body() playerId: number): void {
    this.appService.bodyFound(playerId);
  }

  @Post('registerVoting')
  registerForVoting(@Body() playerId: number): boolean {
    return this.appService.registerForVoting(playerId);
  }

  @Post('voteFor')
  voteFor(@Body() playerId: number): boolean {
    return this.appService.voteFor(playerId);
  }
}
