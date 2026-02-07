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
            connectionLimit: 5,
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
