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
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  @Get()
  @RequirePermissions('products.view')
  async findAll(@Query('category') category?: string, @Query('search') search?: string) {
    return { data: await this.products.findAll(category, search) };
  }

  @Post()
  @RequirePermissions('products.create')
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedAdmin) {
    const { id, sku } = await this.products.create(dto);
    await this.activityLog.log(
      user,
      'Product Created',
      'Product',
      id,
      `Created product ${dto.name}`,
    );
    return { data: { id, sku } };
  }

  @Put(':id')
  @RequirePermissions('products.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedAdmin,
  ) {
    await this.products.update(id, dto);
    await this.activityLog.log(
      user,
      'Product Updated',
      'Product',
      id,
      `Updated product ${dto.name}`,
    );
    return { message: 'Product updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('products.delete')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedAdmin) {
    await this.products.remove(id);
    await this.activityLog.log(user, 'Product Deleted', 'Product', id, `Deleted product ${id}`);
    return { message: 'Product deleted' };
  }
}
