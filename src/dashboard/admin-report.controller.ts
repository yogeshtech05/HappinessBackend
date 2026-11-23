import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AdminOverviewService } from './admin-overview.service';

/** `GET /reports` — summary payload consumed by the admin Reports page. */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class AdminReportController {
  constructor(private readonly overview: AdminOverviewService) {}

  @Get()
  @RequirePermissions('reports.view')
  async getReport() {
    return { data: await this.overview.getReport() };
  }
}
