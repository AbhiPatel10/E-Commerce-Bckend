import { Controller, Post, Body, Headers, Req, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('checkout')
    @ApiOperation({ summary: 'Create Payment Intent for Checkout' })
    @ApiResponse({ status: 201, description: 'Payment Intent created' })
    async checkout(@Body('orderId') orderId: number) {
        if (!orderId) {
            throw new BadRequestException('Order ID is required');
        }
        return this.stripeService.createPaymentIntent(orderId);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe Webhook Endpoint' })
    @ApiResponse({ status: 200, description: 'Webhook processed' })
    async webhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
        const rawBody = req.rawBody;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!rawBody) {
            throw new BadRequestException('Raw body not available');
        }

        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET not configured');
        }

        try {
            const event = this.stripeService.constructEvent(rawBody, signature, webhookSecret);
            await this.stripeService.handleWebhookEvent(event);
            return { received: true };
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }

    @Post('refund')
    @ApiOperation({ summary: 'Create Refund' })
    async refund(@Body('paymentId') paymentId: number, @Body('amount') amount?: number, @Body('reason') reason?: string) {
        return this.stripeService.createRefund(paymentId, amount, reason);
    }
}
