import { AlertsService } from './alerts.service';
import { AlertsSummary } from './alert.types';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getCompanyAlerts(companyId: number): Promise<AlertsSummary>;
}
