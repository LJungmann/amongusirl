import { Controller, Get, Post } from '@nestjs/common';
import { Wiring } from 'src/model/wiring/Wiring';
import { WiresService } from './wires.service';

@Controller('wires')
export class WiresController {
  constructor(private readonly wiresService: WiresService) {}

  @Get()
  getWiring(): Wiring {
    return this.wiresService.getWiring();
  }

  @Post('save')
  saveWiring(wiring: Wiring): void {
    this.wiresService.saveWiring(wiring);
  }
}
