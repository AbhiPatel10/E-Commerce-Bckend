import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.user.create({ data });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: { role: 'USER' },
            select: { id: true, email: true, name: true, role: true, createdAt: true }, // Exclude password
        });
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, role: true, createdAt: true, orders: true, addresses: true },
        });
    }
}
