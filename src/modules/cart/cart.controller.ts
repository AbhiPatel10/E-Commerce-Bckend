import { Controller, Get, Post, Body, Delete, Param, Patch, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get(':sessionId')
    getCart(@Param('sessionId') sessionId: string) {
        return this.cartService.getCart(sessionId);
    }

    @Post(':sessionId/items')
    @UsePipes(new ValidationPipe({ transform: true }))
    addToCart(@Param('sessionId') sessionId: string, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(sessionId, dto);
    }

    @Patch(':sessionId/items/:productId')
    @UsePipes(new ValidationPipe({ transform: true }))
    updateItem(
        @Param('sessionId') sessionId: string,
        @Param('productId', ParseIntPipe) productId: number,
        @Body() dto: UpdateCartItemDto
    ) {
        return this.cartService.updateItem(sessionId, productId, dto);
    }

    @Delete(':sessionId/items/:productId')
    removeItem(
        @Param('sessionId') sessionId: string,
        @Param('productId', ParseIntPipe) productId: number
    ) {
        return this.cartService.removeItem(sessionId, productId);
    }

    @Delete(':sessionId')
    clearCart(@Param('sessionId') sessionId: string) {
        return this.cartService.deleteCart(sessionId);
    }
}
