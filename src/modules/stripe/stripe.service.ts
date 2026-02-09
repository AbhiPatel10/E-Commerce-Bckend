import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }

        // Use default API version from the installed package
        this.stripe = new Stripe(apiKey);
    }

    // Create Stripe Customer
    async createCustomer(userId: number, email: string, name: string) {
        try {
            const existingCustomer = await this.prisma.stripeCustomer.findUnique({
                where: { userId },
            });

            if (existingCustomer) {
                return existingCustomer;
            }

            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: { userId: userId.toString() },
            });

            return await this.prisma.stripeCustomer.create({
                data: {
                    userId,
                    stripeCustomerId: customer.id,
                },
            });
        } catch (error) {
            this.logger.error(`Error creating customer for user ${userId}: ${error.message}`);
            throw new InternalServerErrorException('Failed to create payment customer');
        }
    }

    // Create Payment Intent
    async createPaymentIntent(orderId: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, items: true, payment: true },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        if (order.payment && order.payment.status === 'SUCCEEDED') {
            throw new BadRequestException('Order already paid');
        }

        const amountInCents = Math.round(Number(order.totalAmount) * 100);

        let customerId: string | undefined;
        if (order.user) {
            const stripeCustomer = await this.createCustomer(order.user.id, order.user.email, order.user.name);
            customerId = stripeCustomer.stripeCustomerId;
        }

        // Reuse existing pending payment intent
        if (order.payment && order.payment.status === 'PENDING' && order.payment.stripePaymentId) {
            try {
                const existingIntent = await this.stripe.paymentIntents.retrieve(order.payment.stripePaymentId);
                if (existingIntent.status !== 'canceled') {
                    return {
                        clientSecret: existingIntent.client_secret,
                        paymentIntentId: existingIntent.id,
                    };
                }
            } catch (e) {
                // Ignore error and create new one
            }
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                customer: customerId,
                metadata: {
                    orderId: orderId.toString(),
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            await this.prisma.payment.upsert({
                where: { orderId },
                create: {
                    orderId,
                    stripePaymentId: paymentIntent.id,
                    amount: order.totalAmount,
                    currency: 'usd',
                    status: 'PENDING',
                },
                update: {
                    stripePaymentId: paymentIntent.id,
                    status: 'PENDING',
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        } catch (error) {
            this.logger.error(`Error creating payment intent for order ${orderId}: ${error.message}`);
            throw new InternalServerErrorException('Failed to initialize payment');
        }
    }

    // Confirm Payment (Simulation)
    async confirmPayment(paymentIntentId: string, orderNumber: string) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: { payment: true },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // In a real scenario, we would confirm via Stripe API or rely on webhooks.
        // For simulation, we manually update the status.

        await this.prisma.$transaction([
            this.prisma.payment.updateMany({
                where: { stripePaymentId: paymentIntentId },
                data: { status: 'SUCCEEDED' },
            }),
            this.prisma.order.update({
                where: { id: order.id },
                data: { status: 'PAID' },
            }),
        ]);

        return { success: true, message: 'Payment confirmed successfully' };
    }

    // Handle Refund
    async createRefund(paymentId: number, amount?: number, reason?: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment || !payment.stripePaymentId) {
            throw new BadRequestException('Payment not found');
        }

        try {
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: payment.stripePaymentId,
                reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
            };

            if (amount) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundParams);

            await this.prisma.refund.create({
                data: {
                    paymentId,
                    stripeRefundId: refund.id,
                    amount: amount ? Number(amount) : Number(payment.amount),
                    status: refund.status || 'pending',
                    reason,
                },
            });

            return refund;
        } catch (error) {
            this.logger.error(`Refund failed for payment ${paymentId}: ${error.message}`);
            throw new InternalServerErrorException('Refund failed');
        }
    }

    // Webhook Event Construction
    constructEvent(payload: Buffer, signature: string, secret: string): Stripe.Event {
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, secret);
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException('Webhook signature verification failed');
        }
    }

    // Handle Webhook Events
    async handleWebhookEvent(event: Stripe.Event) {
        const existingEvent = await this.prisma.stripeEvent.findUnique({
            where: { id: event.id },
        });

        if (existingEvent) {
            this.logger.log(`Event ${event.id} already processed`);
            return;
        }

        await this.prisma.stripeEvent.create({
            data: {
                id: event.id,
                type: event.type,
            },
        });

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
                break;
            default:
                this.logger.log(`Unhandled event type ${event.type}`);
        }
    }

    private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
        const orderId = Number(paymentIntent.metadata.orderId);

        // Scenario A: Order already exists (Legacy or created via other means)
        if (orderId) {
            this.logger.log(`Payment succeeded for existing order ${orderId}`);
            await this.prisma.$transaction([
                this.prisma.payment.updateMany({
                    where: { stripePaymentId: paymentIntent.id },
                    data: { status: 'SUCCEEDED' },
                }),
                this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'PAID' },
                }),
            ]);
            return;
        }

        // Scenario B: Payment First Flow (Create Order now)
        const { customerDetails: customerDetailsStr, cartItems: cartItemsStr, sessionId } = paymentIntent.metadata;

        if (customerDetailsStr && cartItemsStr) {
            this.logger.log(`Creating order for successful payment ${paymentIntent.id}`);
            const customerDetails = JSON.parse(customerDetailsStr);
            const cartItems = JSON.parse(cartItemsStr);

            // Calculate total from snapshot to be safe (or trust metadata amount? Better trust DB or recalc)
            // But we have cartItems snapshot. 
            let totalAmount = 0;
            const orderItemsData = cartItems.map((item: any) => {
                totalAmount += Number(item.priceSnapshot) * item.quantity;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    priceSnapshot: item.priceSnapshot,
                };
            });

            await this.prisma.$transaction(async (prisma) => {
                // 1. Create Order
                const newOrder = await prisma.order.create({
                    data: {
                        totalAmount,
                        status: 'PAID', // Directly PAID
                        paymentIntentId: paymentIntent.id,
                        items: {
                            create: orderItemsData,
                        },
                        customer: {
                            create: customerDetails,
                        },
                    },
                });

                // 2. Link Payment and Update Status
                // payment should already exist from initiateCheckout
                await prisma.payment.update({
                    where: { stripePaymentId: paymentIntent.id },
                    data: {
                        status: 'SUCCEEDED',
                        orderId: newOrder.id,
                    },
                });

                // Optional: Clear Cart?
                if (sessionId) {
                    await prisma.cart.deleteMany({ where: { sessionId } });
                }

                this.logger.log(`Order ${newOrder.id} created successfully for payment ${paymentIntent.id}`);
            });
        } else {
            this.logger.error(`Payment succeeded but missing metadata for order creation: ${paymentIntent.id}`);
        }
    }

    private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
        const orderId = Number(paymentIntent.metadata.orderId);
        if (!orderId) return;

        this.logger.warn(`Payment failed for order ${orderId}`);

        await this.prisma.payment.updateMany({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: 'FAILED' },
        });

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'FAILED' }
        });
    }
}
