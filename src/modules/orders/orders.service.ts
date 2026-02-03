import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async findOne(orderNumber: string) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true,
            },
        });

        if (!order) {
            throw new NotFoundException(`Order #${orderNumber} not found`);
        }

        return order;
    }
}
