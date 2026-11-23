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
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthenticatedAdmin } from 'src/common/types/authenticated-admin';
import { ActivityLogService } from 'src/activity-logs/activity-log.service';
import { ContactService } from './contact.service';
import { CreateContactMessageDto, UpdateContactMessageDto } from './dto/contact.dto';

@ApiTags('Contact')
@Controller()
export class ContactController {
  constructor(
    private readonly contact: ContactService,
    private readonly activityLog: ActivityLogService,
  ) {}

  /** Public storefront contact form submission. */
  @Post('storefront/contact')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async submit(@Body() dto: CreateContactMessageDto) {
    const msg = await this.contact.create(dto);
    return { data: { id: msg.id }, message: 'Thank you! Our team will reach out shortly.' };
  }

  @Get('contact-messages')
  @ApiBearerAuth()
  @RequirePermissions('customers.view')
  async findAll(@Query('status') status?: string) {
    const data = await this.contact.findAll(status);
    return { data, total: data.length };
  }

  @Put('contact-messages/:id')
  @ApiBearerAuth()
  @RequirePermissions('customers.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactMessageDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.contact.updateStatus(id, dto);
    await this.activityLog.log(
      user,
      'Enquiry Updated',
      'ContactMessage',
      id,
      `Enquiry ${id} set to ${dto.status}`,
    );
    return { message: 'Enquiry updated successfully' };
  }

  @Delete('contact-messages/:id')
  @ApiBearerAuth()
  @RequirePermissions('customers.delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.contact.remove(id);
    await this.activityLog.log(
      user,
      'Enquiry Deleted',
      'ContactMessage',
      id,
      `Deleted enquiry ${id}`,
    );
    return { message: 'Enquiry deleted successfully' };
  }
}
