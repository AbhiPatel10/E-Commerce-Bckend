import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';

@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { }

    @Post('initiate')
    @UsePipes(new ValidationPipe({ transform: true }))
    initiate(@Body() dto: InitiateCheckoutDto) {
        return this.checkoutService.initiateCheckout(dto);
    }

    @Post('create-order')
    @UsePipes(new ValidationPipe({ transform: true }))
    createOrder(@Body() dto: CheckoutDto) {
        return this.checkoutService.processCheckout(dto);
    }
}
