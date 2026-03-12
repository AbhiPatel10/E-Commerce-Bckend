import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CloudinaryProvider } from "../../providers/storage/cloudinary.provider";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";
import { Image } from "../../entities";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private storageProvider: CloudinaryProvider,
  ) {}

  //#region UPLOAD IMAGE
  async upload(file: Express.Multer.File): Promise<ServiceResponse<Image>> {
    const uploadResult = await this.storageProvider.upload(file);

    const imageEntity = this.imageRepository.create({
      provider: "cloudinary",
      url: uploadResult.url,
      providerKey: uploadResult.providerKey,
    });

    const image = await this.imageRepository.save(imageEntity);

    return {
      success: true,
      message: "Image uploaded successfully",
      data: image,
    };
  }
  //#endregion

  //#region DELETE IMAGE
  async remove(id: number): Promise<ServiceResponse<null>> {
    const image = await this.imageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Delete from provider
    await this.storageProvider.delete(image.providerKey);

    // Delete from database
    await this.imageRepository.remove(image);

    return {
      success: true,
      message: "Image deleted successfully",
      data: null,
    };
  }
  //#endregion

  //#region FIND IMAGES
  async findOne(id: number): Promise<ServiceResponse<Image>> {
    const image = await this.imageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return {
      success: true,
      message: "Image fetched successfully",
      data: image,
    };
  }
  //#endregion
}
