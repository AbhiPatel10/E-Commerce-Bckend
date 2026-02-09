import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto): Promise<ServiceResponse<Product>> {
        const { imageIds, ...productData } = createProductDto;

        const slug = createProductDto.slug || productData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const product = await this.prisma.product.create({
            data: {
                ...productData,
                slug,
                images: imageIds ? {
                    connect: imageIds.map(id => ({ id }))
                } : undefined,
            },
            include: {
                images: true,
                category: true,
                brand: true,
            },
        });

        return {
            success: true,
            message: 'Product created successfully',
            data: product,
        };
    }

    async findAll(page: number = 1, limit: number = 10): Promise<ServiceResponse<{ products: Product[], total: number }>> {
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                skip,
                take: Number(limit),
                include: {
                    images: true,
                    category: true,
                    brand: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count(),
        ]);

        return {
            success: true,
            message: 'Products fetched successfully',
            data: { products, total },
        };
    }

    async findOne(id: number): Promise<ServiceResponse<Product>> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                category: true,
                brand: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return {
            success: true,
            message: 'Product fetched successfully',
            data: product,
        };
    }

    async findBySlug(slug: string): Promise<ServiceResponse<Product>> {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                images: true,
                category: true,
                brand: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with slug ${slug} not found`);
        }

        return {
            success: true,
            message: 'Product fetched successfully',
            data: product,
        };
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<ServiceResponse<Product>> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const { imageIds, ...productData } = updateProductDto;

        let slug = updateProductDto.slug;
        if (!slug && productData.name) {
            slug = productData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                ...(slug ? { slug } : {}),
                images: imageIds ? {
                    set: imageIds.map(id => ({ id }))
                } : undefined,
            },
            include: {
                images: true,
                category: true,
                brand: true,
            },
        });

        return {
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        };
    }

    async remove(id: number): Promise<ServiceResponse<null>> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        await this.prisma.product.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Product deleted successfully',
            data: null,
        };
    }
}

