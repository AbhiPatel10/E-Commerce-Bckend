import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Admin dashboard usage: List all customers (from orders)
    async findAll() {
        return this.prisma.customerDetails.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number) {
        return this.prisma.customerDetails.findUnique({
            where: { id },
            include: { order: true }
        });
    }
}
