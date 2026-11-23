import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('reviews.view')
  async findAll() {
    return { data: await this.reviews.findAll() };
  }

  @Put(':id')
  @RequirePermissions('reviews.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.reviews.update(id, dto);
    await this.activityLog.log(
      user,
      'Review Moderated',
      'Review',
      id,
      `Review ${id} status set to ${dto.status ?? 'unchanged'}`,
    );
    return { message: 'Review updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('reviews.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.reviews.remove(id);
    await this.activityLog.log(user, 'Review Deleted', 'Review', id, `Deleted review ID ${id}`);
    return { message: 'Review deleted' };
  }
}
