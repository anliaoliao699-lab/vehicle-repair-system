// src/users/users.controller.ts
import { 
  Controller, 
  Get, 
  Param, 
  Put, 
  Body, 
  Delete, 
  Query, 
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: '获取用户列表' })
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  /**
   * 获取可用员工列表
   * 注意: 这个路由必须放在 @Get(':id') 之前,否则 'available-workers' 会被当作 id 参数
   */
  @ApiOperation({ summary: '获取可用员工列表' })
  @Get('available-workers')
  async getAvailableWorkers(@Query('shopId') shopId?: string) {
    try {
      // 如果提供了shopId,验证其有效性
      if (shopId) {
        const parsedShopId = parseInt(shopId);
        if (isNaN(parsedShopId)) {
          throw new BadRequestException('Invalid shopId parameter');
        }
        return this.usersService.getAvailableWorkers(parsedShopId);
      }
      
      // 如果没有提供shopId,返回所有可用员工
      return this.usersService.getAvailableWorkers();
    } catch (error) {
      console.error('获取可用员工失败:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: '获取用户详情' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: '更新用户信息' })
  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.usersService.update(+id, updateData);
  }

  @ApiOperation({ summary: '禁用用户' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}