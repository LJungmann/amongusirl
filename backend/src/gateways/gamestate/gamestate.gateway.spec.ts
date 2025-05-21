import { Test, TestingModule } from '@nestjs/testing';
import { GamestateGateway } from './gamestate.gateway';

describe('GamestateGateway', () => {
  let gateway: GamestateGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamestateGateway],
    }).compile();

    gateway = module.get<GamestateGateway>(GamestateGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
