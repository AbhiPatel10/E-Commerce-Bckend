import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
    constructor(private checkoutService: CheckoutService) { }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    checkout(@Body() dto: CheckoutDto) {
        return this.checkoutService.processCheckout(dto);
    }
}
