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
    const uploads = await this.uploadsService.findAll(query);
    return uploads.map(item => {
      // 如果是云存储的 URL，直接返回；否则生成签名 URL
      if (item.url && item.url.includes('cloud://')) {
        return item;
      }
      if (item.url && item.url.includes('tcb.qcloud.la')) {
        return item;
      }
      return {
        ...item,
        url: this.mirrorOssClient.signatureUrl(`uploads/${item.filename}`, { expires: 3600 }),
      };
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个上传记录' })
  async findOne(@Param('id') id: string) {
    const upload = await this.uploadsService.findOne(+id);
    if (!upload) return null;

    // 如果是云存储的 URL，直接返回
    if (upload.url && (upload.url.includes('cloud://') || upload.url.includes('tcb.qcloud.la'))) {
      return upload;
    }

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

  /**
   * ✅ 新增：保存微信云存储的图片记录
   * 前端上传到云存储后，调用此接口保存记录到数据库
   */
  @Post('cloud')
  @ApiOperation({ summary: '保存云存储图片记录' })
  async saveCloudFile(
    @Body() body: {
      fileID: string;
      url: string;
      cloudPath: string;
      relatedType?: string;
      relatedId?: number;
    },
  ) {
    console.log('📥 收到云存储图片保存请求:', body);

    try {
      // 从 cloudPath 提取文件名
      const filename = body.cloudPath || body.fileID.split('/').pop() || `cloud_${Date.now()}.jpg`;
      
      // 保存到数据库
      const upload = await this.uploadsService.create({
        filename: filename,
        originalName: filename,
        mimeType: 'image/jpeg', // 默认类型
        size: 0, // 云存储不提供大小信息
        url: body.url, // 云存储的临时 URL
        fileId: body.fileID, // ✅ 保存 fileID，方便后续获取新的临时链接
        relatedType: body.relatedType || null,
        relatedId: body.relatedId || null,
      });

      console.log('✅ 云存储图片记录已保存:', upload);

      return upload;
    } catch (error) {
      console.error('❌ 保存云存储图片记录失败:', error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除上传记录' })
  async remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }
}