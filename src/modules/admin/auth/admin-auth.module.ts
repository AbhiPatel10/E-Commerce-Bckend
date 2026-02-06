import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { DatabaseModule } from '../../../database/database.module';

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({ defaultStrategy: 'admin-jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'admin-secret',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AdminAuthController],
    providers: [AdminAuthService, AdminJwtStrategy],
    exports: [AdminAuthService],
})
export class AdminAuthModule { }
