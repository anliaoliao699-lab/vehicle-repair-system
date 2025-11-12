import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../entities/upload.entity';
import OSS = require('ali-oss');

@Injectable()
export class UploadsService {
  private ossClient: OSS;

  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {
    this.ossClient = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
  }

  getUploadSignature(filename: string, contentType: string) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = filename.split('.').pop();
    const ossFilename = `uploads/${timestamp}-${randomStr}.${ext}`;

    const policy = {
      expiration: new Date(Date.now() + 3600000).toISOString(),
      conditions: [
        ['content-length-range', 0, 10485760],
        ['eq', '$bucket', process.env.OSS_BUCKET],
      ],
    };

    const signature = this.ossClient.calculatePostSignature(policy);
    const url = `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT.replace('https://', '')}`;

    return {
      url,
      ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID,
      policy: signature.policy,
      signature: signature.Signature,
      key: ossFilename,
      callback: '',
      expire: Date.now() + 3600000,
      host: url,
      dir: 'uploads/',
    };
  }

  async findAll(query: any) {
    const { relatedType, relatedId } = query;
    
    const where: any = {};
    if (relatedType) {
      where.relatedType = relatedType;
    }
    if (relatedId) {
      where.relatedId = parseInt(relatedId);
    }

    return this.uploadRepository.find({ where });
  }

  async findOne(id: number) {
    return this.uploadRepository.findOne({ where: { id } });
  }

  async create(data: any) {
    const upload = this.uploadRepository.create(data);
    return this.uploadRepository.save(upload);
  }

  async remove(id: number) {
    const upload = await this.findOne(id);
    if (upload) {
      try {
        const ossPath = upload.url.split('.com/')[1];
        await this.ossClient.delete(ossPath);
      } catch (error) {
        console.error('从 OSS 删除失败:', error);
      }

      await this.uploadRepository.delete(id);
    }
    return { message: '删除成功' };
  }
}