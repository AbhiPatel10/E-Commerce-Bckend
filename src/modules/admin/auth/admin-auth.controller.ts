import { Controller, Post, Body } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AdminAuthController {
    constructor(private readonly adminAuthService: AdminAuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Admin login' })
    async login(@Body() adminLoginDto: AdminLoginDto) {
        return this.adminAuthService.login(adminLoginDto);
    }
}
