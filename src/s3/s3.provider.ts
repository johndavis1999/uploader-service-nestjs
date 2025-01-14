import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';

@Injectable()
export class S3 {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, route: string): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const objectName = `${route}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: objectName,
      Body: file.buffer,
      ACL: ObjectCannedACL.private,
      Metadata: {
        'x-amz-meta-content-type': file.mimetype,
      },
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      const fileUrl = `${this.configService.get<string>('AWS_ENDPOINT')}/${objectName}`;
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file');
    }
  }
}