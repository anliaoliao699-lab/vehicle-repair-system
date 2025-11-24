// src/photos/photos.controller.ts
import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('照片管理')
@Controller('photos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Post()
  @ApiOperation({ summary: '注册照片' })
  create(@Body() createDto: any, @Request() req) {
    return this.photosService.create(createDto, req.user.id);
  }

  @Get('work-orders/:workOrderId')
  @ApiOperation({ summary: '获取工单的照片列表' })
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.photosService.findByWorkOrder(+workOrderId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除照片' })
  remove(@Param('id') id: string) {
    return this.photosService.remove(+id);
  }
}
