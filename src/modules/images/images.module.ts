import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { CloudinaryProvider } from "../../providers/storage/cloudinary.provider";
import { ConfigModule } from "@nestjs/config";
import { Image } from "../../entities";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Image])],
  controllers: [ImagesController],
  providers: [ImagesService, CloudinaryProvider],
  exports: [ImagesService],
})
export class ImagesModule {}
