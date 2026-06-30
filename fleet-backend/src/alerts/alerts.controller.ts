import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsSummary } from './alert.types';

@Controller('companies')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':companyId/alerts')
  getCompanyAlerts(
    @Param('companyId', ParseIntPipe) companyId: number,
  ): Promise<AlertsSummary> {
    return this.alertsService.getCompanyAlerts(companyId);
  }
}
