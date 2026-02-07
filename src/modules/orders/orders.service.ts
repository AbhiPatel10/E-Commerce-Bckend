import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.order.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                customer: true,
                items: { include: { product: true } }
            },
        });
    }

    async updateStatus(id: number, status: OrderStatus) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
}

