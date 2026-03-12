import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { PaymentsModule } from "../payments/payments.module";
import { Cart, Order, Payment, CustomerDetails } from "../../entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Order, Payment, CustomerDetails]),
    PaymentsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
