import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, Like, In } from "typeorm";
import { Product, Category, Brand, Image, ProductStatus } from "../../entities";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ServiceResponse } from "../../common/interfaces/service-response.interface";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ServiceResponse<Product>> {
    const { imageIds, ...productData } = createProductDto;

    const slug =
      createProductDto.slug ||
      productData.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

    const product = this.productRepository.create({
      ...productData,
      slug,
      status: productData.status as ProductStatus,
    });

    if (imageIds && imageIds.length > 0) {
      product.images = await this.imageRepository.findBy({ id: In(imageIds) });
    }

    const savedProduct = await this.productRepository.save(product);

    return {
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
  ): Promise<ServiceResponse<{ products: Product[]; total: number }>> {
    const skip = (page - 1) * limit;

    const where: any = { status: ProductStatus.ACTIVE };

    if (filters?.category && filters.category !== "All") {
      where.category = { name: filters.category };
    }

    if (filters?.brand && filters.brand !== "All") {
      where.brand = { name: filters.brand };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const min = Number(filters.minPrice);
      const max = Number(filters.maxPrice);

      if (!isNaN(min) && !isNaN(max)) {
        where.price = Between(min, max);
      } else if (!isNaN(min)) {
        where.price = Between(min, 999999999);
      } else if (!isNaN(max)) {
        where.price = Between(0, max);
      }
    }

    if (filters?.search) {
      where.name = Like(`%${filters.search}%`);
      // Note: TypeORM doesn't easily support OR across relations in a single where object.
      // For complex OR conditions, a QueryBuilder would be better, but we aim for minimal complexity first.
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: Number(limit),
      relations: ["images", "category", "brand"],
      order: { createdAt: "DESC" },
    });

    return {
      success: true,
      message: "Products fetched successfully",
      data: { products, total },
    };
  }

  async findOne(id: number): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["images", "category", "brand"],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      success: true,
      message: "Product fetched successfully",
      data: product,
    };
  }

  async findBySlug(slug: string): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ["images", "category", "brand"],
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return {
      success: true,
      message: "Product fetched successfully",
      data: product,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const { imageIds, ...productData } = updateProductDto;

    let slug = updateProductDto.slug;
    if (!slug && productData.name) {
      slug = productData.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    Object.assign(product, productData);
    if (slug) product.slug = slug;
    if (productData.status)
      product.status = productData.status as ProductStatus;

    if (imageIds) {
      product.images = await this.imageRepository.findBy({ id: In(imageIds) });
    }

    const updatedProduct = await this.productRepository.save(product);

    // Refresh relations
    const refreshedProduct = await this.productRepository.findOne({
      where: { id: updatedProduct.id },
      relations: ["images", "category", "brand"],
    });

    return {
      success: true,
      message: "Product updated successfully",
      data: refreshedProduct!,
    };
  }

  async remove(id: number): Promise<ServiceResponse<null>> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.remove(product);

    return {
      success: true,
      message: "Product deleted successfully",
      data: null,
    };
  }
}
