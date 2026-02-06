import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IStorageProvider, UploadResult } from './storage-provider.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryProvider implements IStorageProvider {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async upload(file: Express.Multer.File): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'ecommerce/images' },
                (error, result: UploadApiResponse | undefined) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Cloudinary upload failed'));
                    resolve({
                        url: result.secure_url,
                        providerKey: result.public_id,
                    });
                }
            );

            uploadStream.end(file.buffer);
        });
    }

    async delete(providerKey: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(providerKey, (error, result) => {
                if (error) return reject(error);
                if (result.result !== 'ok' && result.result !== 'not found') {
                    return reject(new Error(`Cloudinary delete failed: ${result.result}`));
                }
                resolve();
            });
        });
    }
}
