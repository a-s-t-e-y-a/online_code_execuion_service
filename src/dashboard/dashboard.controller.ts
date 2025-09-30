import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}


  @Get('user/:id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

}
