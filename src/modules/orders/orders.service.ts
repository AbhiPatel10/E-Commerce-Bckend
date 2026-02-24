import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, Order } from '@prisma/client';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<ServiceResponse<Order[]>> {
        const orders = await this.prisma.order.findMany({
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
        };
    }

    async findOne(id: number): Promise<ServiceResponse<Order>> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } }
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return {
            success: true,
            message: 'Order fetched successfully',
            data: order,
        };
    }

    async updateStatus(id: number, status: OrderStatus): Promise<ServiceResponse<Order>> {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status },
        });

        return {
            success: true,
            message: 'Order status updated successfully',
            data: order,
        };
    }
}

