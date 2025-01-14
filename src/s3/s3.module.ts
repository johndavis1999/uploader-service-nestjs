import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { S3 } from './s3.provider';

@Module({
  providers: [S3Service, S3],
  controllers: [S3Controller]
})
export class S3Module { }