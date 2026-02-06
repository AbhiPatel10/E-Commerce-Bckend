import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryProvider } from '../../providers/storage/cloudinary.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [ImagesController],
    providers: [ImagesService, PrismaService, CloudinaryProvider],
    exports: [ImagesService],
})
export class ImagesModule { }
