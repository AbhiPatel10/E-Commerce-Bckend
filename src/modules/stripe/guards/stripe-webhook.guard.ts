import { Injectable, CanActivate, ExecutionContext, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import { Request } from 'express';

@Injectable()
export class StripeWebhookGuard implements CanActivate {
    constructor(private readonly stripeService: StripeService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const signature = request.headers['stripe-signature'];
        const rawBody = (request as any).rawBody;

        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        if (!rawBody) {
            throw new BadRequestException('Raw body not found');
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            // Log this critical error
            console.error('STRIPE_WEBHOOK_SECRET is not defined');
            throw new InternalServerErrorException('Server configuration error');
        }

        try {
            const event = this.stripeService.constructEvent(
                rawBody,
                signature as string,
                webhookSecret,
            );
            (request as any).stripeEvent = event;
            return true;
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }
}
