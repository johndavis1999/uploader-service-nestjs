import { Injectable } from '@nestjs/common';
import { S3 } from './s3.provider';
import { Express } from 'express';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class S3Service {
    constructor(private readonly s3Provider: S3) { }

    async uploadFile(file: Express.Multer.File, route: string): Promise<string> {
        // Comprimir el archivo según su tipo
        const compressedFile = await this.compressFile(file);

        // Subir el archivo comprimido a S3
        return this.s3Provider.uploadFile(compressedFile, route);
    }

    private async compressFile(file: Express.Multer.File): Promise<Express.Multer.File> {
        const fileType = file.mimetype.split('/')[0];

        if (fileType === 'image') {
            // Comprimir imágenes
            return this.compressImage(file);
        }

        if (file.mimetype === 'application/pdf') {
            // Comprimir PDFs
            return this.compressPdf(file);
        }

        // Si no es imagen ni PDF, retornar el archivo original
        return file;
    }

    private async compressImage(file: Express.Multer.File): Promise<Express.Multer.File> {
        try {
            const image = sharp(file.buffer);
            const metadata = await image.metadata();

            const reductionFactor = 0.7;
            const resizedImage = image.resize({
                width: Math.round(metadata.width * reductionFactor),
                height: Math.round(metadata.height * reductionFactor),
            });

            let compressedBuffer: Buffer;

            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                compressedBuffer = await resizedImage.jpeg({
                    quality: 40,
                    progressive: false,
                }).toBuffer();
            } else if (file.mimetype === 'image/png') {
                if (metadata.size > 20000) {
                    compressedBuffer = await resizedImage.png({
                        compressionLevel: 9,
                        palette: true,
                    }).toBuffer();
                } else {
                    compressedBuffer = file.buffer;
                }
            } else {
                compressedBuffer = await resizedImage.webp({
                    quality: 35,
                    lossless: false,
                }).toBuffer();
            }
            return {
                ...file,
                buffer: compressedBuffer,
            };
        } catch (error) {
            console.error('Error compressing image:', error);
            throw new Error('Error compressing image');
        }
    }

    private async compressPdf(file: Express.Multer.File): Promise<Express.Multer.File> {
        try {
            const pdfDoc = await PDFDocument.load(file.buffer);
            const compressedBuffer = await pdfDoc.save({
                useObjectStreams: false,
            });
            const nodeBuffer = Buffer.from(compressedBuffer);
            return {
                ...file,
                buffer: nodeBuffer,
            };
        } catch (error) {
            console.error('Error compressing PDF:', error);
            throw new Error('Error compressing PDF');
        }
    }
}
