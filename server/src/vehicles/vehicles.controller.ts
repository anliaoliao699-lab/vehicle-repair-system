import { Controller, Get, Post, Param, Put, Body, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@ApiTags('车辆管理')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  // ✅ 新增：创建车辆
  @Post()
  @ApiOperation({ summary: '添加车辆' })
  create(@Req() req, @Body() createVehicleDto: CreateVehicleDto) {
    // 从 JWT token 中获取 ownerId，不需要前端传
    return this.vehiclesService.create({
      ...createVehicleDto,
      ownerId: req.user.id, // 自动关联到当前登录用户
    });
  }

  @Get()
  @ApiOperation({ summary: '获取车辆列表' })
  findAll(@Req() req, @Query('ownerId') ownerId?: string) {
    // 车主只能查看自己的车辆
    if (req.user.role === UserRole.OWNER) {
      return this.vehiclesService.findAll(req.user.id);
    }
    return this.vehiclesService.findAll(ownerId ? +ownerId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取车辆详情' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新车辆信息' })
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.vehiclesService.update(+id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除车辆' })
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}