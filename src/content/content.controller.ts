import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { ContentService } from './content.service';
import { UpdateCmsSectionDto, UpsertCmsContentDto } from './dto/cms-content.dto';

@ApiTags('Content Manager')
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(
    private readonly content: ContentService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('content.view')
  async findAll() {
    return { data: await this.content.findAll() };
  }

  @Get(':sectionKey')
  @RequirePermissions('content.view')
  async findOne(@Param('sectionKey') sectionKey: string) {
    return { data: await this.content.findOne(sectionKey) };
  }

  /** Admin panel variant: section key travels in the body. */
  @Put()
  @RequirePermissions('content.update')
  async updateByBody(@Body() dto: UpdateCmsSectionDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { sectionKey, ...rest } = dto;
    return this.update(sectionKey, rest, user);
  }

  @Put(':sectionKey')
  @RequirePermissions('content.update')
  async update(
    @Param('sectionKey') sectionKey: string,
    @Body() dto: UpsertCmsContentDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    const { id } = await this.content.upsert(sectionKey, dto, user.name);
    await this.activityLog.log(
      user,
      'Content Updated',
      'CMS',
      id,
      `Updated content section ${sectionKey}`,
    );
    return { message: 'Content updated successfully' };
  }
}
