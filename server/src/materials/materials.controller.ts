// src/materials/materials.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('材料管理')
@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: '创建材料' })
  @Roles(UserRole.ADMIN)
  create(@Body() createDto: any) {
    return this.materialsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取材料列表' })
  findAll(@Query() filters: any) {
    return this.materialsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取材料详情' })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新材料信息' })
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.materialsService.update(+id, updateData);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: '更新材料库存' })
  @Roles(UserRole.ADMIN)
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.materialsService.updateStock(+id, quantity);
  }
}