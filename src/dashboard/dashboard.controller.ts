import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AdminOverviewService } from './admin-overview.service';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly overview: AdminOverviewService,
  ) {}

  /** Payload consumed by the admin Dashboard page. */
  @Get()
  @RequirePermissions('dashboard.view')
  async getOverview() {
    return { data: await this.overview.getDashboard() };
  }

  @Get('stats')
  @RequirePermissions('orders.view')
  async getStats() {
    return { data: await this.dashboard.getStats() };
  }
}
