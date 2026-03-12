import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { StripeService } from "./stripe.service";
import { StripeController } from "./stripe.controller";
import { StripeRawBodyMiddleware } from "./middlewares/stripe-raw-body.middleware";
import {
  Order,
  OrderItem,
  Payment,
  StripeCustomer,
  StripeEvent,
  Refund,
  Cart,
  Product,
  CustomerDetails,
} from "../../entities";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Payment,
      StripeCustomer,
      StripeEvent,
      Refund,
      Cart,
      Product,
      CustomerDetails,
    ]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StripeRawBodyMiddleware)
      .forRoutes({ path: "stripe/webhook", method: RequestMethod.POST });
  }
}
