import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WiresController } from './wires/wires.controller';
import { WiresService } from './wires/wires.service';
import { MqttBridgeService } from './services/mqtt-bridge.service';
import { GamestateGateway } from './gateways/gamestate/gamestate.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, WiresController],
  providers: [AppService, WiresService, MqttBridgeService, GamestateGateway],
})
export class AppModule {}
