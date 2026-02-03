import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2024-12-18.acacia' as any, // Force cast to avoid version mismatch issues
        });
    }

    async createPaymentIntent(amount: number, metadata: any) {
        try {
            return await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe uses cents
                currency: 'usd',
                metadata,
                automatic_payment_methods: { enabled: true },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create payment intent');
        }
    }

    constructEvent(payload: any, signature: string, secret: string) {
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
