import { Controller, Post, Get } from '@nestjs/common';
import { VisitorsService } from './visitors.service';

@Controller('public/visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post('hit')
  recordHit() {
    return this.visitorsService.recordHit();
  }

  @Get('count')
  getCount() {
    return this.visitorsService.getCount();
  }
}
