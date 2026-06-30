import {
  Controller, Get, Post, Patch, Body,
  Param, ParseIntPipe, Query, Req,BadRequestException, 
} from '@nestjs/common';
import { FinancialsService } from './financials.service';
import {
  CreateTransactionDto,
  UpdateApprovalDto,
  CreateMileageLogDto,
} from './dto/financials.dto';
import { ApprovalStatus } from './entities/financial-transaction.entity';

@Controller('financials')
export class FinancialsController {
  constructor(private readonly svc: FinancialsService) {}

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  @Post('transactions')
  createManagerTransaction(
    @Body() dto: CreateTransactionDto,
    @Req()  req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number =
      req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
    return this.svc.createManagerTransaction(dto, companyId);
  }

@Post('receipts')
  createDriverReceipt(
    @Body() dto: CreateTransactionDto,
    @Req()  req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number =
      req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
    const driverId: number =
      req.user?.driverId ?? Number(dto.driverId);
 
    if (!driverId || Number.isNaN(driverId)) {
      throw new BadRequestException(
        'This account is not linked to a driver record -- ask an admin to link it.',
      );
    }
 
    return this.svc.createDriverReceipt(dto, companyId, driverId);
  }

  @Get('transactions')
  getTransactions(
    @Req()              req: any,
    @Query('status')    status?: ApprovalStatus,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getTransactionsByCompany(companyId, status);
  }

  @Patch('transactions/:id/approval')
  updateApproval(
    @Param('id', ParseIntPipe) id: number,
    @Body()                    dto: UpdateApprovalDto,
    @Req()                     req: any,
    @Query('companyId')        companyIdQuery?: string,
  ) {
    const companyId: number =
      req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.updateApprovalStatus(id, dto, companyId);
  }

  // ── MILEAGE LOGS ────────────────────────────────────────────────────────────

  @Post('mileage')
  createMileageLog(
    @Body() dto: CreateMileageLogDto,
    @Req()  req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number =
      req.user?.companyId ?? Number(dto.companyId) ?? Number(companyIdQuery);
    return this.svc.createMileageLog(dto, companyId);
  }

  @Get('mileage')
  getMileageLogs(
    @Req()                  req: any,
    @Query('vehicleId')     vehicleIdQuery?: string,
    @Query('companyId')     companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    const vehicleId: number | undefined = vehicleIdQuery ? Number(vehicleIdQuery) : undefined;
    return this.svc.getMileageLogs(companyId, vehicleId);
  }

  // ── ANALYTICS ───────────────────────────────────────────────────────────────

  @Get('cpk')
  getCpk(
    @Req()              req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getCostPerKilometre(companyId);
  }

  @Get('summary')
  getFleetSummary(
    @Req()              req: any,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getFleetSummary(companyId);
  }
}