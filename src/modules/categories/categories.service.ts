import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../entities";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  //#region CREATE CATEGORY
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ServiceResponse<Category>> {
    const slug = this.generateSlug(createCategoryDto.name);

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
    });

    const savedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: "Category created successfully",
      data: savedCategory,
    };
  }
  //#endregion

  //#region FIND CATEGORIES
  async findAll(): Promise<ServiceResponse<Category[]>> {
    const categories = await this.categoryRepository
      .createQueryBuilder("category")
      .loadRelationCountAndMap("category.productCount", "category.products")
      .getMany();

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  }

  async findOne(id: number): Promise<ServiceResponse<Category>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return {
      success: true,
      message: "Category fetched successfully",
      data: category,
    };
  }
  //#endregion

  //#region UPDATE CATEGORY
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ServiceResponse<Category>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    Object.assign(category, updateCategoryDto);
    if (updateCategoryDto.name) {
      category.slug = this.generateSlug(updateCategoryDto.name);
    }

    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };
  }
  //#endregion

  //#region DELETE CATEGORY
  async remove(id: number): Promise<ServiceResponse<null>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoryRepository.remove(category);

    return {
      success: true,
      message: "Category deleted successfully",
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
