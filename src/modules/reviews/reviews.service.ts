import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(createReviewDto: CreateReviewDto) {
        const { productId, ...rest } = createReviewDto;

        // Verify product exists
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.review.create({
            data: {
                productId,
                ...rest,
            },
        });
    }

    async findAllByProduct(productId: number) {
        return this.prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
