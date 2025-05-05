import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OpenGameResponse } from './model/game/OpenGameResponse';
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
  openGame(@Body() playerId: { playerId: number }): OpenGameResponse {
    return this.appService.openGame(playerId.playerId);
  }

  @Post('join')
  joinGame(@Body() playerId: { playerId: number }): number {
    return this.appService.joinGame(playerId.playerId);
  }

  @Post('start')
  startGame(): number {
    return this.appService.startGame();
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
  registerForVoting(@Body() data: { playerId: number }): boolean {
    console.log('registerForVoting', data.playerId);
    return this.appService.registerForVoting(data.playerId);
  }

  @Post('voteFor')
  voteFor(@Body() data: { playerId: number }): boolean {
    return this.appService.voteFor(data.playerId);
  }

  @Post('startStation')
  startStation(@Body() data: { stationId: string; playerId: number }): void {
    this.appService.startStation(data.stationId, data.playerId);
  }

  @Post('completeStation')
  completeStation(@Body() data: { stationId: string }): void {
    this.appService.completeStation(data.stationId);
  }

  @Post('setStationData')
  setStationData(@Body() data: { stationId: string; data: any }): void {
    this.appService.setStationData(data.stationId, data.data);
  }
}
