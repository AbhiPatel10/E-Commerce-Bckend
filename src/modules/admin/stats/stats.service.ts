import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const [
            totalSales,
            ordersCount,
            productsCount,
            customersCount,
            recentOrders
        ] = await Promise.all([
            // Total Sales
            this.prisma.order.aggregate({
                where: { status: 'DELIVERED' },
                _sum: { totalAmount: true }
            }),
            // Total Orders
            this.prisma.order.count(),
            // Total Products
            this.prisma.product.count(),
            // Total Customers (Unique emails in orders for now, or total users)
            this.prisma.customerDetails.count({
                select: { email: true },
                // Use distinct email if needed, but Prisma count doesn't directly support count distinct without groupby
            }),
            // Recent Orders
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true
                }
            })
        ]);

        // For customers, let's get actual user count + guest orders unique emails
        const userCount = await this.prisma.user.count();

        return {
            success: true,
            data: {
                totalSales: Number(totalSales._sum.totalAmount || 0),
                ordersCount,
                productsCount,
                customersCount: userCount || customersCount, // Placeholder logic
                recentOrders: recentOrders.map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customerName: order.customer?.fullName || 'N/A',
                    totalAmount: Number(order.totalAmount),
                    status: order.status,
                    createdAt: order.createdAt
                }))
            }
        };
    }
}
