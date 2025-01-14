import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { route: string }) {
        console.log('Route:', body.route);
        try {
            const fileUrl = await this.s3Service.uploadFile(file, body.route);
            return { url: fileUrl };
        } catch (error) {
            return { message: 'Error uploading file', error };
        }
    }
}