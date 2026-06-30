export declare class ReportsQueryDto {
    companyId: number;
    startDate: string;
    endDate: string;
    vehicleId?: number;
    granularity?: 'week' | 'month';
}
