// src/oss/oss.module.ts
import { Module } from '@nestjs/common';
import { OssService } from './oss.service';

@Module({
  providers: [OssService],
  exports: [OssService], // 供其他模块使用
})
export class OssModule {}
