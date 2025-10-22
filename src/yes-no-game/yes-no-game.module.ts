import { Module } from '@nestjs/common';
import { YesNoGameService } from './yes-no-game.service';
import { YesNoGameController } from './yes-no-game.controller';

@Module({
  controllers: [YesNoGameController],
  providers: [YesNoGameService],
})
export class YesNoGameModule {}
