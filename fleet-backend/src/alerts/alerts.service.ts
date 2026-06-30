import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Company } from '../companies/entities/company.entity';
import {
  AlertItem,
  AlertsSummary,
  AlertSeverity,
  AlertCategory,
} from './alert.types';

// Thresholds in days
const THRESHOLDS = {
  DRIVER_LICENSE:       { warning: 60, critical: 30 },
  VEHICLE_INSPECTION:   { warning: 60, critical: 30 },
  VEHICLE_INSURANCE:    { warning: 30, critical: 7  },
} as const;

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getCompanyAlerts(companyId: number): Promise<AlertsSummary> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company #${companyId} not found`);
    }

    const [vehicles, drivers] = await Promise.all([
      this.vehicleRepository.find({
        where: { company: { id: companyId } },
      }),
      this.driverRepository.find({
        where: { company: { id: companyId } },
      }),
    ]);

    const today = this.toDateOnly(new Date());
    const alerts: AlertItem[] = [];

    for (const vehicle of vehicles) {
      this.evaluate(
        alerts,
        vehicle.insuranceExpiry,
        today,
        'VEHICLE_INSURANCE',
        vehicle.id,
        vehicle.plateNumber,
      );

      this.evaluate(
        alerts,
        vehicle.inspectionExpiry,
        today,
        'VEHICLE_INSPECTION',
        vehicle.id,
        vehicle.plateNumber,
      );
    }

    for (const driver of drivers) {
      this.evaluate(
        alerts,
        driver.licenseExpiry,
        today,
        'DRIVER_LICENSE',
        driver.id,
        driver.fullName,
      );
    }

    // Sort: CRITICAL first, then by soonest expiry
    alerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'CRITICAL' ? -1 : 1;
      }
      return a.daysRemaining - b.daysRemaining;
    });

    return {
      companyId,
      criticalCount: alerts.filter((a) => a.severity === 'CRITICAL').length,
      warningCount:  alerts.filter((a) => a.severity === 'WARNING').length,
      totalCount:    alerts.length,
      alerts,
    };
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private evaluate(
    alerts: AlertItem[],
    expiryDate: string,
    today: Date,
    category: AlertCategory,
    assetId: number,
    assetName: string,
  ): void {
    const daysRemaining = this.daysUntil(expiryDate, today);
    const threshold = THRESHOLDS[category];

    let severity: AlertSeverity | null = null;

    if (daysRemaining <= threshold.critical) {
      severity = 'CRITICAL';
    } else if (daysRemaining <= threshold.warning) {
      severity = 'WARNING';
    }

    if (severity !== null) {
      alerts.push({ severity, category, assetId, assetName, expiryDate, daysRemaining });
    }
  }

  /** Returns whole days between today (midnight) and the expiry date string (YYYY-MM-DD). */
  private daysUntil(expiryDate: string, today: Date): number {
    const expiry = new Date(expiryDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((expiry.getTime() - today.getTime()) / msPerDay);
  }

  /** Strip time component so comparisons are date-only. */
  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
