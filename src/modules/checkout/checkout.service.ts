import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { PaymentsService } from '../payments/payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class CheckoutService {
    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService
    ) { }

    async initiateCheckout(dto: InitiateCheckoutDto): Promise<ServiceResponse<any>> {
        const { sessionId, customerDetails } = dto;

        // 1. Validate Cart
        const cart = await this.prisma.cart.findUnique({
            where: { sessionId },
            include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        // 2. Calculate Total & Prepare Metadata
        let totalAmount = 0;
        const cartItemsSnapshot: any[] = [];

        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                throw new BadRequestException(`Product ${item.product.name} is out of stock`);
            }
            const itemTotal = Number(item.product.price) * item.quantity;
            totalAmount += itemTotal;

            cartItemsSnapshot.push({
                productId: item.productId,
                quantity: item.quantity,
                priceSnapshot: item.product.price,
            });
        }

        // 3. Create Stripe Payment Intent FIRST
        // We need to create intent to get ID, but good practice is to creaet DB record first or same time.
        // Let's create Stripe Intent first to get ID, then save to DB.

        // Metadata for Order Reconstruction
        const metadata = {
            customerDetails: JSON.stringify(customerDetails),
            cartItems: JSON.stringify(cartItemsSnapshot),
            sessionId: sessionId,
        };

        try {
            const paymentIntent = await this.paymentsService.createPaymentIntent(totalAmount, metadata);

            // 4. Create Payment Record (No Order Yet)
            await this.prisma.payment.create({
                data: {
                    stripePaymentId: paymentIntent.id,
                    amount: totalAmount,
                    currency: 'usd',
                    status: 'PENDING',
                    metadata: metadata,
                    customerEmail: customerDetails.email,
                    orderId: null as any,
                } as Prisma.PaymentUncheckedCreateInput,
            });

            return {
                success: true,
                message: 'Payment initiated',
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    totalAmount,
                }
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to initiate payment: ' + error.message);
        }
    }

    // Deprecated but kept for reference until full switch
    async processCheckout(dto: CheckoutDto): Promise<ServiceResponse<any>> {
        // ... existing implementation

        const { sessionId, customerDetails } = dto;

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
                success: true,
                message: 'Checkout processed successfully',
                data: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    totalAmount,
                }
            };
        } catch (error) {
            throw new InternalServerErrorException('Payment initialization failed');
        }
    }
}
