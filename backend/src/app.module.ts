import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WiresController } from './wires/wires.controller';
import { WiresService } from './wires/wires.service';

@Module({
  imports: [],
  controllers: [AppController, WiresController],
  providers: [AppService, WiresService],
})
export class AppModule {}
