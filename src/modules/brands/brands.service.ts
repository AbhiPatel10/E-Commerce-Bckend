import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Brand } from "../../entities";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  //#region CREATE BRAND
  async create(
    createBrandDto: CreateBrandDto,
  ): Promise<ServiceResponse<Brand>> {
    const slug = this.generateSlug(createBrandDto.name);

    const brand = this.brandRepository.create({
      ...createBrandDto,
      slug,
    });

    const savedBrand = await this.brandRepository.save(brand);

    // Refresh to include logo image if any
    const refreshedBrand = await this.brandRepository.findOne({
      where: { id: savedBrand.id },
      relations: ["logoImage"],
    });

    return {
      success: true,
      message: "Brand created successfully",
      data: refreshedBrand!,
    };
  }
  //#endregion

  //#region FIND BRANDS
  async findAll(): Promise<ServiceResponse<Brand[]>> {
    const brands = await this.brandRepository
      .createQueryBuilder("brand")
      .leftJoinAndSelect("brand.logoImage", "logoImage")
      .loadRelationCountAndMap("brand.productCount", "brand.products")
      .getMany();

    return {
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    };
  }

  async findOne(id: number): Promise<ServiceResponse<Brand>> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ["logoImage", "products"],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return {
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    };
  }
  //#endregion

  //#region UPDATE BRAND
  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<ServiceResponse<Brand>> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    Object.assign(brand, updateBrandDto);
    if (updateBrandDto.name) {
      brand.slug = this.generateSlug(updateBrandDto.name);
    }

    const updatedBrand = await this.brandRepository.save(brand);

    // Refresh to include logo image
    const refreshedBrand = await this.brandRepository.findOne({
      where: { id: updatedBrand.id },
      relations: ["logoImage"],
    });

    return {
      success: true,
      message: "Brand updated successfully",
      data: refreshedBrand!,
    };
  }
  //#endregion

  //#region DELETE BRAND
  async remove(id: number): Promise<ServiceResponse<null>> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    await this.brandRepository.remove(brand);

    return {
      success: true,
      message: "Brand deleted successfully",
      data: null,
    };
  }
  //#endregion

  //#region HELPERS
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  //#endregion
}
