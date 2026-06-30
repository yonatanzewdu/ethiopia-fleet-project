export declare enum FuelRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class FuelRequest {
    id: string;
    amountEtb: number;
    litresFilled: number;
    pricePerLitre: number;
    odometerReading: number;
    receiptImage: string | null;
    status: FuelRequestStatus;
    date: Date;
    companyId: number;
    vehicleId: number;
    driverId: number;
}
