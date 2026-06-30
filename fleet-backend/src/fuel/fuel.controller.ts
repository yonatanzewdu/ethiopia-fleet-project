import {
  Controller, Get, Post, Body, Query, Req,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FuelService } from './fuel.service';
import { CreateFuelLogDto } from './dto/fuel.dto';

@Controller('fuel')
export class FuelController {
  constructor(private readonly svc: FuelService) {}

  // =======================================================================
  // 1. DRIVER ENDPOINTS
  // =======================================================================

  /**
   * GET /fuel/driver/vehicle?driverId=3&companyId=2
   * Returns the strictly scoped vehicle asset for the logged-in driver.
   *
   * FIX: no auth guard exists yet, so req.user is always undefined.
   * Falls back to explicit query params (?driverId=&companyId=) — same
   * pattern already used everywhere else in this app (e.g. ?companyId=).
   * Swap this for req.user once a real JWT guard is wired in.
   */
  @Get('driver/vehicle')
  async getDriverVehicle(
    @Req() req: any,
    @Query('driverId') driverIdQuery?: string,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId = req.user?.companyId ?? Number(companyIdQuery);
    const driverId  = req.user?.id ?? Number(driverIdQuery);

    return this.svc.getAssignedVehicleForDriver(driverId, companyId);
  }

  /**
   * POST /fuel/driver/submit?driverId=3&companyId=2
   * Submits a new unverified fuel request from the mobile console.
   *
   * FIX: previously had no file interceptor, so multipart/form-data bodies
   * (used when a receipt photo is attached) couldn't be parsed at all —
   * `body` arrived as undefined, crashing on `data.vehicleId`.
   * FileInterceptor('receiptImage') now parses the multipart body AND
   * saves the uploaded photo to disk under ./uploads/receipts.
   */
  @Post('driver/submit')
  @UseInterceptors(
    FileInterceptor('receiptImage', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB cap
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Receipt must be an image file.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async driverSubmitFuelLog(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: any,
    @Query('driverId') driverIdQuery?: string,
    @Query('companyId') companyIdQuery?: string,
  ) {
    const companyId = req.user?.companyId ?? Number(companyIdQuery);
    const driverId  = req.user?.id ?? Number(driverIdQuery);

    if (!body) {
      throw new BadRequestException('Request body missing — could not parse submission.');
    }

    const receiptImagePath = file ? `/uploads/receipts/${file.filename}` : undefined;

    return this.svc.createFuelRequest(driverId, companyId, body, receiptImagePath);
  }

  // =======================================================================
  // 2. ADMIN / SYSTEM ENDPOINTS (unchanged)
  // =======================================================================

  @Post()
  create(@Body() dto: CreateFuelLogDto, @Req() req: any) {
    const companyId: number = req.user?.companyId ?? dto.companyId;
    return this.svc.createFuelLog(dto, companyId);
  }

  @Get()
  findAll(
    @Req()              req: any,
    @Query('companyId') companyIdQuery?: string,
    @Query('vehicleId') vehicleIdQuery?: string,
  ) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    const vehicleId = vehicleIdQuery ? Number(vehicleIdQuery) : undefined;
    return this.svc.getFuelLogs(companyId, vehicleId);
  }

  @Get('summary')
  summary(@Req() req: any, @Query('companyId') companyIdQuery?: string) {
    const companyId: number = req.user?.companyId ?? Number(companyIdQuery);
    return this.svc.getFuelSummary(companyId);
  }
}