import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import OSS = require('ali-oss');

@ApiTags('文件上传')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  private ossClient: OSS;
  private mirrorOssClient: OSS;

  constructor(private uploadsService: UploadsService) {
    // 主桶 OSSClient（写操作）
    this.ossClient = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET, // 主桶
    });

    // 镜像桶 OSSClient（生成签名 URL 用）
    this.mirrorOssClient = new OSS({
      region: 'oss-cn-hongkong', // 镜像桶所在区域
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: 'vehicle-repair-mirror', // 镜像桶
    });
  }

  @Post('sign')
  @ApiOperation({ summary: '获取OSS上传签名' })
  getUploadSignature(
    @Body('filename') filename: string,
    @Body('contentType') contentType: string,
  ) {
    return this.uploadsService.getUploadSignature(filename, contentType);
  }

  @Get()
  @ApiOperation({ summary: '获取上传记录列表' })
  async findAll(@Query() query: any) {
    // 如果需要，也可以在这里将列表的 URL 替换为镜像桶签名 URL
    const uploads = await this.uploadsService.findAll(query);
    return uploads.map(item => ({
      ...item,
      url: this.mirrorOssClient.signatureUrl(`uploads/${item.filename}`, { expires: 3600 }),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个上传记录' })
  async findOne(@Param('id') id: string) {
    const upload = await this.uploadsService.findOne(+id);
    if (!upload) return null;

    return {
      ...upload,
      url: this.mirrorOssClient.signatureUrl(`uploads/${upload.filename}`, { expires: 3600 }),
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '直接上传文件' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('relatedType') relatedType?: string,
    @Query('relatedId') relatedId?: string,
  ) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.originalname.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const ossPath = `uploads/${filename}`;

    try {
      // 上传到主桶
      await this.ossClient.put(ossPath, file.buffer);

      // 用镜像桶生成签名 URL（1小时有效）
      const mirroredUrl = this.mirrorOssClient.signatureUrl(ossPath, { expires: 3600 });

      // 保存上传记录
      const upload = await this.uploadsService.create({
        filename: filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: mirroredUrl, // 返回给前端的 URL 是镜像桶签名 URL
        relatedType: relatedType || null,
        relatedId: relatedId ? parseInt(relatedId) : null,
      });

      return upload;
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除上传记录' })
  async remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }
}
