import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('admin/login')
    async login(@Body() body: any) {
        const { email, password } = body;
        // Simple hardcoded check for demo/admin purposes
        if (email === 'abhipatel.dev@gmail.com' && password === 'password') {
            return {
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: 1,
                    email: 'abhipatel.dev@gmail.com',
                    name: 'Abhi Patel',
                    role: 'ADMIN',
                },
            };
        }
        throw new UnauthorizedException('Invalid credentials');
    }
}
