export declare class FuelLog {
    id: number;
    companyId: number;
    vehicleId: number;
    driverId?: number;
    date: string;
    litres: number;
    pricePerLitre: number;
    totalCost: number;
    odometerReading: number;
    kmSinceLastFill: number;
    litresPer100km?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
