import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('create-intent')
    createIntent(@Body() dto: CreatePaymentIntentDto) {
        return this.stripeService.createPaymentIntent(dto.orderId);
    }

    @Post('confirm')
    confirmPayment(@Body() dto: ConfirmPaymentDto) {
        return this.stripeService.confirmPayment(dto.paymentIntentId, dto.orderNumber || '');
    }
}
