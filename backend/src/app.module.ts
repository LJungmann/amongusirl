import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WiresController } from './wires/wires.controller';
import { WiresService } from './wires/wires.service';
import { MqttBridgeService } from './services/mqtt-bridge.service';

@Module({
  imports: [],
  controllers: [AppController, WiresController],
  providers: [AppService, WiresService, MqttBridgeService],
})
export class AppModule {}
