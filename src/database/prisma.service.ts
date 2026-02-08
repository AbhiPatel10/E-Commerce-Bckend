import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const url = new URL(process.env.DATABASE_URL!);
        const adapter = new PrismaMariaDb({
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.substring(1),
            connectionLimit: 2,
        });
        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Failed to connect to database:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
