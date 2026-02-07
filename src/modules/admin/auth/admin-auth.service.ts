import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(adminLoginDto: AdminLoginDto) {
        const { email, password } = adminLoginDto;

        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'ADMIN'
        };

        return {
            token: this.jwtService.sign(payload),
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: 'ADMIN',
            },
        };
    }

    async validateAdmin(id: number) {
        return this.prisma.admin.findUnique({
            where: { id },
        });
    }
}
