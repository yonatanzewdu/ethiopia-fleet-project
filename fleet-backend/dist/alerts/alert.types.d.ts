export type AlertSeverity = 'WARNING' | 'CRITICAL';
export type AlertCategory = 'DRIVER_LICENSE' | 'VEHICLE_INSPECTION' | 'VEHICLE_INSURANCE';
export interface AlertItem {
    severity: AlertSeverity;
    category: AlertCategory;
    assetId: number;
    assetName: string;
    expiryDate: string;
    daysRemaining: number;
}
export interface AlertsSummary {
    companyId: number;
    criticalCount: number;
    warningCount: number;
    totalCount: number;
    alerts: AlertItem[];
}
