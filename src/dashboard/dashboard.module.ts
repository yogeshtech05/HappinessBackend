import { Module } from '@nestjs/common';
import { AdminOverviewService } from './admin-overview.service';
import { AdminReportController } from './admin-report.controller';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController, AdminReportController],
  providers: [DashboardService, AdminOverviewService],
})
export class DashboardModule {}
