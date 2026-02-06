import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                skip,
                take: Number(limit),
                include: { category: true },
                orderBy: { createdAt: 'desc' } // Newest first
            }),
            this.prisma.product.count(),
        ]);
        return { data, total, page, limit };
    }

    async findOne(id: number) {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    }

    async create(createProductDto: any) {
        // Ensure category exists? Prisma will throw if not.
        return this.prisma.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price,
                stock: createProductDto.stock,
                images: createProductDto.imageUrl ? [createProductDto.imageUrl] : [],
                category: { connect: { id: createProductDto.categoryId } }
            },
        });
    }

    async update(id: number, updateProductDto: any) {
        const data: any = {
            name: updateProductDto.name,
            description: updateProductDto.description,
            price: updateProductDto.price,
            stock: updateProductDto.stock,
        };

        if (updateProductDto.imageUrl) {
            data.images = [updateProductDto.imageUrl];
        }

        if (updateProductDto.categoryId) {
            data.categoryId = updateProductDto.categoryId;
        }

        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
}

