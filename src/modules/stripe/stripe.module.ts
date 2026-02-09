import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { StripeRawBodyMiddleware } from './middlewares/stripe-raw-body.middleware';

@Module({
    imports: [ConfigModule],
    controllers: [StripeController],
    providers: [StripeService, PrismaService],
    exports: [StripeService],
})
export class StripeModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(StripeRawBodyMiddleware)
            .forRoutes({ path: 'stripe/webhook', method: RequestMethod.POST });
    }
}
