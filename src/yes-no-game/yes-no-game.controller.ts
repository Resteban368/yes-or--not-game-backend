import { Controller, Get } from '@nestjs/common';
import { YesNoGameService } from './yes-no-game.service';

@Controller('yes-no-game')
export class YesNoGameController {
  constructor(private readonly yesNoGameService: YesNoGameService) {}


  @Get('/game')
    sendReplay(){
      return this.yesNoGameService.sendReplay();
    }


}
