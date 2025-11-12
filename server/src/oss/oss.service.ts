// src/oss/oss.service.ts
import OSS from 'ali-oss'; // 默认导入
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { Express } from 'express'; // Multer 类型


@Injectable()
export class OssService {
  private client: OSS;

  constructor() {
    this.client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `uploads/${Date.now()}_${Math.random().toString(36).substring(2)}${ext}`;

    // 使用 buffer 上传
    const result = await this.client.put(fileName, file.buffer);

    return result.url;
  }
}
