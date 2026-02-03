import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService
    ) { }

    async processCheckout(dto: CheckoutDto) {
        const { sessionId, ...customerDetails } = dto;

        // 1. Validate Cart
        const cart = await this.prisma.cart.findUnique({
            where: { sessionId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 2. Calculate Total & Prepare Order Items
        let totalAmount = 0;
        const orderItemsData: any[] = [];

        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                throw new BadRequestException(`Product ${item.product.name} is out of stock`);
            }
            const itemTotal = Number(item.product.price) * item.quantity;
            totalAmount += itemTotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                priceSnapshot: item.product.price,
            });
        }

        // 3. Create Order (Transaction)
        const order = await this.prisma.$transaction(async (prisma) => {
            // Create Order
            const newOrder = await prisma.order.create({
                data: {
                    totalAmount,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                    customer: {
                        create: customerDetails,
                    },
                },
            });

            return newOrder;
        });

        try {
            // 4. Create Stripe Payment Intent
            const paymentIntent = await this.paymentsService.createPaymentIntent(totalAmount, {
                orderId: order.id,
                orderNumber: order.orderNumber,
            });

            // 5. Update Order with Payment Intent ID
            await this.prisma.order.update({
                where: { id: order.id },
                data: { paymentIntentId: paymentIntent.id },
            });

            return {
                orderNumber: order.orderNumber,
                clientSecret: paymentIntent.client_secret,
                totalAmount,
            };
        } catch (error) {
            throw new InternalServerErrorException('Payment initialization failed');
        }
    }
}
