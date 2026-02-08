import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { Cart } from '@prisma/client';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getCart(sessionId: string): Promise<ServiceResponse<any>> {
        const cart = await this.prisma.cart.findUnique({
            where: { sessionId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        if (!cart) {
            return {
                success: true,
                message: 'Empty cart returned',
                data: { sessionId, items: [], total: 0 }
            };
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        return {
            success: true,
            message: 'Cart fetched successfully',
            data: { ...cart, total }
        };
    }

    async addToCart(sessionId: string, dto: AddToCartDto) {
        const { productId, quantity } = dto;

        // 1. Check Product Stock
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.stock < quantity) throw new BadRequestException('Insufficient stock');

        // 2. Get or Create Cart
        let cart = await this.prisma.cart.findUnique({ where: { sessionId } });
        if (!cart) {
            cart = await this.prisma.cart.create({ data: { sessionId } });
        }

        // 3. Upsert Cart Item
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: productId,
                },
            },
        });

        if (existingItem) {
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    priceSnapshot: product.price,
                },
            });
        }

        return this.getCart(sessionId);
    }

    async updateItem(sessionId: string, productId: number, dto: UpdateCartItemDto) {
        const { quantity } = dto;

        const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
        if (!cart) throw new NotFoundException('Cart not found');

        const item = await this.prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } }
        });
        if (!item) throw new NotFoundException('Item not found in cart');

        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity }
        });

        return this.getCart(sessionId);
    }

    async removeItem(sessionId: string, productId: number) {
        const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
        if (!cart) throw new NotFoundException('Cart not found');

        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        return this.getCart(sessionId);
    }

    async deleteCart(sessionId: string): Promise<ServiceResponse<null>> {
        const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
        if (cart) {
            await this.prisma.cart.delete({ where: { id: cart.id } });
        }
        return {
            success: true,
            message: 'Cart cleared successfully',
            data: null
        };
    }
}
