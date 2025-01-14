import { Injectable } from '@nestjs/common';
import { S3 } from './s3.provider';
import { Express } from 'express';

@Injectable()
export class S3Service {
    constructor(private readonly s3Provider: S3) { }

    async uploadFile(file: Express.Multer.File, route: string): Promise<string> {
        return this.s3Provider.uploadFile(file, route);
    }
}
