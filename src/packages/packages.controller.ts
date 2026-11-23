import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

@ApiTags('Packages')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(
    private readonly packages: PackagesService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('packages.view')
  async findAll(@Query('search') search?: string, @Query('occasion') occasion?: string) {
    return { data: await this.packages.findAll(search, occasion) };
  }

  @Get(':id')
  @RequirePermissions('packages.view')
  async findOne(@Param('id') id: string) {
    return { data: await this.packages.findOne(id) };
  }

  @Post()
  @RequirePermissions('packages.create')
  async create(@Body() dto: CreatePackageDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id, slug } = await this.packages.create(dto);
    await this.activityLog.log(
      user,
      'Package Created',
      'Package',
      id,
      `Created package: ${dto.title}`,
    );
    return { data: { id, slug } };
  }

  @Put(':id')
  @RequirePermissions('packages.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.packages.update(id, dto);
    await this.activityLog.log(user, 'Package Updated', 'Package', id, `Updated package ${id}`);
    return { message: 'Package updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('packages.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.packages.remove(id);
    await this.activityLog.log(user, 'Package Deleted', 'Package', id, `Deleted package ${id}`);
    return { message: 'Package deleted' };
  }
}
