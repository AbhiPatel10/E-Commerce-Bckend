import { Controller, Get, Post, Body, Delete, Query, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@Query('sessionId') sessionId: string) {
        if (!sessionId) {
            return {
                success: false,
                message: 'Session ID required',
                data: null
            };
        }
        return this.cartService.getCart(sessionId);
    }

    @Post('add')
    @UsePipes(new ValidationPipe({ transform: true }))
    addToCart(@Body() dto: AddToCartDto) {
        return this.cartService.addToCart(dto);
    }

    @Post('update')
    @UsePipes(new ValidationPipe({ transform: true }))
    updateItem(@Body() dto: UpdateCartItemDto) {
        return this.cartService.updateItem(dto);
    }

    @Delete('remove')
    removeItem(@Query('sessionId') sessionId: string, @Query('productId', ParseIntPipe) productId: number) {
        return this.cartService.removeItem(sessionId, productId);
    }

    @Delete('clear')
    clearCart(@Query('sessionId') sessionId: string) {
        return this.cartService.deleteCart(sessionId);
    }
}
